import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useCashStore } from '@/stores/cashStore'
import { Badge, Spinner } from '@/components/ui'
import { notify } from '@/components/shared'
import { fmt } from '@/lib/utils'
import dayjs from 'dayjs'
import { returnsService, ordersService } from '@/services'
import { isSupabaseConfigured } from '@/lib/supabase'
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
  { id: 1, label: 'Find Order', icon: '🔍' },
  { id: 2, label: 'Select Items', icon: '📦' },
  { id: 3, label: 'Return Type', icon: '🔄' },
  { id: 4, label: 'Confirm', icon: '✅' },
]

function getOrderItems(order) {
  const items = order?.order_items || order?.items || []
  return Array.isArray(items) ? items : []
}

function itemName(i) {
  return i?.product_name || i?.name || 'Unknown'
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
}) => {
  const { t } = useTheme()
  const { currentUser: authUser } = useAuth()
  const user = currentUser || authUser

  const [currentStep, setCurrentStep] = useState(1)
  const [orderSearch, setOrderSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selItemQtys, setSelItemQtys] = useState({})
  const [reasonCode, setReasonCode] = useState('')
  const [refundMethod, setRefundMethod] = useState('original')
  const [processMode, setProcessMode] = useState('return')
  const [processing, setProcessing] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const returnDays = settings?.returnDays ?? 30
  const effectiveSiteId = siteId || 'b0000000-0000-0000-0000-000000000001'

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const isWithinReturnWindow = (orderDate) => {
    if (!orderDate) return true
    const d = dayjs(orderDate).isValid() ? dayjs(orderDate) : dayjs(orderDate, ['DD/MM/YYYY, HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD'])
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
          String(o.order_number || o.id).toLowerCase() === orderSearch.trim().toLowerCase() ||
          String(o.id).toLowerCase() === orderSearch.trim().toLowerCase()
      )

      if (!order && isSupabaseConfigured()) {
        order = await ordersService.fetchOrderByNumber(orderSearch.trim())
      }

      if (order) {
        setSelectedOrder(order)
        const initial = {}
        setSelItemQtys(initial)
        setCurrentStep(2)
      } else {
        notify('Order not found', 'error')
      }
    } catch (err) {
      notify(err?.message || 'Lookup failed', 'error')
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
            if (addAudit) addAudit(user, 'Exchange Processed', 'Returns', `${ret.return_number || ret.id} → Order ${exchangeOrder.order_number || exchangeOrder.id}`)
          }
        } else {
          const origPayment = selectedOrder.payment_method || selectedOrder.payment
          if ((origPayment === 'Cash' || origPayment === 'Split') && refundMethod === 'original' && refundAmount > 0) {
            useCashStore.getState().addMovement('refund', refundAmount, `Refund: ${ret.return_number || ret.id}`, user)
          }
          if (addAudit) addAudit(user, 'Return Processed', 'Returns', `${ret.return_number || ret.id} — ${fmt(refundAmount, settings?.sym)}`)
        }

        setIsSuccess(true)
      }
    } catch (err) {
      notify(err?.message || 'Failed to process return', 'error')
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
    if (current > 0) {
      setItemQty(idx, 0)
    } else {
      setItemQty(idx, max)
    }
  }

  const resetFlow = () => {
    setCurrentStep(1)
    setSelectedOrder(null)
    setOrderSearch('')
    setSelItemQtys({})
    setReasonCode('')
    setRefundMethod('original')
    setProcessMode('return')
    setIsSuccess(false)
  }

  const navigate = useNavigate()

  const handleExit = () => {
    if (onClose) {
      onClose()
    } else {
      navigate('/app/home')
    }
  }

  return (
    <div className="returns-terminal-root">
      <header className="returns-terminal-header">
        <div className="header-left-actions">
          <button className="terminal-exit-btn" onClick={handleExit} title="Exit Returns">✕</button>
          <div className="terminal-title-group">
            <span>TERMINAL</span>
            <h1>RETURNS & EXCHANGES</h1>
          </div>
        </div>

        <div className="terminal-stepper">
          {STEPS.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`terminal-step-dot ${currentStep === s.id ? 'active' : ''} ${currentStep > s.id ? 'done' : ''}`} />
              {currentStep === s.id && <span className="terminal-step-label active">{s.label}</span>}
            </div>
          ))}
        </div>

        <div style={{ width: 48 }} />
      </header>

      <main className="terminal-canvas">
        <div className="terminal-content-wrap">
          
          {isSuccess ? (
            <div className="terminal-success">
              <div className="success-lottie-mock">🎉</div>
              <h2>Return Successful</h2>
              <p>Transaction #{selectedOrder?.order_number || '---'} has been processed.</p>
              <div style={{ display: 'flex', gap: 16, flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button className="terminal-btn-secondary" style={{ padding: '0 48px' }} onClick={() => window.print()}>Print Receipt</button>
                  <button className="terminal-btn-primary" style={{ padding: '0 48px' }} onClick={resetFlow}>New Return</button>
                </div>
                <button 
                  className="terminal-btn-secondary" 
                  style={{ width: '100%', maxWidth: 400, background: 'transparent', border: '1px solid #E2E8F0' }} 
                  onClick={handleExit}
                >
                  Back to Terminal
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentStep === 1 && (
                <div className="lookup-hero">
                  <div className="lookup-icon-ring">🔍</div>
                  <h2 className="lookup-title">Find the Order</h2>
                  <p className="lookup-subtitle">Scan the customer receipt barcode or enter the order number manually to begin.</p>
                  
                  <div className="terminal-search-box">
                    <input
                      className="terminal-search-input"
                      autoFocus
                      placeholder="SCAN OR TYPE ORDER #"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && lookupOrder()}
                    />
                    <button className="search-submit-btn" onClick={lookupOrder} disabled={lookupLoading}>
                      {lookupLoading ? '...' : '→'}
                    </button>
                  </div>

                  <div className="terminal-quick-tools">
                    <div className="tool-card" onClick={() => notify('Recent orders view coming soon', 'info')}>
                      🕒 Recent Orders
                    </div>
                    <div className="tool-card" onClick={() => notify('Customer search coming soon', 'info')}>
                      👤 Find Customer
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && selectedOrder && (
                <div style={{ animation: 'terminalFadeIn 0.4s' }}>
                  <div className="selection-header">
                    <div>
                      <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                        Order #{selectedOrder.order_number || selectedOrder.id}
                      </h2>
                      <p style={{ fontSize: 18, color: '#64748B', fontWeight: 600, marginTop: 8 }}>
                        Tap items customer wishes to return
                      </p>
                    </div>
                    {!withinWindow && <Badge text={`Outside ${returnDays}-day window`} color="red" />}
                  </div>

                  <div className="terminal-item-grid">
                    {items.map((item, idx) => {
                      const returnable = isProductReturnable(item.product_id || item.productId)
                      const selQty = selItemQtys[idx] ?? 0
                      const maxQty = itemQty(item)

                      return (
                        <div
                          key={idx}
                          className={`terminal-return-card ${selQty > 0 ? 'selected' : ''}`}
                          onClick={() => returnable && toggleItem(idx)}
                          style={{ opacity: returnable ? 1 : 0.5 }}
                        >
                          <div className="card-thumb">
                            {item.image_url ? <img src={item.image_url} alt="" /> : '📦'}
                          </div>
                          <div className="card-info">
                            <h3>{itemName(item)}</h3>
                            <p>{fmt(itemPrice(item), settings?.sym)} · {maxQty} qty</p>
                            {!returnable && <Badge text="Non-returnable" color="red" style={{ marginTop: 8 }} />}
                          </div>

                          <div className="card-checkbox">
                            {selQty > 0 ? '✓' : ''}
                          </div>

                          {selQty > 0 && (
                            <div className="card-qty-control" onClick={e => e.stopPropagation()}>
                              <button className="qty-mini-btn" onClick={() => setItemQty(idx, selQty - 1)}>−</button>
                              <span className="qty-display">{selQty}</span>
                              <button className="qty-mini-btn" onClick={() => setItemQty(idx, selQty + 1)}>+</button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div style={{ animation: 'terminalFadeIn 0.4s' }}>
                  <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <h2 style={{ fontSize: 40, fontWeight: 900, color: '#0F172A' }}>Select Return Method</h2>
                    <p style={{ fontSize: 20, color: '#64748B' }}>Choose how to compensate the customer</p>
                  </div>

                  <div className="terminal-giant-grid">
                    <div 
                      className={`giant-type-card ${processMode === 'return' && refundMethod !== 'store_credit' ? 'selected' : ''}`}
                      onClick={() => { setProcessMode('return'); setRefundMethod('original'); }}
                    >
                      <i>💳</i>
                      <div>
                        <h2>Original Refund</h2>
                        <p>Refund to original tender</p>
                      </div>
                    </div>

                    <div 
                      className={`giant-type-card ${processMode === 'exchange' ? 'selected' : ''}`}
                      onClick={() => setProcessMode('exchange')}
                    >
                      <i>🔄</i>
                      <div>
                        <h2>Exchange</h2>
                        <p>Switch for other products</p>
                      </div>
                    </div>

                    <div 
                      className={`giant-type-card ${refundMethod === 'store_credit' ? 'selected' : ''}`}
                      onClick={() => { setProcessMode('return'); setRefundMethod('store_credit'); }}
                    >
                      <i>🎟️</i>
                      <div>
                        <h2>Store Credit</h2>
                        <p>Issue a gift card/credit</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div style={{ animation: 'terminalFadeIn 0.4s', maxWidth: 800, margin: '0 auto' }}>
                   <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0F172A' }}>Final Confirmation</h2>
                  </div>

                  <div className="terminal-summary-card">
                    <div className="summary-items-list">
                      {selectedItems.map(({ item, qty }) => (
                        <div key={item.id} className="summary-line">
                          <div className="item-name-qty">
                            <b>{itemName(item)}</b>
                            <span>{qty} unit(s) @ {fmt(itemPrice(item), settings?.sym)}</span>
                          </div>
                          <div className="line-val">
                             {fmt(itemPrice(item) * (1 - itemDiscount(item) / 100) * qty, settings?.sym)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24 }}>
                      <label style={{ fontSize: 18, fontWeight: 900, color: '#94A3B8' }}>TOTAL TO {processMode === 'exchange' ? 'EXCHANGE' : 'REFUND'}</label>
                      <div style={{ fontSize: 56, fontWeight: 900, color: '#4F46E5', letterSpacing: -2 }}>
                        {fmt(refundAmount, settings?.sym)}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12 }}>Reason for Return</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {REASON_CODES.map(rc => (
                          <button
                            key={rc.value}
                            style={{
                              padding: '12px 24px',
                              borderRadius: 14,
                              border: 'none',
                              background: reasonCode === rc.value ? '#4F46E5' : '#F1F5F9',
                              color: reasonCode === rc.value ? 'white' : '#64748B',
                              fontWeight: 700,
                              fontSize: 15,
                              transition: 'all 0.2s',
                              cursor: 'pointer'
                            }}
                            onClick={() => setReasonCode(rc.value)}
                          >
                            {rc.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {!isSuccess && currentStep > 1 && (
        <footer className="terminal-footer">
          <div className="footer-stats">
            <label>Returning {selectedItems.length} items</label>
            <div className="total-val">{fmt(refundAmount, settings?.sym)}</div>
          </div>

          <div className="footer-actions">
            <button className="terminal-btn-secondary" onClick={() => setCurrentStep(currentStep - 1)}>Back</button>
            
            {currentStep === 2 && (
              <button 
                className="terminal-btn-primary" 
                disabled={selectedItems.length === 0 || hasNonReturnable || !withinWindow}
                onClick={() => setCurrentStep(3)}
              >
                Choose Method →
              </button>
            )}

            {currentStep === 3 && (
              <button className="terminal-btn-primary" onClick={() => setCurrentStep(4)}>Review Summary →</button>
            )}

            {currentStep === 4 && (
              <button className="terminal-btn-primary" onClick={handleProcessReturn} disabled={processing}>
                {processing ? 'Processing...' : `Confirm & Process ${processMode === 'exchange' ? 'Exchange' : 'Refund'}`}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  )
}
