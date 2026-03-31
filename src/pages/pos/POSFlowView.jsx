// ═══════════════════════════════════════════════════════════════
// POS FLOW VIEW — Step-Based Guided Cashier Terminal
// Steps: Scan → Payment → Processing → Success
// Card payment uses popup overlay instead of full-page step
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImgWithFallback } from '@/components/shared'
import { fmt } from '@/lib/utils'
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
  cart, updateQty, setCart, search, setSearch, scanMsg,
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
  const [itemAddedAnim, setItemAddedAnim] = useState(false)
  const lastTapMap = useRef({})

  // Handle immediate barcode scan matching
  useEffect(() => {
    if (!search.trim() || !products) return
    const s = search.trim().toLowerCase()
    const match = products.find(p => 
      (p.barcode && p.barcode.toLowerCase() === s) || 
      (p.sku && p.sku.toLowerCase() === s)
    )
    if (match) {
      handleProductClick(match)
      setSearch('')
    }
  }, [search, products, handleProductClick])

  // Track last added item for highlight
  useEffect(() => {
    if (cart.length > 0) {
      const last = cart[cart.length - 1]
      setLastAddedId(last.id)
      setItemAddedAnim(true)
      const tm = setTimeout(() => { setLastAddedId(null); setItemAddedAnim(false) }, 1500)
      return () => clearTimeout(tm)
    }
  }, [cart.length])

  // Auto-focus search on scan step
  useEffect(() => {
    if (posStep === 'scan' && searchRef.current) {
      searchRef.current.focus()
    }
  }, [posStep])

  const stepIdx = STEP_ORDER.indexOf(posStep)

  const handleGoPayment = () => {
    setAnimDir('right')
    goToPayment()
  }
  const handleBackToScan = () => {
    setAnimDir('left')
    backToScan()
  }

  // Inline delete handler with animation
  const handleInlineDelete = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId))
  }

  // ── STEP 1: SCAN & CART ──
  const renderScanStep = () => (
    <div className="pos-scan-step" key="scan">
      {/* LEFT: Product Grid / Scan Zone */}
      <div className="pos-scan-left">
        <div className="pos-scan-search-wrap">
          <div className="pos-scan-search-container">
            <div className="pos-scan-status-badge">
              <span className="pos-scan-pulse-dot"></span>
              <span className="pos-scan-status-text">READY TO SCAN</span>
            </div>
            
            <div className="pos-scan-search">
              <span className="pos-scan-search-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7M17 3H19C20.1046 3 21 3.89543 21 5V7M21 17V19C21 20.1046 20.1046 21 19 21H17M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 12H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 7V17" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                </svg>
              </span>
              <input
                ref={searchRef}
                className="pos-scan-search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
                placeholder="Scan barcode or search product..."
                autoFocus
              />
              {search && (
                <button className="pos-scan-search-clear" onClick={() => setSearch('')}>✕</button>
              )}
            </div>
          </div>
        </div>

        <div className="pos-product-grid">
          {filteredProds.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px', color: '#9CA3AF' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>No products found</div>
            </div>
          ) : filteredProds.map(p => {
            const disc = getItemDiscount(p)
            const isOOS = p.stock === 0
            return (
              <div
                key={p.id}
                className={`pos-product-card${isOOS ? ' oos' : ''}`}
                onClick={() => !isOOS && handleProductClick(p)}
              >
                {disc > 0 && <div className="pos-product-badge">-{disc}%</div>}
                {isOOS && <div className="pos-product-oos">OUT</div>}
                <div className="pos-product-card-image">
                  <ImgWithFallback src={p.image_url || p.image} alt={p.name} emoji={p.emoji} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className="pos-product-card-info">
                  <div className="pos-product-card-name">{p.name}</div>
                  <div className="pos-product-card-bottom">
                    <div>
                      {disc > 0 ? (
                        <>
                          <div className="pos-product-card-old-price">{fmt(p.price, settings?.sym)}</div>
                          <div className="pos-product-card-price discounted">{fmt(p.price * (1 - disc / 100), settings?.sym)}</div>
                        </>
                      ) : (
                        <div className="pos-product-card-price">{fmt(p.price, settings?.sym)}</div>
                      )}
                    </div>
                    <div className={`pos-product-card-stock ${p.stock <= 5 ? 'low' : 'ok'}`}>{p.stock}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RIGHT: Cart + Payment Combined */}
      <div className="pos-scan-right">
        {/* Customer strip — compact */}
        <div className="pos-customer-strip">
          {selCust ? (
            <div className="pos-customer-badge">
              <div className="pos-customer-info">
                <div className="pos-customer-avatar">{selCust.name.charAt(0)}</div>
                <div>
                  <div className="pos-customer-name">{selCust.name}</div>
                  <div className="pos-customer-points">⭐ {selCust.loyaltyPoints} pts · {selCust.tier}</div>
                </div>
              </div>
              <button className="pos-customer-remove" onClick={() => { setSelCust(null); setLoyaltyRedeem(false) }}>✕</button>
            </div>
          ) : (
            <button className="pos-add-customer-btn" onClick={() => setShowNewCust(true)}>
              <span style={{ fontSize: 22, fontWeight: 900 }}>+</span> Add Customer
            </button>
          )}
        </div>

        <div className="pos-cart-header">
          <div className="pos-cart-title">
            Cart {cart.length > 0 && <span className="pos-cart-count">{cart.reduce((s, i) => s + i.qty, 0)}</span>}
          </div>
        </div>

        {/* Cart items */}
        <div className="pos-cart-items">
          {cart.length === 0 ? (
            <div className="pos-cart-empty">
              <div className="pos-cart-empty-icon">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="pos-scan-zone-icon">
                  <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7M17 3H19C20.1046 3 21 3.89543 21 5V7M21 17V19C21 20.1046 20.1046 21 19 21H17M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 12H17" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="pos-cart-empty-text">Scan items to begin</div>
              <div className="pos-cart-empty-sub">Point your scanner at a barcode</div>
            </div>
          ) : (
            cart.map(item => (
              <div 
                key={item.id} 
                className={`pos-cart-item${lastAddedId === item.id ? ' highlighted' : ''}`}
                onDoubleClick={() => handleInlineDelete(item.id)}
                onTouchEnd={(e) => {
                  if (e.target.closest('button')) return
                  const now = Date.now()
                  const last = lastTapMap.current[item.id] || 0
                  const gap = now - last
                  if (gap < 300 && gap > 0) {
                    e.preventDefault()
                    handleInlineDelete(item.id)
                  }
                  lastTapMap.current[item.id] = now
                }}
              >
                <div className="pos-cart-item-img">
                  <ImgWithFallback src={item.image_url || item.image} alt={item.name} emoji={item.emoji} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className="pos-cart-item-info">
                  <div className="pos-cart-item-name">{item.name}</div>
                  <div className={`pos-cart-item-unit-price${item.discount > 0 ? ' has-discount' : ''}`}>
                    {item.discount > 0
                      ? `${fmt(item.price * (1 - item.discount / 100), settings?.sym)} (-${item.discount}%)`
                      : fmt(item.price, settings?.sym)}
                  </div>
                </div>

                <div className="pos-qty-controls">
                  <button className="pos-qty-btn" onClick={e => { e.stopPropagation(); updateQty(item.id, -1) }}>−</button>
                  <span className="pos-qty-value">{item.qty}</span>
                  <button className="pos-qty-btn" onClick={e => { e.stopPropagation(); updateQty(item.id, 1) }}>+</button>
                </div>

                <div className="pos-cart-item-right">
                  <div className="pos-cart-item-total">
                    {fmt(item.price * (1 - (item.discount || 0) / 100) * item.qty, settings?.sym)}
                  </div>
                  <button 
                    className="pos-cart-item-delete"
                    onClick={e => { e.stopPropagation(); handleInlineDelete(item.id) }}
                    title="Remove item"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M5 3V2.5C5 1.67 5.67 1 6.5 1h3C10.33 1 11 1.67 11 2.5V3M2 4h12M3.5 4l.7 9.2c.08.99.9 1.8 1.9 1.8h3.8c1 0 1.82-.81 1.9-1.8L12.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Total + Pay CTA — STRONG visual weight */}
        <div className="pos-cart-footer">
          {cart.length > 0 && (
            <div className="pos-cart-total-preview">
              <div>
                <div className="pos-cart-total-label">Total</div>
                <div className="pos-cart-items-count">{cart.reduce((s, i) => s + i.qty, 0)} items</div>
              </div>
              <div className="pos-cart-total-amount">{fmt(cartTotal, settings?.sym)}</div>
            </div>
          )}
          <button
            className="pos-continue-btn"
            disabled={cart.length === 0}
            onClick={handleGoPayment}
          >
            {cart.length === 0 ? (
              <span className="pos-continue-btn-text">Waiting for items…</span>
            ) : (
              <>
                <span className="pos-continue-btn-text">Pay {fmt(cartTotal, settings?.sym)}</span>
                <span className="pos-continue-btn-arrow">→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  // ── STEP 2: PAYMENT ──
  const renderPaymentStep = () => (
    <div className="pos-payment-step" key="payment">
      {/* Left: context cart */}
      <div className="pos-payment-cart">
        <div className="pos-payment-cart-header">Order Summary · {cart.reduce((s, i) => s + i.qty, 0)} items</div>
        <div className="pos-payment-cart-items">
          {cart.map(item => (
            <div key={item.id} className="pos-payment-cart-item">
              <div className="pos-payment-cart-item-name">
                <span className="pos-payment-cart-item-qty">×{item.qty}</span>
                {item.name}
              </div>
              <div className="pos-payment-cart-item-total">
                {fmt(item.price * (1 - (item.discount || 0) / 100) * item.qty, settings?.sym)}
              </div>
            </div>
          ))}
        </div>
        {/* Breakdown */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E8E9EF' }}>
          <div className="pos-payment-breakdown">
            {[
              ['Subtotal', fmt(cartSubtotal, settings?.sym)],
              ['Tax', fmt(cartTax, settings?.sym)],
              couponDiscount > 0 && ['Coupon', `-${fmt(couponDiscount, settings?.sym)}`],
              loyaltyDiscount > 0 && ['Loyalty', `-${fmt(loyaltyDiscount, settings?.sym)}`],
              manualDiscountAmount > 0 && ['Discount', `-${fmt(manualDiscountAmount, settings?.sym)}`],
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} className={`pos-payment-breakdown-row${String(v).startsWith('-') ? ' green' : ''}`}>
                <span>{k}</span><span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Payment panel */}
      <div className="pos-payment-panel">
        <div className="pos-payment-inner" style={{ animation: `fadeSlideUp 0.35s ease` }}>
          {/* Big total */}
          <div className="pos-payment-total-block">
            <div className="pos-payment-total-label">Amount Due</div>
            <div className="pos-payment-total-amount">{fmt(cartTotal, settings?.sym)}</div>
          </div>

          {/* Payment methods */}
          <div className="pos-payment-methods">
            {[['Card', '💳'], ['Cash', '💵']].map(([m, ic]) => (
              <button
                key={m}
                className={`pos-pay-method-btn${payMethod === m ? ' selected' : ''}`}
                onClick={() => setPayMethod(m)}
              >
                <span className="pay-icon">{ic}</span>
                {m}
              </button>
            ))}
            <button
              className={`pos-pay-method-btn split-btn${payMethod === 'Split' ? ' selected' : ''}`}
              onClick={() => setPayMethod('Split')}
            >
              <span className="pay-icon">✂️</span>
              Split Payment
            </button>
          </div>

          {/* Cash input */}
          {payMethod === 'Cash' && (
            <div className="pos-cash-input-section">
              <div className="pos-cash-input-label">Cash Received</div>
              <input
                className={`pos-cash-input${cashGiven && cashGivenNum >= cartTotal ? ' valid' : ''}`}
                value={cashGiven}
                onChange={e => setCashGiven(e.target.value)}
                placeholder={`${settings?.sym || '£'}0.00`}
                type="number"
                autoFocus
              />
              {cashGiven !== '' && (
                <div className="pos-cash-change-grid">
                  <div className="pos-cash-change-box">
                    <div className="pos-cash-change-box-label">Given</div>
                    <div className="pos-cash-change-box-val" style={{ color: '#374151' }}>{fmt(cashGivenNum, settings?.sym)}</div>
                  </div>
                  <div className="pos-cash-change-box">
                    <div className="pos-cash-change-box-label">Change</div>
                    <div className={`pos-cash-change-box-val ${cashChange >= 0 ? 'ok' : 'bad'}`}>
                      {cashChange >= 0 ? fmt(cashChange, settings?.sym) : 'Insufficient'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Split input */}
          {payMethod === 'Split' && (
            <div className="pos-split-section">
              <div className="pos-split-grid">
                <div>
                  <div className="pos-split-label">💵 Cash</div>
                  <input className="pos-split-input" type="number" value={splitCash}
                    onChange={e => { setSplitCash(e.target.value); setSplitCard(String(Math.max(0, Math.round((cartTotal - (parseFloat(e.target.value) || 0)) * 100) / 100))) }}
                    placeholder="0.00" />
                </div>
                <div>
                  <div className="pos-split-label">💳 Card</div>
                  <input className="pos-split-input" type="number" value={splitCard}
                    onChange={e => { setSplitCard(e.target.value); setSplitCash(String(Math.max(0, Math.round((cartTotal - (parseFloat(e.target.value) || 0)) * 100) / 100))) }}
                    placeholder="0.00" />
                </div>
                {(parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0) > 0 && (
                  <div className={`pos-split-status ${Math.abs((parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0) - cartTotal) < 0.01 ? 'balanced' : 'unbalanced'}`}>
                    {Math.abs((parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0) - cartTotal) < 0.01
                      ? '✓ Balanced' : `Need: ${fmt(cartTotal - ((parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0)), settings?.sym)} more`}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pos-payment-actions">
            <button className="pos-back-btn" onClick={handleBackToScan}>← Back</button>
            <button className="pos-confirm-btn" onClick={confirmPayment} disabled={checkoutProcessing}>
              {checkoutProcessing ? 'Processing…' : `Pay ${fmt(cartTotal, settings?.sym)}`}
            </button>
          </div>
        </div>
      </div>

      {/* ── Card Terminal Popup Overlay ── */}
      {showCardPopup && (
        <div className="pos-card-popup-overlay">
          <div className="pos-card-popup-backdrop" />
          <div className="pos-card-popup-container">
            <div className="pos-card-popup">
              {/* Terminal screen */}
              <div className="pos-card-popup-screen">
                <div className="pos-card-popup-logo">💳</div>
                <div className="pos-card-popup-amount">{fmt(cartTotal, settings?.sym)}</div>

                {cardPopupStep === 'waiting' && (
                  <div className="pos-card-popup-waiting">
                    <div className="pos-card-popup-pulse-ring" />
                    <div className="pos-card-popup-instruction">Tap / Insert / Swipe</div>
                    <button className="pos-card-popup-tap-btn" onClick={simulateCardTap}>
                      Simulate Customer Tap
                    </button>
                    <button 
                      className="pos-card-popup-back-btn" 
                      onClick={() => setShowCardPopup(false)}
                    >
                      ← Cancel Transaction
                    </button>
                  </div>
                )}

                {cardPopupStep === 'processing' && (
                  <div className="pos-card-popup-processing">
                    <div className="pos-card-popup-spinner" />
                    <div className="pos-card-popup-status">Communicating with bank...</div>
                  </div>
                )}

                {cardPopupStep === 'approved' && (
                  <div className="pos-card-popup-approved">
                    <div className="pos-card-popup-check">✓</div>
                    <div className="pos-card-popup-approved-text">Approved</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── STEP 3: PROCESSING (for non-card payments only) ──
  const renderProcessingStep = () => (
    <div className="pos-processing-step" key="processing">
      <div className="pos-processing-inner">
        <div className="pos-processing-icon">
          <div className="pos-processing-spinner" />
        </div>
        <div className="pos-processing-title">Processing Payment…</div>
        <div className="pos-processing-sub">Please wait</div>
      </div>
    </div>
  )

  // ── STEP 4: SUCCESS ──
  const renderSuccessStep = () => (
    <div className="pos-success-step" key="success">
      <div className="pos-success-inner">
        <div className="pos-success-check">
          <span className="pos-success-check-icon">✓</span>
        </div>
        <div className="pos-success-title">Payment Successful</div>
        <div className="pos-success-amount">{fmt(completedOrder?.total ?? cartTotal, settings?.sym)}</div>
        <div className="pos-success-payment-badge">
          {completedOrder?.payment === 'Card' ? '💳' : completedOrder?.payment === 'Cash' ? '💵' : '✂️'}
          Paid via {completedOrder?.payment || payMethod}
        </div>
        {completedOrder?.order_number && (
          <div className="pos-success-order-num">Order #{completedOrder.order_number}</div>
        )}
        {completedOrder && (
          <div className="pos-success-summary">
            {[
              ['Items', `${completedOrder.items?.length || 0} products`],
              ['Subtotal', fmt(completedOrder.subtotal, settings?.sym)],
              ['Tax', fmt(completedOrder.tax, settings?.sym)],
              completedOrder.payment === 'Cash' && completedOrder.cashChange != null && ['Change', fmt(completedOrder.cashChange, settings?.sym)],
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} className="pos-success-summary-row"><span>{k}</span><span>{v}</span></div>
            ))}
          </div>
        )}
        <div className="pos-success-actions">
          <button className="pos-print-btn" onClick={() => setShowReceipt(completedOrder)}>
            🖨️ Receipt
          </button>
          <button className="pos-new-sale-btn" onClick={startNewSale}>
            New Sale →
          </button>
        </div>
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
      {/* ── Header — Minimal ── */}
      <div className="pos-flow-header">
        <div className="pos-flow-header-left">
          <button className="pos-flow-home-btn" onClick={() => navigate('/app')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12L12 3l9 9"/><path d="M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10"/>
            </svg>
          </button>
          <div className="pos-step-indicator">
            {STEP_ORDER.map((s, i) => (
              <div key={s} className={`pos-step-dot${i === stepIdx ? ' active' : i < stepIdx ? ' done' : ''}`} />
            ))}
            <span className={`pos-step-label active`}>{STEP_LABELS[posStep]}</span>
          </div>
        </div>

        {/* Scan message — floating notification */}
        {scanMsg && (
          <div className={`pos-scan-msg ${scanMsg.includes('❌') ? 'error' : 'success'}`}>{scanMsg}</div>
        )}

        {/* More menu — Park, Recall, Reprint hidden here */}
        <div style={{ position: 'relative' }}>
          <button
            className={`pos-more-menu-btn${showMenu ? ' open' : ''}`}
            onClick={() => setShowMenu(v => !v)}
          >···</button>
          {showMenu && (
            <>
              <div className="pos-more-menu-backdrop" onClick={() => setShowMenu(false)} />
              <div className="pos-more-menu-dropdown">
                <div className="pos-more-menu-label">Actions</div>
                <button className="pos-more-menu-item" onClick={() => { parkBill(); setShowMenu(false) }}>⏸ Park Sale</button>
                {parked.length > 0 && (
                  <button className="pos-more-menu-item" onClick={() => { setShowParkedDropdown(true); setShowMenu(false) }}>
                    📋 Recall Sale ({parked.length})
                  </button>
                )}
                {setShowReprint && (
                  <button className="pos-more-menu-item" onClick={() => { setShowReprint(true); setShowMenu(false) }}>
                    🖨️ Reprint Receipt
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="pos-flow-body">
        <div className={`pos-step-container enter-${animDir}`} key={posStep}>
          {renderStep()}
        </div>
      </div>
    </div>
  )
}
