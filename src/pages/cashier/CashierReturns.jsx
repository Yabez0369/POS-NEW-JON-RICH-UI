import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useCashStore } from '@/stores/cashStore'
import { Badge } from '@/components/ui'
import { notify } from '@/components/shared'
import { fmt } from '@/lib/utils'
import dayjs from 'dayjs'
import { returnsService, ordersService } from '@/services'
import { isSupabaseConfigured } from '@/lib/supabase'
import { 
  Search, ArrowLeft, X, Check, Package, RotateCcw, 
  ArrowLeftRight, CreditCard, Ticket, CheckCircle2, 
  Printer, History, UserSearch, ChevronRight, Minus, Plus 
} from 'lucide-react'
import { FullKeyboard } from '@/components/ui/FullKeyboard'
import './CashierReturns.css'

const REASON_CODES = [
  { value: 'damaged', label: 'Damaged' },
  { value: 'wrong_size', label: 'Wrong Size' },
  { value: 'wrong_item', label: 'Wrong Item' },
  { value: 'changed_mind', label: 'Changed Mind' },
  { value: 'not_as_described', label: 'Not as Described' },
  { value: 'other', label: 'Other' },
]

const STEPS = [
  { id: 1, label: 'Find Order', icon: Search },
  { id: 2, label: 'Select Items', icon: Package },
  { id: 3, label: 'Return Type', icon: RotateCcw },
  { id: 4, label: 'Confirmation', icon: CheckCircle2 },
]

function getOrderItems(order) {
  return order?.order_items || order?.items || []
}

function itemName(i) {
  return i?.product_name || i?.name || 'Unknown Item'
}

function itemQty(i) {
  return i?.quantity ?? i?.qty ?? 1
}

function itemPrice(i) {
  return i?.unit_price ?? i?.price ?? 0
}

function itemDiscount(i) {
  return i?.discount_pct ?? i?.discount ?? 0
}

