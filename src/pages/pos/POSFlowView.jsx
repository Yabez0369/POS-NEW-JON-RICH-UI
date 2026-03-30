// ═══════════════════════════════════════════════════════════════
// POS FLOW VIEW — Step-Based Guided Cashier Terminal
// Steps: Scan → Payment → Processing → Success
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
}) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [animDir, setAnimDir] = useState('right')
  const searchRef = useRef(null)
  const [lastAddedId, setLastAddedId] = useState(null)

  // Track last added item for highlight
  useEffect(() => {
    if (cart.length > 0) {
      const last = cart[cart.length - 1]
      setLastAddedId(last.id)
      const tm = setTimeout(() => setLastAddedId(null), 1500)
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

  // ── STEP 1: SCAN & CART ──
  const renderScanStep = () => (
    <div className="pos-scan-step" key="scan">
      {/* LEFT: Product Grid */}
      <div className="pos-scan-left">
        <div className="pos-scan-search-wrap">
          <div className="pos-scan-search">
            <span className="pos-scan-search-icon">🔍</span>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Scan barcode or search products..."
              autoFocus
            />
            {search && (
              <button className="pos-scan-search-clear" onClick={() => setSearch('')}>×</button>
            )}
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

      {/* RIGHT: Cart */}
      <div className="pos-scan-right">
        {/* Customer strip */}
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
            Cart {cart.length > 0 && <span className="pos-cart-count">{cart.length}</span>}
          </div>
        </div>

        {/* Cart items */}
        <div className="pos-cart-items">
          {cart.length === 0 ? (
            <div className="pos-cart-empty">
              <div className="pos-cart-empty-icon">🛒</div>
              <div className="pos-cart-empty-text">Cart is empty</div>
              <div className="pos-cart-empty-sub">Scan a barcode or tap a product</div>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={`pos-cart-item${lastAddedId === item.id ? ' highlighted' : ''}`}>
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
                <div className="pos-cart-item-right">
                  <div className="pos-cart-item-total">
                    {fmt(item.price * (1 - (item.discount || 0) / 100) * item.qty, settings?.sym)}
                  </div>
                  <div className="pos-qty-controls">
                    <button className="pos-qty-btn" onClick={e => { e.stopPropagation(); updateQty(item.id, -1) }}>−</button>
                    <span className="pos-qty-value">{item.qty}</span>
                    <button className="pos-qty-btn" onClick={e => { e.stopPropagation(); updateQty(item.id, 1) }}>+</button>
                    <button className="pos-qty-remove" onClick={e => { e.stopPropagation(); setCart(c => c.filter(i => i.id !== item.id)) }}>✕</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with total + CTA */}
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
            Continue to Payment →
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
              Confirm Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── STEP 3: PROCESSING ──
  const renderProcessingStep = () => (
    <div className="pos-processing-step" key="processing">
      <div className="pos-processing-inner">
        {payMethod === 'Card' ? (
          <div className="pos-card-terminal">
            <div style={{ fontSize: 48 }}>💳</div>
            <div className="pos-card-terminal-amount">{fmt(cartTotal, settings?.sym)}</div>
            {cardTapStep === 'waiting' && (
              <>
                <div className="pos-card-terminal-status waiting">Tap / Insert / Swipe</div>
                <button className="pos-card-terminal-tap-btn" onClick={simulateCardTap}>
                  Simulate Customer Tap
                </button>
              </>
            )}
            {cardTapStep === 'processing' && (
              <>
                <div className="pos-card-terminal-spinner" />
                <div className="pos-card-terminal-status processing">Communicating with bank...</div>
              </>
            )}
            {cardTapStep === 'approved' && (
              <>
                <div className="pos-card-terminal-checkmark">✅</div>
                <div className="pos-card-terminal-status approved">Approved</div>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="pos-processing-icon">
              <div className="pos-processing-spinner" />
            </div>
            <div className="pos-processing-title">Processing Payment…</div>
            <div className="pos-processing-sub">Please wait</div>
          </>
        )}
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
            🖨️ Print Receipt
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
      {/* ── Header ── */}
      <div className="pos-flow-header">
        <div className="pos-flow-header-left">
          <button className="pos-flow-home-btn" onClick={() => navigate('/app')}>🏠 Home</button>
          <div className="pos-step-indicator">
            {STEP_ORDER.map((s, i) => (
              <div key={s} className={`pos-step-dot${i === stepIdx ? ' active' : i < stepIdx ? ' done' : ''}`} />
            ))}
            <span className={`pos-step-label active`}>{STEP_LABELS[posStep]}</span>
          </div>
        </div>

        {/* Scan message */}
        {scanMsg && (
          <div className={`pos-scan-msg ${scanMsg.includes('❌') ? 'error' : 'success'}`}>{scanMsg}</div>
        )}

        {/* More menu */}
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
                  <button className="pos-more-menu-item" onClick={() => { setShowReprint(true); setShowMenu(false) }}>🖨️ Reprint Receipt</button>
                )}
                {setShowBarcodeInput && (
                  <button className="pos-more-menu-item" onClick={() => { setShowBarcodeInput(true); setShowMenu(false) }}>📷 Scan Barcode</button>
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

      {/* Keyboard hint */}
      {posStep === 'scan' && (
        <div className="pos-keyboard-hint">
          <kbd>Scan</kbd> to add items · <kbd>Enter</kbd> confirms
        </div>
      )}
    </div>
  )
}
