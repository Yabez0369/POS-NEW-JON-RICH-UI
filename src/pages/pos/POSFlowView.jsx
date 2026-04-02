// ═══════════════════════════════════════════════════════════════
// POS FLOW VIEW — Effortless Cashier Machine Experience
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImgWithFallback } from '@/components/shared'
import { fmt } from '@/lib/utils'
import { NumberPadModal } from '@/components/ui/NumberPadModal'
import { FullKeyboard } from '@/components/ui/FullKeyboard'
import './POSFlowTerminal.css'

const STEP_LABELS = { scan: 'Scan', payment: 'Pay', processing: 'Process', success: 'Done' }
const STEP_ORDER = ['scan', 'payment', 'processing', 'success']

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
}) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [animDir, setAnimDir] = useState('right')
  const searchRef = useRef(null)
  const [lastAddedId, setLastAddedId] = useState(null)
  const [showNumpad, setShowNumpad] = useState(false)
  const [numpadConfig, setNumpadConfig] = useState({ target: null, itemId: null, initialValue: '' })
  const [showFullKeyboard, setShowFullKeyboard] = useState(false)

  // Auto-focus search / barcode input
  useEffect(() => {
    if (posStep === 'scan' && searchRef.current) searchRef.current.focus()
  }, [posStep])

  // Track last added item
  useEffect(() => {
    if (cart.length > 0) {
      const last = cart[0] // Cart is unshifted in POSTerminal
      setLastAddedId(last.id)
      const tm = setTimeout(() => setLastAddedId(null), 1000)
      return () => clearTimeout(tm)
    }
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

  // ── RENDER: SCAN STEP ──
  const renderScanStep = () => (
    <div className="pos-scan-step" key="scan">
      <div className="pos-scan-left">
        <div className="pos-scan-hero-zone">
          <div className="pos-scan-main-input-wrap">
            <div className="pos-scan-ready-pulse">
              <div className="pulse-1"></div>
              <div className="pulse-2"></div>
              <div className="pulse-3"></div>
            </div>
            <div className="pos-scan-input-container">
              <div className="pos-scan-icon-large">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M7 12h10"/>
                </svg>
              </div>
              <input
                ref={searchRef}
                className="pos-scan-hero-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={() => setShowFullKeyboard(true)}
                placeholder="Ready to scan"
                autoFocus
                readOnly={showFullKeyboard}
              />
              {search && <button className="pos-scan-hero-clear" onClick={() => setSearch('')}>✕</button>}
            </div>
          </div>
        </div>

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
                    <div className="pos-product-card-price">{fmt(p.price * (1 - disc/100), settings?.sym)}</div>
                    <div className={`pos-product-card-stock ${p.stock <= 5 ? 'low' : 'ok'}`}>{p.stock}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="pos-scan-right">
        <div className="pos-cart-header">
          <div className="pos-cart-title">Cart {cart.length > 0 && <span className="pos-cart-count">{cart.reduce((s,i)=>s+i.qty, 0)}</span>}</div>
          {selCust && <div className="pos-active-customer"><div className="pos-active-customer-dot" />{selCust.name}</div>}
        </div>

        <div className="pos-cart-items">
          {cart.length === 0 ? (
            <div className="pos-cart-empty">
              <div className="pos-cart-empty-visual">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M9 17v1"/><path d="M15 17v1"/>
                </svg>
              </div>
              <div className="pos-cart-empty-text">Empty Cart</div>
              <div className="pos-cart-empty-sub">Scan an item to begin</div>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={`pos-cart-item${lastAddedId === item.id ? ' highlighted' : ''}`}>
                <div className="pos-cart-item-main">
                  <div className="pos-cart-item-name">{item.name}</div>
                </div>
                <div className="pos-cart-qty-zone">
                  <button className="pos-qty-action-btn" onClick={(e) => { e.stopPropagation(); updateQty(item.id, -1) }}>−</button>
                  <span className="pos-qty-display" onClick={(e) => { e.stopPropagation(); setNumpadConfig({target:'qty', itemId:item.id, initialValue:item.qty}); setShowNumpad(true)}}>{item.qty}</span>
                  <button className="pos-qty-action-btn" onClick={(e) => { e.stopPropagation(); updateQty(item.id, 1) }}>+</button>
                </div>
                <button className="pos-cart-delete-btn" onClick={(e) => { e.stopPropagation(); handleInlineDelete(item.id) }}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
                <div className="pos-cart-item-price">{fmt(item.price * (1 - (item.discount||0)/100) * item.qty, settings?.sym)}</div>
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
              <div className="pos-summary-item-name">{item.name} <span>× {item.qty}</span></div>
              <div className="pos-summary-item-price">{fmt(item.price * (1 - (item.discount||0)/100) * item.qty, settings?.sym)}</div>
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
                <div className="pos-cash-input-large" onClick={() => { setNumpadConfig({target:'cash', initialValue:cashGiven}); setShowNumpad(true) }}>
                  {cashGiven ? fmt(cashGivenNum, settings?.sym) : "Touch to enter"}
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
                   <div className="split-field" onClick={() => { setNumpadConfig({target:'splitCash', initialValue:splitCash}); setShowNumpad(true) }}>
                     <label>Cash</label><div className="split-val">{fmt(parseFloat(splitCash)||0, settings?.sym)}</div>
                   </div>
                   <div className="split-field" onClick={() => { setNumpadConfig({target:'splitCard', initialValue:splitCard}); setShowNumpad(true) }}>
                     <label>Card</label><div className="split-val">{fmt(parseFloat(splitCard)||0, settings?.sym)}</div>
                   </div>
                </div>
                <div className={`pos-split-status-bar ${Math.abs((parseFloat(splitCash)||0)+(parseFloat(splitCard)||0)-cartTotal)<0.01?'ready':'await'}`}>
                  {Math.abs((parseFloat(splitCash)||0)+(parseFloat(splitCard)||0)-cartTotal)<0.01 ? "Ready" : `Remaining: ${fmt(cartTotal-((parseFloat(splitCash)||0)+(parseFloat(splitCard)||0)), settings?.sym)}`}
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

  const renderSuccessStep = () => (
    <div className="pos-step-fullscreen-msg success">
      <div className="pos-success-badge">✓</div>
      <div className="pos-msg-title">Done</div>
      <div className="pos-msg-amount">{fmt(completedOrder?.total ?? cartTotal, settings?.sym)}</div>
      <div className="pos-success-options">
        <button className="pos-success-btn secondary" onClick={() => setShowReceipt(completedOrder)}>Receipt</button>
        <button className="pos-success-btn primary" onClick={startNewSale}>New Sale</button>
      </div>
    </div>
  )

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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7 7l-7-7 7-7"/></svg>
          </button>
          <div className="pos-flow-path">
            {STEP_ORDER.map((s, i) => (
              <div key={s} className={`pos-path-segment${i === stepIdx ? ' active' : i < stepIdx ? ' done' : ''}`}>
                <span className="segment-label">{STEP_LABELS[s]}</span>
                {i < STEP_ORDER.length - 1 && <span className="segment-arrow">/</span>}
              </div>
            ))}
          </div>
        </div>
        {scanMsg && <div className={`pos-floating-msg ${scanMsg.includes('❌') ? 'err' : 'ok'}`}>{scanMsg}</div>}
        <div className="pos-flow-header-right">
          <button className={`pos-utility-btn${showMenu ? ' open' : ''}`} onClick={() => setShowMenu(v => !v)}>
            <span>More</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
          {showMenu && (
            <>
              <div className="pos-menu-backdrop" onClick={() => setShowMenu(false)} />
              <div className="pos-menu-dropdown">
                <button className="pos-menu-item" onClick={() => { setShowNewCust(true); setShowMenu(false) }}>👤 Add Customer</button>
                <div className="pos-menu-divider" />
                <button className="pos-menu-item" onClick={() => { parkBill(); setShowMenu(false) }} disabled={cart.length === 0}>⏸ Park Sale</button>
                <button className="pos-menu-item" onClick={() => { setShowParkedDropdown(true); setShowMenu(false) }}>📂 Recall Sale {parked.length > 0 && <span className="m-badge">{parked.length}</span>}</button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="pos-flow-body">
        <div className={`pos-step-view animate-${animDir}`} key={posStep}>{renderStep()}</div>
      </div>
      {showNumpad && (
        <NumberPadModal t={t} title="Enter Value" initialValue={numpadConfig.initialValue} isDecimal={numpadConfig.target !== 'qty'} onClose={() => setShowNumpad(false)}
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
      {showFullKeyboard && <FullKeyboard t={t} initialValue={search} onClose={() => setShowFullKeyboard(false)} onSave={(val) => { setSearch(val); setShowFullKeyboard(false) }} onChange={(val) => setSearch(val)} />}
    </div>
  )
}