export const CashierReturns = ({
  orders = [],
  setOrders,
  returns = [],
  setReturns,
  products = [],
  setProducts,
  settings,
  addAudit,
  currentUser,
  siteId,
  onClose,
  t,
}) => {
  const { darkMode } = useTheme()
  const { currentUser: authUser } = useAuth()
  const user = currentUser || authUser
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [orderSearch, setOrderSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selItemQtys, setSelItemQtys] = useState({})
  const [reasonCode, setReasonCode] = useState('')
  const [refundMethod, setRefundMethod] = useState('')
  const [processMode, setProcessMode] = useState('')
  const [processing, setProcessing] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showFullKeyboard, setShowFullKeyboard] = useState(false)

  const returnDays = settings?.returnDays ?? 30
  const effectiveSiteId = siteId || 'b0000000-0000-0000-0000-000000000001'

  const isWithinReturnWindow = (orderDate) => {
    if (!orderDate) return true
    const d = dayjs(orderDate)
    return d.isValid() && dayjs().diff(d, 'day') <= returnDays
  }

  const isProductReturnable = (productId) => {
    const p = (products || []).find((pr) => pr.id === productId)
    return p == null || p.returnable !== false
  }

  const lookupOrder = async () => {
    if (!orderSearch?.trim()) return
    setLookupLoading(true)
    try {
      let order = (orders || []).find(
        (o) =>
          String(o.order_number || o.id).toLowerCase() === orderSearch.trim().toLowerCase()
      )
      if (!order && isSupabaseConfigured()) {
        order = await ordersService.fetchOrderByNumber(orderSearch.trim())
      }

      if (order) {
        setSelectedOrder(order)
        setSelItemQtys({})
        setCurrentStep(2)
      } else {
        notify('Order not found. Please check the receipt code.', 'error')
      }
    } catch (err) {
      notify(err?.message || 'Lookup error', 'error')
    } finally {
      setLookupLoading(false)
    }
  }

  const items = useMemo(() => (selectedOrder ? getOrderItems(selectedOrder) : []), [selectedOrder])

  const selectedItems = useMemo(() =>
    items
      .map((it, idx) => ({ item: it, idx, qty: selItemQtys[idx] || 0 }))
      .filter(({ qty }) => qty > 0)
    , [items, selItemQtys])

  const refundAmount = useMemo(() =>
    selectedItems.reduce((s, { item, qty }) => {
      const price = itemPrice(item)
      const disc = itemDiscount(item)
      return s + price * (1 - disc / 100) * qty
    }, 0)
    , [selectedItems])

  const hasNonReturnable = selectedItems.some(({ item }) => !isProductReturnable(item.product_id || item.productId))
  const withinWindow = isWithinReturnWindow(selectedOrder?.created_at || selectedOrder?.date)

  const handleProcessReturn = async () => {
    if (!reasonCode) {
      notify('Please select a reason for the return', 'warning')
      return
    }
    setProcessing(true)
    try {
      const orderId = selectedOrder.id
      const isExchange = processMode === 'exchange'
      const effectiveRefundMethod = isExchange ? 'exchange' : refundMethod

      const returnItems = selectedItems.map(({ item, qty }) => {
        const price = itemPrice(item)
        const disc = itemDiscount(item)
        const lineRefund = price * (1 - disc / 100) * qty
        return {
          productId: item.product_id || item.productId,
          orderItemId: item.id || null,
          product_id: item.product_id || item.productId,
          qty: qty,
          quantity: qty,
          refundAmount: Math.round(lineRefund * 100) / 100,
          restock: true,
        }
      })

      const ret = await returnsService.createReturnWithItems({
        orderId,
        customerId: selectedOrder.customer_id || selectedOrder.customerId || null,
        type: selectedItems.length === items.length ? 'full' : 'partial',
        reasonCode,
        reason: REASON_CODES.find((r) => r.value === reasonCode)?.label || reasonCode || 'Other',
        refundMethod: effectiveRefundMethod,
        items: returnItems,
        processedBy: user?.id,
        siteId: effectiveSiteId,
      })

      if (ret) {
        if (setReturns) setReturns((rs) => [ret, ...(rs || [])])
        if (setProducts) setProducts((ps) =>
          (ps || []).map((p) => {
            const inc = returnItems.find((ri) => (ri.productId || ri.product_id) === p.id)
            return inc ? { ...p, stock: (p.stock ?? 0) + inc.qty } : p
          })
        )

        if (isExchange) {
          const exchangeItems = selectedItems.map(({ item, qty }) => ({
            productId: item.product_id || item.productId,
            product_id: item.product_id || item.productId,
            name: itemName(item),
            qty,
            price: itemPrice(item),
            discount: itemDiscount(item),
          }))
          const subtotal = exchangeItems.reduce((s, i) => s + i.price * (1 - i.discount / 100) * i.qty, 0)
          const taxAmount = Math.round(exchangeItems.reduce((s, i) => { const p = (products || []).find(pr => pr.id === (i.productId || i.product_id)); const lineNet = i.price * (1 - i.discount / 100) * i.qty; return s + lineNet * ((p?.taxPct ?? 20) / 100) }, 0) * 100) / 100
          const total = Math.round((subtotal + taxAmount) * 100) / 100

          const exchangeOrder = await ordersService.createOrderWithItems({
            siteId: effectiveSiteId,
            counterId: user?.counter_id || null,
            cashierId: user?.id,
            customerId: selectedOrder.customer_id || selectedOrder.customerId || null,
            items: exchangeItems,
            subtotal,
            taxAmount,
            discountAmount: 0,
            loyaltyDiscount: 0,
            total,
            paymentMethod: 'Exchange',
            paymentDetails: { exchange_for_return_id: ret.id },
            loyaltyEarned: 0,
            loyaltyUsed: 0,
            manualDiscountPct: 0,
          })

          if (exchangeOrder && setOrders) {
            setOrders((os) => [exchangeOrder, ...(os || [])])
            if (addAudit) addAudit(user, 'Exchange Processed', 'Returns', `${ret.return_number || ret.id}`)
          }
        } else {
          const origPayment = selectedOrder.payment_method || selectedOrder.payment
          if ((origPayment === 'Cash' || origPayment === 'Split') && refundMethod === 'original' && refundAmount > 0) {
            useCashStore.getState().addMovement('refund', refundAmount, `Refund: ${ret.return_number || ret.id}`, user)
          }
          if (addAudit) addAudit(user, 'Return Processed', 'Returns', `${ret.return_number || ret.id}`)
        }
        setIsSuccess(true)
      }
    } catch (err) {
      notify(err?.message || 'Processing failed', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const setItemQty = (idx, qty) => {
    const max = itemQty(items[idx] || {})
    const n = Math.max(0, Math.min(max, parseInt(qty, 10) || 0))
    setSelItemQtys((prev) => (n > 0 ? { ...prev, [idx]: n } : (() => { const { [idx]: _, ...rest } = prev; return rest })()))
  }

  const toggleItem = (idx) => {
    const max = itemQty(items[idx] || {})
    const current = selItemQtys[idx] ?? 0
    setItemQty(idx, current > 0 ? 0 : max)
  }

  const resetFlow = () => {
    setCurrentStep(1); setSelectedOrder(null); setOrderSearch(''); setSelItemQtys({});
    setReasonCode(''); setRefundMethod(''); setProcessMode(''); setIsSuccess(false);
  }

  const handleExit = () => onClose ? onClose() : navigate('/app/home')

  return (
    <div className={`returns-terminal-root ${darkMode ? 'dark' : ''}`}>
      
      <header className="returns-header">
        <div className="header-left">
          <button className="icon-btn exit-btn" onClick={handleExit}><X size={24} /></button>
          <div className="title-stack">
            <span className="eyebrow">Terminal Mode</span>
            <h1>Returns & Exchanges</h1>
          </div>
        </div>

        <nav className="step-tracker">
          {STEPS.map((s, idx) => (
            <div key={s.id} className={`step-item ${currentStep === s.id ? 'active' : ''} ${currentStep > s.id ? 'complete' : ''}`}>
              <div className="step-marker">
                {currentStep > s.id ? <Check size={14} strokeWidth={3} /> : <s.icon size={16} />}
              </div>
              <span className="step-label">{s.label}</span>
              {idx < STEPS.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </nav>
        <div className="header-right" />
      </header>

      <main className="returns-main">
        <div className="canvas-container">
          
          {currentStep === 1 && !isSuccess && (
            <div className="step-view lookup-view">
              <div className="hero-section">
                <div className="hardware-scan-zone">
                  <div className="glow-ring" />
                  <Search size={64} className="hero-icon" />
                </div>
                <h2>Find the Transaction</h2>
                <p>Scan the receipt barcode or type the order number below.</p>
              </div>

              <div className="scan-input-container">
                <input
                  className="hardware-input"
                  placeholder="SCAN ORDER NUMBER"
                  value={orderSearch}
                  onFocus={() => setShowFullKeyboard(true)}
                  onClick={() => setShowFullKeyboard(true)}
                  readOnly={showFullKeyboard}
                  onChange={(e) => setOrderSearch(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && lookupOrder()}
                />
                <button className="scan-submit-btn" onClick={lookupOrder} disabled={lookupLoading}>
                  {lookupLoading ? <div className="spinner" /> : <ChevronRight size={32} />}
                </button>
              </div>

              <div className="quick-action-pills">
                <button className="pill-btn"><History size={18} /> Recent Orders</button>
                <button className="pill-btn"><UserSearch size={18} /> Find Customer</button>
              </div>
            </div>
          )}

          {currentStep === 2 && !isSuccess && selectedOrder && (
            <div className="step-view items-view">
              <div className="section-intro">
                <div className="order-chip">Order #{selectedOrder.order_number || selectedOrder.id}</div>
                <h2>Select items for return</h2>
                <p>Choose products and adjust quantities if necessary.</p>
              </div>

              <div className="returns-item-grid">
                {items.map((item, idx) => {
                  const returnable = isProductReturnable(item.product_id || item.productId)
                  const selQty = selItemQtys[idx] ?? 0
                  const maxQty = itemQty(item)

                  return (
                    <div
                      key={idx}
                      className={`item-return-card ${selQty > 0 ? 'active' : ''} ${!returnable ? 'disabled' : ''}`}
                      onClick={() => returnable && toggleItem(idx)}
                    >
                      <div className="item-select-feedback">
                        <div className="checkbox-ring">
                          {selQty > 0 && <Check size={14} strokeWidth={4} />}
                        </div>
                      </div>
                      
                      <div className="item-visual">
                        {item.image_url ? <img src={item.image_url} alt="" /> : <Package size={32} />}
                      </div>

                      <div className="item-details">
                        <h3>{itemName(item)}</h3>
                        <span className="price-tag">{fmt(itemPrice(item), settings?.sym)}</span>
                        {!returnable && <div className="warning-note">Non-returnable</div>}
                      </div>

                      {selQty > 0 && (
                        <div className="qty-stepper" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setItemQty(idx, selQty - 1)}><Minus size={18} /></button>
                          <span className="qty-val">{selQty}</span>
                          <button onClick={() => setItemQty(idx, selQty + 1)}><Plus size={18} /></button>
                        </div>
                      )}
                      
                      {selQty === 0 && returnable && <div className="qty-badge-max">{maxQty} available</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {currentStep === 3 && !isSuccess && (
            <div className="step-view type-view">
              <div className="section-intro centered">
                <h2>Select Compensation</h2>
                <p>How would you like to handle this return?</p>
              </div>

              <div className="type-selection-cards">
                <button 
                  className={`type-hero-card ${processMode === 'return' && refundMethod === 'original' ? 'active' : ''}`}
                  onClick={() => { setProcessMode('return'); setRefundMethod('original'); setCurrentStep(4); }}
                >
                  <div className="type-icon-box original"><CreditCard size={40} /></div>
                  <div className="type-info">
                    <h3>Original Refund</h3>
                    <p>Process back to original payment method</p>
                  </div>
                  <ChevronRight className="arrow" />
                </button>

                <button 
                  className={`type-hero-card ${processMode === 'exchange' ? 'active' : ''}`}
                  onClick={() => { setProcessMode('exchange'); setRefundMethod('exchange'); setCurrentStep(4); }}
                >
                  <div className="type-icon-box exchange"><ArrowLeftRight size={40} /></div>
                  <div className="type-info">
                    <h3>Exchange</h3>
                    <p>Swap items for new products or size</p>
                  </div>
                  <ChevronRight className="arrow" />
                </button>

                <button 
                  className={`type-hero-card ${refundMethod === 'store_credit' ? 'active' : ''}`}
                  onClick={() => { setProcessMode('return'); setRefundMethod('store_credit'); setCurrentStep(4); }}
                >
                  <div className="type-icon-box credit"><Ticket size={40} /></div>
                  <div className="type-info">
                    <h3>Store Credit</h3>
                    <p>Issue digital credit for future purchase</p>
                  </div>
                  <ChevronRight className="arrow" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && !isSuccess && (
            <div className="step-view confirm-view">
              <div className="confirm-layout">
                <div className="confirm-summary">
                  <div className="summary-header">
                    <span>Summary of Return</span>
                    <div className="giant-total">{fmt(refundAmount, settings?.sym)}</div>
                  </div>

                  <div className="summary-scrollable">
                    {selectedItems.map(({ item, qty }) => (
                      <div key={item.id} className="summary-line">
                        <div className="line-item-info">
                          <span className="name">{itemName(item)}</span>
                          <span className="detail">{qty} unit(s) @ {fmt(itemPrice(item), settings?.sym)}</span>
                        </div>
                        <div className="line-price">{fmt(itemPrice(item) * (1 - itemDiscount(item) / 100) * qty, settings?.sym)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="confirm-logic">
                  <span className="logic-label">Select Return Reason</span>
                  <div className="reason-pill-grid">
                    {REASON_CODES.map(rc => (
                      <button
                        key={rc.value}
                        className={`reason-pill ${reasonCode === rc.value ? 'active' : ''}`}
                        onClick={() => setReasonCode(rc.value)}
                      >
                        {rc.label}
                      </button>
                    ))}
                  </div>

                  <div className="method-preview-chip">
                    Refund via <strong>{processMode === 'exchange' ? 'Exchange' : refundMethod.replace('_', ' ')}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="step-view success-view">
              <div className="success-card">
                <div className="success-anim-box">
                  <div className="party-bg" />
                  <CheckCircle2 size={80} className="check-icon" />
                </div>
                <h2>Refund Processed</h2>
                <div className="success-amount">{fmt(refundAmount, settings?.sym)}</div>
                <p>Transaction completed and recorded successfully.</p>
                
                <div className="success-actions">
                  <button className="primary-cta" onClick={resetFlow}><Plus size={20} /> New Return</button>
                  <div className="secondary-row">
                    <button className="ghost-btn" onClick={() => setShowReceiptModal(true)}><Printer size={18} /> Print Receipt</button>
                    <button className="ghost-btn" onClick={handleExit}><ArrowLeft size={18} /> Terminal Home</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {!isSuccess && currentStep > 1 && (
        <footer className="returns-footer">
          <div className="footer-preview">
            <span className="preview-label">Selected Total</span>
            <span className="preview-val">{fmt(refundAmount, settings?.sym)}</span>
          </div>

          <div className="footer-btns">
            <button className="footer-back-btn" onClick={() => setCurrentStep(currentStep - 1)}>
              <ArrowLeft size={20} /> Back
            </button>
            <button 
              className="footer-primary-btn"
              disabled={selectedItems.length === 0 || processing || hasNonReturnable || !withinWindow}
              onClick={() => {
                if (currentStep === 4) handleProcessReturn()
                else setCurrentStep(currentStep + 1)
              }}
            >
              {processing ? 'Processing...' : currentStep === 4 ? `Process ${processMode === 'exchange' ? 'Exchange' : 'Refund'}` : 'Next Step'}
              <ChevronRight size={20} />
            </button>
          </div>
        </footer>
      )}

      {showReceiptModal && (
        <div className="receipt-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="receipt-container" onClick={e => e.stopPropagation()}>
            <div className="receipt-paper">
              <div className="receipt-header">
                <h3>SCSTIX POS</h3>
                <span>RETURN RECEIPT</span>
                <div className="receipt-meta">
                  <span>TXN: #{selectedOrder?.order_number || '---'}</span>
                  <span>{dayjs().format('DD/MM/YYYY HH:mm')}</span>
                </div>
              </div>
              <div className="receipt-body">
                {selectedItems.map(({ item, qty }, idx) => (
                  <div key={idx} className="receipt-row">
                    <span>{itemName(item)} x{qty}</span>
                    <span>{fmt(itemPrice(item) * (1 - itemDiscount(item) / 100) * qty, settings?.sym)}</span>
                  </div>
                ))}
              </div>
              <div className="receipt-footer">
                <div className="receipt-total">
                  <span>REFUND TOTAL</span>
                  <span>{fmt(refundAmount, settings?.sym)}</span>
                </div>
                <p>Reason: {REASON_CODES.find(r => r.value === reasonCode)?.label || 'Other'}</p>
                <div className="barcode-mock" />
                <p className="thank-you">THANK YOU</p>
              </div>
            </div>
            <button className="modal-close" onClick={() => setShowReceiptModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showFullKeyboard && (
        <FullKeyboard
          initialValue={orderSearch}
          t={t}
          onClose={() => setShowFullKeyboard(false)}
          onSave={(val) => {
            setOrderSearch(val)
            setShowFullKeyboard(false)
            lookupOrder()
          }}
          onChange={(val) => setOrderSearch(val)}
        />
      )}
    </div>
  )
}
