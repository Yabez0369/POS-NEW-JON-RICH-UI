// ═══════════════════════════════════════════════════════════════
// POS FLOW VIEW — Effortless Cashier Machine Experience
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, UserPlus, Pause, FolderOpen, Barcode, ScanBarcode, Check, User } from 'lucide-react'
import { ImgWithFallback } from '@/components/shared'
import { fmt } from '@/lib/utils'
import { NumberPadModal } from '@/components/ui/NumberPadModal'
import { FullKeyboard } from '@/components/ui/FullKeyboard'
import { notify } from '@/components/shared/NotificationCenter'
import { POSItemDetails } from './POSItemDetails'
import './POSFlowTerminal.css'

const STEP_ORDER = ['scan', 'payment', 'processing', 'success']
const STEP_LABELS = { scan: 'Scan Products', payment: 'Select Payment', processing: 'Processing', success: 'Confirmation' }
const STEP_ICONS = {
  scan: (props) => (
    <ScanBarcode size={20} strokeWidth={2.5} {...props} />
  ),
  payment: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  processing: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  success: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="16 12 12 8 8 12" />
      <line x1="12" y1="16" x2="12" y2="8" />
    </svg>
  )
}

export function POSFlowView({
  // Step state
  posStep, setPosStep, completedOrder, cardTapStep,
  goToPayment, backToScan, startNewSale, confirmPayment, simulateCardTap,
  // Card popup
  showCardPopup, setShowCardPopup, cardPopupStep,
  // Cart
  cart, updateQty, updateQtyAbsolute, setCart, search, setSearch, scanMsg,
  filteredProds, getItemDiscount, handleProductClick,
  // Totals
  cartSubtotal, cartTax, couponDiscount, loyaltyDiscount,
  manualDiscountAmount, cartTotal,
  // Payment
  payMethod, setPayMethod,
  cashGiven, setCashGiven, cashGivenNum, cashChange,
  splitCash, setSplitCash, splitCard, setSplitCard,
  // Customer
  selCust, setSelCust, setShowNewCust, setLoyaltyRedeem,
  // More menu actions
  parkBill, parked, recallBill, setShowReprint, setShowBarcodeInput,
  showParkedDropdown, setShowParkedDropdown,
  // Receipt
  showReceipt, setShowReceipt,
  // Processing
  checkoutProcessing,
  // Settings
  settings, t,
  products,
  setShowReturnModal,
}) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [animDir, setAnimDir] = useState('right')
  const searchRef = useRef(null)
  const [lastAddedId, setLastAddedId] = useState(null)
  const [showNumpad, setShowNumpad] = useState(false)
  const [numpadConfig, setNumpadConfig] = useState({ target: null, itemId: null, initialValue: '' })
  const [showFullKeyboard, setShowFullKeyboard] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showDetails, setShowDetails] = useState(null)
  const [showFullItems, setShowFullItems] = useState(false)
  const [showReceiptInfo, setShowReceiptInfo] = useState(false)
  const [printerStatus, setPrinterStatus] = useState(null)
  const receiptRef = useRef(null)

  // Auto-focus search / barcode input
  useEffect(() => {
    if (posStep === 'scan' && searchRef.current) searchRef.current.focus()
  }, [posStep])

  const prevCartLenRef = useRef(0)
  // Track last added item
  useEffect(() => {
    if (cart.length > prevCartLenRef.current && cart.length > 0) {
      const last = cart[0] 
      setLastAddedId(last.id)
      
      const tm = setTimeout(() => setLastAddedId(null), 1500)
      prevCartLenRef.current = cart.length
      return () => clearTimeout(tm)
    }
    prevCartLenRef.current = cart.length
  }, [cart.length])

  // Barcode quick match
  useEffect(() => {
    if (!search.trim() || !products) return
    const s = search.trim().toLowerCase()
    const match = products.find(p => (p.barcode?.toLowerCase() === s) || (p.sku?.toLowerCase() === s))
    if (match) {
      handleProductClick(match)
      setSearch('')
    }
  }, [search, products, handleProductClick])

  const stepIdx = STEP_ORDER.indexOf(posStep)

  const handleGoPayment = () => { setAnimDir('right'); goToPayment() }
  const handleBackToScan = () => { setAnimDir('left'); backToScan() }
  const handleInlineDelete = (itemId) => setCart(prev => prev.filter(i => i.id !== itemId))

  const handlePrint = () => {
    notify('Receipt Printed ✅', 'success')
  }

  // ── RENDER: SCAN STEP ──
  const renderScanStep = () => (
    <div className="pos-scan-step" key="scan">
      <div className="pos-scan-left">
        <div className="pos-scan-hero-zone">
          <div className="pos-scan-main-input-wrap">
            <div className="pos-scan-input-container">
              <div className="pos-scan-icon-large">
                <ScanBarcode size={32} color="#4e49b3ff" strokeWidth={2.5} />
              </div>
              <input
                ref={searchRef}
                className="pos-scan-hero-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={() => { setShowFullKeyboard(true); setIsTyping(true); }}
                placeholder="Scan, Product Name or SKU to add product..."
                autoFocus
                readOnly={showFullKeyboard}
              />
              {search && <button className="pos-scan-hero-clear" onClick={() => { setSearch(''); setIsTyping(false); }}>✕</button>}
            </div>
          </div>
        </div>

        <div className={`pos-scan-workspace ${isTyping ? 'is-typing' : ''}`}>
          <div className="pos-product-section">
            <div className="pos-scan-product-grid-header"><span>Quick Selection</span></div>
            <div className="pos-product-grid">
              {filteredProds.map(p => {
                const disc = getItemDiscount(p)
                const isOOS = p.stock === 0
                return (
                  <div key={p.id} className={`pos-product-card${isOOS ? ' oos' : ''}`} onClick={() => !isOOS && handleProductClick(p)}>
                    {disc > 0 && <div className="pos-product-badge">-{disc}%</div>}
                    <div className="pos-product-card-image">
                      <ImgWithFallback src={p.image_url || p.image} alt={p.name} emoji={p.emoji} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div className="pos-product-card-info">
                      <div className="pos-product-card-name">{p.name}</div>
                      <div className="pos-product-card-bottom">
                        <div className="pos-product-card-price">{fmt(p.price * (1 - disc / 100), settings?.sym)}</div>
                        <div className={`pos-product-card-stock ${p.stock <= 5 ? 'low' : 'ok'}`}>{p.stock}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {isTyping && (
            <div className="pos-keyboard-floating-wrap">
              <FullKeyboard
                t={t}
                initialValue={search}
                isInline={false}
                hidePreview={true}
                onClose={() => { setShowFullKeyboard(false); setIsTyping(false); }}
                onSave={(val) => { setSearch(val); setShowFullKeyboard(false); setIsTyping(false); }}
                onChange={(val) => setSearch(val)}
              />
            </div>
          )}

          <POSItemDetails
            item={showDetails}
            onClose={() => setShowDetails(null)}
            settings={settings}
          />
        </div>
      </div>

      <div className="pos-scan-right">
        <div className="pos-cart-header">
          <div className="pos-cart-title-wrap">
            <div className="pos-cart-title">Cart {cart.length > 0 && <span className="pos-cart-count">{cart.reduce((s, i) => s + i.qty, 0)}</span>}</div>
            {selCust && <div className="pos-active-customer"><User size={14} className="pos-active-customer-icon" style={{ marginRight: 4, color: '#3B82F6' }} />{selCust.name}</div>}
          </div>
          <div className="pos-cart-actions">
            <button className="pos-cart-action-btn" onClick={() => setShowNewCust(true)}>
              Search / Add Customer
            </button>
            <button
              className="pos-cart-action-btn"
              onClick={() => parkBill()}
              disabled={cart.length === 0}
            >
              New Sale
            </button>
            <button
              className="pos-cart-action-btn"
              onClick={() => setShowParkedDropdown(true)}
              disabled={cart.length > 0}
            >
              Recall {parked.length > 0 && <span className="recall-badge">{parked.length}</span>}
            </button>
          </div>
        </div>

        <div className="pos-cart-items">
          {cart.length === 0 ? (
            <div className="pos-cart-empty">
              <div className="pos-cart-empty-visual">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 11 4-7" /><path d="m19 11-4-7" /><path d="M2 11h20" /><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" /><path d="M9 17v1" /><path d="M15 17v1" />
                </svg>
              </div>
              <div className="pos-cart-empty-text">Empty Cart</div>
              <div className="pos-cart-empty-sub">Scan an item to begin</div>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.id}
                className={`pos-cart-item${lastAddedId === item.id ? ' highlighted' : ''}`}
                onClick={() => setShowDetails(item)}
              >
                <div className="pos-cart-item-main">
                  <div className="pos-cart-item-name">{item.name.split('(')[0].trim()}</div>
                </div>
                <div className="pos-cart-qty-zone">
                  <button className="pos-qty-action-btn" onClick={(e) => { e.stopPropagation(); updateQty(item.id, -1) }}>−</button>
                  <span 
                    className={`pos-qty-display${(lastAddedId === item.id || (numpadConfig.itemId === item.id && showNumpad)) ? ' is-active' : ''}`} 
                    onClick={(e) => { e.stopPropagation(); setNumpadConfig({ target: 'qty', itemId: item.id, initialValue: item.qty }); setShowNumpad(true) }}
                  >
                    {item.qty}
                  </span>
                  <button className="pos-qty-action-btn" onClick={(e) => { e.stopPropagation(); updateQty(item.id, 1) }}>+</button>
                </div>
                <button className="pos-cart-delete-btn" onClick={(e) => { e.stopPropagation(); handleInlineDelete(item.id) }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                </button>
                <div className="pos-cart-item-price">{fmt(item.price * (1 - (item.discount || 0) / 100) * item.qty, settings?.sym)}</div>
              </div>
            ))
          )}
        </div>

        <div className="pos-cart-footer">
          <div className="pos-footer-totals">
            <span className="pos-total-label">TOTAL</span>
            <span className="pos-total-value">{fmt(cartTotal, settings?.sym)}</span>
          </div>
          <button className="pos-pay-dominant-btn" disabled={cart.length === 0} onClick={handleGoPayment}>
            {cart.length === 0 ? "Ready for items" : `Pay ${fmt(cartTotal, settings?.sym)}`}
          </button>
        </div>
      </div>
    </div>
  )

  // ── RENDER: PAYMENT STEP ──
  const renderPaymentStep = () => (
    <div className="pos-payment-step" key="payment">
      <div className="pos-payment-left">
        <div className="pos-payment-summary-header">Order Summary</div>
        <div className="pos-payment-summary-list">
          {cart.map(item => (
            <div key={item.id} className="pos-summary-item">
              <div className="pos-summary-item-name">{item.name}</div>
              <div className="pos-summary-item-qty">×{item.qty}</div>
              <div className="pos-summary-item-price">{fmt(item.price * (1 - (item.discount || 0) / 100) * item.qty, settings?.sym)}</div>
            </div>
          ))}
        </div>
        <div className="pos-payment-breakdown-box">
          <div className="pos-breakdown-row"><span>Subtotal</span><span>{fmt(cartSubtotal, settings?.sym)}</span></div>
          <div className="pos-breakdown-row"><span>Tax</span><span>{fmt(cartTax, settings?.sym)}</span></div>
          <div className="pos-breakdown-total"><span>Amount Due</span><span>{fmt(cartTotal, settings?.sym)}</span></div>
        </div>
        <button className="pos-back-to-scan-btn" onClick={handleBackToScan}>← Back to scan</button>
      </div>

      <div className="pos-payment-right">
        <div className="pos-payment-methods-grid">
          {[['Card', '💳'], ['Cash', '💵'], ['Split', '✂️']].map(([m, ic]) => (
            <button key={m} className={`pos-method-choice-btn${payMethod === m ? ' selected' : ''}`} onClick={() => setPayMethod(m)}>
              <span className="method-icon">{ic}</span>
              <span className="method-label">{m}</span>
            </button>
          ))}
        </div>

        <div className="pos-payment-method-details">
          {payMethod === 'Cash' && (
            <div className="pos-cash-flow">
              <div className="pos-cash-input-group">
                <label>Cash Received</label>
                <div
                  className={`pos-cash-input-large ${showNumpad && numpadConfig.target === 'cash' ? 'is-active' : ''}`}
                  onClick={() => { setNumpadConfig({ target: 'cash', initialValue: cashGiven }); setShowNumpad(true) }}
                >
                  <span className="cash-val-text">
                    {cashGiven ? fmt(cashGivenNum, settings?.sym) : "Touch to enter"}
                  </span>
                  {showNumpad && numpadConfig.target === 'cash' && <span className="pos-input-cursor" />}
                </div>
              </div>
              {cashGiven !== '' && (
                <div className="pos-change-display">
                  <div className="change-item">
                    <label>Change Due</label>
                    <div className={`change-val ${cashChange >= 0 ? 'plus' : 'minus'}`}>{cashChange >= 0 ? fmt(cashChange, settings?.sym) : "Insufficient"}</div>
                  </div>
                </div>
              )}
            </div>
          )}
          {payMethod === 'Split' && (
            <div className="pos-split-flow">
              <div className="pos-split-inputs">
                <div
                  className={`split-field ${showNumpad && numpadConfig.target === 'splitCash' ? 'is-active' : ''}`}
                  onClick={() => { setNumpadConfig({ target: 'splitCash', initialValue: splitCash }); setShowNumpad(true) }}
                >
                  <label>Cash</label>
                  <div className="split-val-wrap">
                    <span className="split-val">{fmt(parseFloat(splitCash) || 0, settings?.sym)}</span>
                    {showNumpad && numpadConfig.target === 'splitCash' && <span className="pos-input-cursor" />}
                  </div>
                </div>
                <div
                  className={`split-field ${showNumpad && numpadConfig.target === 'splitCard' ? 'is-active' : ''}`}
                  onClick={() => { setNumpadConfig({ target: 'splitCard', initialValue: splitCard }); setShowNumpad(true) }}
                >
                  <label>Card</label>
                  <div className="split-val-wrap">
                    <span className="split-val">{fmt(parseFloat(splitCard) || 0, settings?.sym)}</span>
                    {showNumpad && numpadConfig.target === 'splitCard' && <span className="pos-input-cursor" />}
                  </div>
                </div>
              </div>
              <div className={`pos-split-status-bar ${Math.abs((parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0) - cartTotal) < 0.01 ? 'ready' : 'await'}`}>
                {Math.abs((parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0) - cartTotal) < 0.01 ? "Ready" : `Remaining: ${fmt(cartTotal - ((parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0)), settings?.sym)}`}
              </div>
            </div>
          )}
          {payMethod === 'Card' && <div className="pos-card-flow-ready"><div className="card-ready-icon">⚡</div><div className="card-ready-text">Ready to transmit</div></div>}
        </div>

        <button className="pos-final-pay-btn" onClick={confirmPayment} disabled={checkoutProcessing || (payMethod === 'Cash' && cashChange < 0)}>
          {checkoutProcessing ? 'Authorizing...' : `Confirm Pay ${fmt(cartTotal, settings?.sym)}`}
        </button>
      </div>

      {showCardPopup && (
        <div className="pos-terminal-overlay">
          <div className="pos-terminal-modal">
            <div className="terminal-header">TERMINAL</div>
            <div className="terminal-amount">{fmt(cartTotal, settings?.sym)}</div>
            {cardPopupStep === 'waiting' ? (
              <div className="terminal-waiting">
                <div className="terminal-ring"></div><div className="terminal-msg">TAP CARD</div>
                <button className="terminal-sim-tap" onClick={simulateCardTap}>Simulate Tap</button>
                <button className="terminal-cancel" onClick={() => setShowCardPopup(false)}>Cancel</button>
              </div>
            ) : cardPopupStep === 'processing' ? (
              <div className="terminal-processing"><div className="terminal-load"></div><div className="terminal-msg">AUTHORIZING...</div></div>
            ) : (
              <div className="terminal-approved"><div className="terminal-check">✓</div><div className="terminal-msg">APPROVED</div></div>
            )}
          </div>
        </div>
      )}
    </div>
  )



  const renderProcessingStep = () => (
    <div className="pos-step-fullscreen-msg"><div className="pos-msg-spinner"></div><div className="pos-msg-title">Processing...</div></div>
  )

  const renderSuccessStep = () => {
    const successOrder = completedOrder || { total: cartTotal, payment: payMethod, items: cart }
    const itemsToShow = successOrder.items || []

    return (
      <div className="pos-success-screen" key="success">
        <div className="pos-success-card">
          {/* Left Panel: Summary */}
          <div className="pos-success-left">
            <div className="pos-success-badge-new">✓</div>
            <div className="pos-success-title">Payment Successful</div>
            <div className="pos-success-amount">{fmt(successOrder.total, settings?.sym)}</div>
            <div className="pos-success-method">Paid via {successOrder.payment}</div>

            <div className="pos-success-divider" />

            <div className="pos-success-actions-secondary">
              <button className="pos-action-btn-small" onClick={handlePrint}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" /></svg>
                Print Receipt
              </button>
              <button className="pos-action-btn-small" onClick={() => setShowReceiptInfo(!showReceiptInfo)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                {showReceiptInfo ? 'Hide Receipt' : 'View Receipt'}
              </button>
              <button className="pos-action-btn-small" onClick={() => notify('Email Share option coming soon', 'info')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2-2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                Email Receipt
              </button>
            </div>

            {printerStatus && (
              <div className={`printer-status-toast ${printerStatus.type}`}>
                {printerStatus.type === 'success' ? '✓ ' : '⚠ '}
                {printerStatus.msg}
              </div>
            )}
          </div>

          {/* Right Panel: Items & Final Cta */}
          <div className="pos-success-right">
            {!showReceiptInfo ? (
              <div className="pos-success-items-preview always-scrollable">
                <div className="preview-top">
                  <div className="preview-label">{successOrder.items?.length || 0} Items</div>
                </div>
                <div className="preview-list">
                  {itemsToShow.map((item, i) => (
                    <div key={i} className="preview-item-detailed">
                      <div className="p-row-top">
                        <span className="p-name">{item.name}</span>
                        <span className="p-price">{fmt(item.price * (1 - (item.discount || 0) / 100) * item.qty, settings?.sym)}</span>
                      </div>
                      <div className="p-row-bottom">
                        <span className="p-qty">×{item.qty}</span>
                        {item.variant_name && <span className="p-var">({item.variant_name})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pos-success-receipt-info">
                <div className="receipt-info-label">Order Details</div>
                <div className="receipt-info-grid">
                  <div className="info-row">
                    <span>Subtotal</span>
                    <span>{fmt(successOrder.subtotal, settings?.sym)}</span>
                  </div>
                  <div className="info-row">
                    <span>Tax</span>
                    <span>{fmt(successOrder.tax, settings?.sym)}</span>
                  </div>
                  <div className="info-divider" />
                  <div className="info-meta">
                    <div className="meta-line">Order: #{successOrder.order_number || successOrder.id}</div>
                    <div className="meta-line">Date: {successOrder.date || new Date().toLocaleString()}</div>
                    <div className="meta-line">Staff: {successOrder.cashierName || 'Cashier User'}</div>
                  </div>
                </div>
              </div>
            )}

            <button className="pos-success-btn-main" onClick={startNewSale}>
              New Sale
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (posStep) {
      case 'scan': return renderScanStep()
      case 'payment': return renderPaymentStep()
      case 'processing': return renderProcessingStep()
      case 'success': return renderSuccessStep()
      default: return renderScanStep()
    }
  }

  return (
    <div className="pos-flow">
      <div className="pos-flow-header">
        <div className="pos-flow-header-left">
          <button className="pos-flow-exit-btn" onClick={() => navigate('/app')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7 7l-7-7 7-7" /></svg>
          </button>
          <div className="pos-flow-path">
            {STEP_ORDER.map((s, i) => {
              const Icon = STEP_ICONS[s]
              const isActive = i === stepIdx
              const isDone = i < stepIdx
              const isFuture = i > stepIdx

              return (
                <div key={s} className="pos-path-item-wrap">
                  <div className={`pos-path-segment-new${isActive ? ' active' : isDone ? ' done' : ''}${isFuture ? ' disabled' : ''}`}>
                    <div className="segment-icon-box">
                      {isDone ? <Check size={14} strokeWidth={3} /> : <Icon />}
                    </div>
                    <span className="segment-label">{STEP_LABELS[s]}</span>
                  </div>
                  {i < STEP_ORDER.length - 1 && <div className="pos-path-divider" />}
                </div>
              )
            })}
          </div>
        </div>
        {scanMsg && <div className={`pos-floating-msg ${scanMsg.includes('❌') ? 'err' : 'ok'}`}>{scanMsg}</div>}
        <div className="pos-flow-header-right">
          {/* Menu Actions moved to Cart Header */}
        </div>
      </div>
      <div className="pos-flow-body">
        <div className={`pos-step-view animate-${animDir}`} key={posStep}>{renderStep()}</div>
      </div>
      {showNumpad && (
        <NumberPadModal t={t} title={numpadConfig.target === 'qty' ? 'Enter Quantity' : 'Enter Amount'}
          initialValue={numpadConfig.initialValue}
          isDecimal={numpadConfig.target !== 'qty'}
          showCurrency={numpadConfig.target !== 'qty'}
          onClose={() => setShowNumpad(false)}
          size="sm"
          position="right"
          offsetX={numpadConfig.target === 'qty' ? -90 : 0}
          offsetY={numpadConfig.target === 'qty' ? 60 : 0}
          hideOverlay={true}
          hidePreview={true}
          onChange={(val) => {
            if (numpadConfig.target === 'qty') updateQtyAbsolute(numpadConfig.itemId, val)
            else if (numpadConfig.target === 'cash') setCashGiven(val)
            else if (numpadConfig.target === 'splitCash') {
              setSplitCash(val); setSplitCard(String(Math.max(0, Math.round((cartTotal - (parseFloat(val) || 0)) * 100) / 100)))
            } else if (numpadConfig.target === 'splitCard') {
              setSplitCard(val); setSplitCash(String(Math.max(0, Math.round((cartTotal - (parseFloat(val) || 0)) * 100) / 100)))
            }
          }}
          onSave={(val) => {
            if (numpadConfig.target === 'qty') updateQtyAbsolute(numpadConfig.itemId, val)
            else if (numpadConfig.target === 'cash') setCashGiven(val)
            else if (numpadConfig.target === 'splitCash') {
              setSplitCash(val); setSplitCard(String(Math.max(0, Math.round((cartTotal - (parseFloat(val) || 0)) * 100) / 100)))
            } else if (numpadConfig.target === 'splitCard') {
              setSplitCard(val); setSplitCash(String(Math.max(0, Math.round((cartTotal - (parseFloat(val) || 0)) * 100) / 100)))
            }
            setShowNumpad(false)
          }}
        />
      )}
      {/* Removed FullKeyboard overlay rendering as it is now inline */}
    </div>
  )
}
