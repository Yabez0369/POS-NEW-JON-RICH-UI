import { useState, useRef } from 'react'
import { ImgWithFallback } from '@/components/shared'
import { Toggle, Select } from '@/components/ui'
import { fmt } from '@/lib/utils'
import { CardTerminal } from './CardTerminal'

const REASON_OPTIONS = [
  { value: 'damaged', label: 'Damaged' },
  { value: 'wrong_size', label: 'Wrong size' },
  { value: 'wrong_item', label: 'Wrong item' },
  { value: 'changed_mind', label: 'Changed mind' },
  { value: 'other', label: 'Other' },
]

export function POSCartPanel({
  cart, updateQty, setCart,
  removeFromCart, removeMode, setRemoveMode, cartSearch, setCartSearch,
  selCust, setSelCust, custSearch, setCustSearch, lookupCustomer, setShowNewCust,
  loyaltyRedeem, setLoyaltyRedeem,
  appliedCoupon, setAppliedCoupon, couponCode, setCouponCode, applyCoupon,
  cartSubtotal, cartTax, couponDiscount, loyaltyDiscount, manualDiscountPct, setManualDiscountPct, manualDiscountAmount,
  cartTotal, pointsEarned,
  payMethod, setPayMethod,
  cashGiven, setCashGiven, cashGivenNum, cashChange,
  cardNum, setCardNum, setCardExp, setCardCvv,
  splitCash, setSplitCash, splitCard, setSplitCard,
  checkout, setShowCustDisplay,
  updateCartItemPrice, user,
  checkoutProcessing,
  settings, t,
  loadedOrderForReturn,
  processReturnFromCart,
  clearReturnMode,
  returnReasonCode,
  setReturnReasonCode,
  returnProcessMode,
  setReturnProcessMode,
  returnRefundMethod,
  setReturnRefundMethod,
}) {
  const [editingPriceId, setEditingPriceId] = useState(null)
  const [editPriceVal, setEditPriceVal] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showDoubleTapHint, setShowDoubleTapHint] = useState(true)
  const [deleteToast, setDeleteToast] = useState(null) // { name, id }

  const handleDoubleTapDelete = (item) => {
    setCart(c => c.filter(i => i.id !== item.id))
    setDeleteToast({ name: item.name, id: item.id })
    clearTimeout(window.__deleteToastTimer)
    window.__deleteToastTimer = setTimeout(() => setDeleteToast(null), 2800)
  }

  const isManager = user?.role === 'admin' || user?.role === 'manager'
  const showExchangeSections = loadedOrderForReturn && returnProcessMode === 'exchange'
  const returnItems = loadedOrderForReturn ? cart.filter(i => i.orderItemId) : []
  const replacementItems = loadedOrderForReturn ? cart.filter(i => !i.orderItemId) : []
  const returnTotal = returnItems.reduce((s, i) => s + (i.price ?? 0) * (1 - (i.discount || 0) / 100) * (i.qty ?? 1), 0)
  const replacementTotal = replacementItems.reduce((s, i) => s + (i.price ?? 0) * (1 - (i.discount || 0) / 100) * (i.qty ?? 1), 0)

  const cartItems = loadedOrderForReturn
    ? (showExchangeSections ? cart : returnItems)
    : cart

  return (
    <div style={{
      flex: '0 0 40%',
      minWidth: 340,
      display: 'flex',
      flexDirection: 'column',
      background: '#FFFFFF',
      borderLeft: '1px solid #E8E9EF',
      boxShadow: '-8px 0 32px rgba(0,0,0,0.04)',
      position: 'relative',
    }} className="pos-right">

      {/* ─── DELETE SNACKBAR ─── */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: deleteToast ? 'translateX(-50%) translateY(0) scale(1)' : 'translateX(-50%) translateY(-60px) scale(0.92)',
        zIndex: 9999,
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        opacity: deleteToast ? 1 : 0,
        pointerEvents: deleteToast ? 'auto' : 'none',
        width: 'calc(100% - 24px)',
        maxWidth: 360,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: 14,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 2px 4px rgba(0,0,0,0.03), 0 8px 24px rgba(99,102,241,0.12), 0 1px 0 inset rgba(255,255,255,0.8)',
          border: '1px solid rgba(99,102,241,0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Left accent */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
            background: 'linear-gradient(180deg, #EF4444, #EF444488)',
            borderRadius: '14px 0 0 14px',
          }} />

          {/* Icon */}
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 3V2.5C5 1.67 5.67 1 6.5 1h3C10.33 1 11 1.67 11 2.5V3M2 4h12M3.5 4l.7 9.2c.08.99.9 1.8 1.9 1.8h3.8c1 0 1.82-.81 1.9-1.8L12.5 4" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: '#1E293B',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {deleteToast?.name}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginTop: 1 }}>
              Removed from cart
            </div>
          </div>

          {/* Done badge */}
          <div style={{
            fontSize: 11, fontWeight: 700, color: '#059669',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: 8,
            padding: '4px 10px',
            whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6.5L5 9L9.5 3.5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Done
          </div>

          {/* Progress bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
            background: '#FEE2E2', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', background: 'linear-gradient(90deg, #EF4444, #EF444440)',
              transformOrigin: 'left',
              animation: deleteToast ? 'notif-progress 2800ms linear forwards' : 'none',
            }} />
          </div>
        </div>
      </div>

      {/* ─── CUSTOMER STRIP ─── */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #F0F0F5', background: '#FAFBFF' }}>
        {selCust ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
            padding: '12px 16px', borderRadius: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 900,
              }}>
                {selCust.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#312E81' }}>{selCust.name}</div>
                <div style={{ fontSize: 12, color: '#6366F1', fontWeight: 700 }}>⭐ {selCust.loyaltyPoints} pts · {selCust.tier}</div>
              </div>
            </div>
            <button
              onClick={() => { setSelCust(null); setLoyaltyRedeem(false) }}
              style={{
                background: '#C7D2FE', color: '#3730A3', border: 'none',
                borderRadius: '50%', width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 900, cursor: 'pointer',
              }}
            >✕</button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewCust(true)}
            style={{
              width: '100%', padding: '13px 16px',
              background: '#FAFBFF',
              border: '2px dashed #C7D2FE',
              borderRadius: 14,
              color: '#6366F1', fontSize: 15, fontWeight: 800,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.borderColor = '#6366F1' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FAFBFF'; e.currentTarget.style.borderColor = '#C7D2FE' }}
          >
            <span style={{ fontSize: 22, fontWeight: 900 }}>+</span> Add Customer
          </button>
        )}
      </div>

      {/* ─── CART HEADER with CANCEL ─── */}
      <div style={{
        padding: '10px 18px',
        borderBottom: '1px solid #F0F0F5',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#FFFFFF',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>
          Cart {cart.length > 0 && <span style={{ background: '#6366F1', color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: 11, marginLeft: 6 }}>{cart.length}</span>}
        </div>

        {/* Cancel button — clears entire cart */}
        {cart.length > 0 && (
          showCancelConfirm ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }}>Clear all?</span>
              <button
                onClick={() => { setCart([]); setShowCancelConfirm(false) }}
                style={{
                  padding: '6px 14px', background: '#EF4444', color: '#fff',
                  border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer',
                }}
              >Yes, Clear</button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                style={{
                  padding: '6px 14px', background: '#F3F4F6', color: '#374151',
                  border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >No</button>
            </div>
          ) : (
            <button
              onClick={() => setShowCancelConfirm(true)}
              style={{
                padding: '8px 16px', background: '#FEF2F2', color: '#DC2626',
                border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              🗑 Cancel Sale
            </button>
          )
        )}
      </div>
  
      {/* ─── DOUBLE TAP HINT ─── */}
      {showDoubleTapHint && cart.length > 0 && !loadedOrderForReturn && (
        <div style={{
          margin: '8px 14px 4px 14px',
          padding: '8px 12px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(99,102,241,0.08))',
          border: '1px solid rgba(99,102,241,0.1)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'fadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 24, height: 24, borderRadius: 7, 
              background: '#EEF2FF', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontSize: 13,
              border: '1px solid #E0E7FF',
            }}>👆</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6366F1' }}>
              Double tap a product to remove it instantly
            </span>
          </div>
          <button
            onClick={() => setShowDoubleTapHint(false)}
            style={{
              background: 'none', color: '#A5B4FC', border: 'none',
              borderRadius: 6, padding: '2px 6px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s', lineHeight: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#6366F1'; e.currentTarget.style.background = '#EEF2FF' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#A5B4FC'; e.currentTarget.style.background = 'none' }}
          >✕</button>
        </div>
      )}

      {/* ─── CART ITEMS ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', WebkitOverflowScrolling: 'touch' }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9CA3AF' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Cart is empty</div>
            <div style={{ fontSize: 13, color: '#C4C4D0' }}>Scan a barcode or tap a product</div>
          </div>
        ) : (
          <>
            {/* Return items section */}
            {loadedOrderForReturn && returnItems.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, padding: '0 4px' }}>↩️ Returning</div>
                {returnItems.map(item => (
                  <CartItem key={item.id} item={item} updateQty={updateQty} setCart={setCart}
                    editingPriceId={editingPriceId} setEditingPriceId={setEditingPriceId}
                    editPriceVal={editPriceVal} setEditPriceVal={setEditPriceVal}
                    updateCartItemPrice={updateCartItemPrice} isManager={isManager}
                    settings={settings} t={t}
                    onDoubleTapDelete={handleDoubleTapDelete} />
                ))}
              </div>
            )}

            {/* Replacement items section */}
            {showExchangeSections && replacementItems.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, padding: '0 4px' }}>↔ Replacement</div>
                {replacementItems.map(item => (
                  <CartItem key={item.id} item={item} updateQty={updateQty} setCart={setCart}
                    editingPriceId={editingPriceId} setEditingPriceId={setEditingPriceId}
                    editPriceVal={editPriceVal} setEditPriceVal={setEditPriceVal}
                    updateCartItemPrice={updateCartItemPrice} isManager={isManager}
                    settings={settings} t={t}
                    onDoubleTapDelete={handleDoubleTapDelete} />
                ))}
              </div>
            )}

            {/* Normal cart items */}
            {!loadedOrderForReturn && cart.map((item, i) => (
              <CartItem key={item.id} item={item} updateQty={updateQty} setCart={setCart}
                removeFromCart={removeFromCart}
                editingPriceId={editingPriceId} setEditingPriceId={setEditingPriceId}
                editPriceVal={editPriceVal} setEditPriceVal={setEditPriceVal}
                updateCartItemPrice={updateCartItemPrice} isManager={isManager}
                isNew={i === cart.length - 1}
                settings={settings} t={t}
                onDoubleTapDelete={handleDoubleTapDelete} />
            ))}
          </>
        )}
      </div>

      {/* ─── TOTALS + PAYMENT ─── */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid #F0F0F5', background: '#FAFBFF' }}>
        {/* Coupon */}
        {appliedCoupon ? (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 10, padding: '8px 12px', marginBottom: 8,
          }}>
            <span style={{ fontSize: 12, color: '#15803D', fontWeight: 800 }}>🎟️ {appliedCoupon.code} — {appliedCoupon.description}</span>
            <button onClick={() => { setAppliedCoupon(null); setCouponCode('') }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 16, fontWeight: 900 }}>✕</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Coupon code"
              style={{ flex: 1, background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 10, padding: '9px 12px', color: '#111827', fontSize: 13, outline: 'none' }}
            />
            <button onClick={applyCoupon} style={{ background: '#6366F1', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>Apply</button>
          </div>
        )}

        {/* Loyalty */}
        {selCust && (selCust.loyaltyPoints || 0) > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '8px 12px' }}>
            <span style={{ fontSize: 12, color: '#92400E', fontWeight: 700 }}>⭐ Redeem {selCust.loyaltyPoints} pts = {fmt(selCust.loyaltyPoints * (settings?.loyaltyValue || 0.01), settings?.sym)}</span>
            <Toggle t={t} value={loyaltyRedeem} onChange={setLoyaltyRedeem} />
          </div>
        )}

        {/* Manager manual discount */}
        {isManager && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF' }}>Manual %</span>
            <input
              type="number" min={0} max={100} step={0.5}
              value={manualDiscountPct ?? 0}
              onChange={e => setManualDiscountPct?.(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
              style={{ width: 60, background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 8, padding: '4px 8px', color: '#111827', fontSize: 13, fontWeight: 700 }}
            />
          </div>
        )}

        {/* Order summary */}
        <div style={{ background: '#F8F9FF', borderRadius: 14, padding: '14px 16px', marginBottom: 10 }}>
          {[
            ['Subtotal', fmt(cartSubtotal, settings?.sym)],
            ['Tax', fmt(cartTax, settings?.sym)],
            couponDiscount > 0 && [`Coupon (${appliedCoupon?.code})`, `-${fmt(couponDiscount, settings?.sym)}`],
            loyaltyDiscount > 0 && ['Loyalty', `-${fmt(loyaltyDiscount, settings?.sym)}`],
            manualDiscountAmount > 0 && ['Discount', `-${fmt(manualDiscountAmount, settings?.sym)}`],
          ].filter(Boolean).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: v.startsWith?.('-') ? '#15803D' : '#6B7280', marginBottom: 6, fontWeight: 600 }}>
              <span>{k}</span><span style={{ fontWeight: 800 }}>{v}</span>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 26, fontWeight: 900, color: '#1A1A2E',
            paddingTop: 10, borderTop: '2px dashed #E0E3FF', marginTop: 6,
            letterSpacing: -0.5,
          }}>
            <span>Total</span>
            <span style={{ color: '#4F46E5' }}>{fmt(cartTotal, settings?.sym)}</span>
          </div>
          {selCust && pointsEarned > 0 && (
            <div style={{ fontSize: 11, color: '#D97706', textAlign: 'right', marginTop: 4, fontWeight: 700 }}>+{pointsEarned} loyalty pts</div>
          )}
        </div>

        {/* Return mode */}
        {loadedOrderForReturn ? (
          <>
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#92400E', marginBottom: 8, textTransform: 'uppercase' }}>↩️ Return / Exchange</div>
              <Select t={t} label="Reason" value={returnReasonCode} onChange={setReturnReasonCode} options={REASON_OPTIONS.map(r => ({ value: r.value, label: r.label }))} />
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {['return', 'exchange'].map(mode => (
                  <button key={mode} onClick={() => setReturnProcessMode(mode)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${returnProcessMode === mode ? '#6366F1' : '#E5E7EB'}`, background: returnProcessMode === mode ? '#EEF2FF' : '#F9FAFB', color: returnProcessMode === mode ? '#4F46E5' : '#6B7280', fontSize: 12, fontWeight: 800, cursor: 'pointer', textTransform: 'capitalize' }}>{mode}</button>
                ))}
              </div>
              {returnProcessMode === 'return' && (
                <Select t={t} label="Refund via" value={returnRefundMethod} onChange={setReturnRefundMethod} options={[{ value: 'original', label: 'Original payment' }, { value: 'store_credit', label: 'Store credit' }]} />
              )}
            </div>
            {showExchangeSections && (
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Return:</span><span style={{ fontWeight: 700 }}>{fmt(returnTotal, settings?.sym)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Replacement:</span><span style={{ fontWeight: 700, color: '#15803D' }}>{fmt(replacementTotal, settings?.sym)}</span></div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={processReturnFromCart}
                disabled={checkoutProcessing || (returnProcessMode === 'exchange' && replacementItems.length === 0)}
                style={{
                  flex: 1, padding: '15px', borderRadius: 14, border: 'none',
                  background: checkoutProcessing ? '#E5E7EB' : '#16A34A',
                  color: checkoutProcessing ? '#9CA3AF' : '#fff',
                  fontSize: 14, fontWeight: 900, cursor: checkoutProcessing ? 'not-allowed' : 'pointer',
                  boxShadow: checkoutProcessing ? 'none' : '0 6px 20px rgba(22,163,74,0.3)',
                }}
              >
                {checkoutProcessing ? 'Processing...' : returnProcessMode === 'exchange'
                  ? `↔ Exchange`
                  : `↩️ Refund ${fmt(returnTotal || cartTotal, settings?.sym)}`}
              </button>
              <button onClick={clearReturnMode} style={{ padding: '15px 16px', background: '#F3F4F6', border: 'none', borderRadius: 14, color: '#374151', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>✕</button>
            </div>
          </>
        ) : (
          <>
            {/* Payment methods */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
              {[['Card', '💳'], ['Cash', '💵'], ['Split', '✂️']].map(([m, ic]) => (
                <button
                  key={m}
                  onClick={() => setPayMethod(m)}
                  style={{
                    padding: '12px 6px', borderRadius: 14, border: 'none',
                    background: payMethod === m ? '#4F46E5' : '#F3F4F6',
                    color: payMethod === m ? '#FFFFFF' : '#6B7280',
                    fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: payMethod === m ? '0 4px 14px rgba(79,70,229,0.35)' : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{ic}</span>
                  {m}
                </button>
              ))}
            </div>

            {/* Cash input */}
            {payMethod === 'Cash' && (
              <div style={{ marginBottom: 8 }}>
                <input
                  value={cashGiven}
                  onChange={e => setCashGiven(e.target.value)}
                  placeholder={`Cash received (${settings?.sym || '£'})`}
                  type="number"
                  style={{ width: '100%', background: '#F3F4F6', border: `2px solid ${cashGiven && cashGivenNum >= cartTotal ? '#86EFAC' : '#E5E7EB'}`, borderRadius: 12, padding: '12px 14px', color: '#111827', fontSize: 16, fontWeight: 800, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }}
                />
                {cashGiven !== '' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
                    {[
                      ['Given', fmt(cashGivenNum, settings?.sym), '#374151'],
                      ['Change', cashChange >= 0 ? fmt(cashChange, settings?.sym) : 'Insuff.', cashChange >= 0 ? '#15803D' : '#DC2626'],
                    ].map(([k, v, c]) => (
                      <div key={k} style={{ background: '#F8F9FF', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700 }}>{k}</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Split input */}
            {payMethod === 'Split' && (
              <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['💵 Cash', splitCash, v => { setSplitCash(v); setSplitCard(String(Math.max(0, Math.round((cartTotal - (parseFloat(v) || 0)) * 100) / 100))) }],
                    ['💳 Card', splitCard, v => { setSplitCard(v); setSplitCash(String(Math.max(0, Math.round((cartTotal - (parseFloat(v) || 0)) * 100) / 100))) }],
                  ].map(([label, val, onChange]) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, marginBottom: 4 }}>{label}</div>
                      <input type="number" value={val} onChange={e => onChange(e.target.value)} placeholder="0.00" style={{ width: '100%', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', color: '#111827', fontSize: 14, fontWeight: 800, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                {(parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0) > 0 && (
                  <div style={{ background: Math.abs((parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0) - cartTotal) < 0.01 ? '#DCFCE7' : '#FEF2F2', borderRadius: 10, padding: '6px 10px', fontSize: 12, fontWeight: 800, color: Math.abs((parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0) - cartTotal) < 0.01 ? '#15803D' : '#DC2626', textAlign: 'center' }}>
                    {Math.abs((parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0) - cartTotal) < 0.01 ? '✓ Balanced' : `Need: ${fmt(cartTotal - ((parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0)), settings?.sym)} more`}
                  </div>
                )}
              </div>
            )}

            {/* PRIMARY CTA */}
            <button
              onClick={checkout}
              disabled={cart.length === 0 || checkoutProcessing}
              style={{
                width: '100%',
                padding: '20px',
                background: cart.length === 0 || checkoutProcessing
                  ? '#E5E7EB'
                  : 'linear-gradient(135deg, #16A34A, #15803D)',
                color: cart.length === 0 || checkoutProcessing ? '#9CA3AF' : '#FFFFFF',
                border: 'none',
                borderRadius: 18,
                fontSize: 20,
                fontWeight: 900,
                cursor: cart.length === 0 || checkoutProcessing ? 'not-allowed' : 'pointer',
                boxShadow: cart.length > 0 && !checkoutProcessing ? '0 10px 30px rgba(22,163,74,0.4)' : 'none',
                transition: 'all 0.2s',
                letterSpacing: -0.5,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}
            >
              <span>
                {cart.length === 0 ? '— Empty Cart —' : checkoutProcessing ? 'Processing...' : `Confirm Payment`}
              </span>
              {cart.length > 0 && !checkoutProcessing && (
                <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.85 }}>
                  {fmt(cartTotal, settings?.sym)} via {payMethod}
                </span>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Cart Item Sub-Component ─── */
function CartItem({
  item, updateQty, setCart, removeFromCart,
  editingPriceId, setEditingPriceId, editPriceVal, setEditPriceVal,
  updateCartItemPrice, isManager, isNew, settings, t, onDoubleTapDelete,
}) {
  const [flashing, setFlashing] = useState(false)
  const lastTapRef = useRef(0)

  const triggerDelete = () => {
    setFlashing(true)
    setTimeout(() => {
      if (onDoubleTapDelete) onDoubleTapDelete(item)
      else setCart(c => c.filter(i => i.id !== item.id))
    }, 200)
  }

  const handleDoubleClick = () => {
    triggerDelete()
  }

  const handleTouchEnd = (e) => {
    // Ignore taps on the qty +/- buttons
    if (e.target.closest('button')) return
    const now = Date.now()
    const gap = now - lastTapRef.current
    if (gap < 300 && gap > 0) {
      e.preventDefault()
      triggerDelete()
    }
    lastTapRef.current = now
  }

  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'center',
      padding: '13px 10px',
      borderRadius: 14,
      background: flashing ? '#FEE2E2' : isNew ? '#F0F4FF' : '#FFFFFF',
      border: `2px solid ${flashing ? '#FCA5A5' : isNew ? '#C7D2FE' : 'transparent'}`,
      marginBottom: 6,
      transition: 'background 0.15s ease, border 0.15s ease, all 0.25s ease',
      cursor: 'pointer',
      userSelect: 'none',
    }}
    onDoubleClick={handleDoubleClick}
    onTouchEnd={handleTouchEnd}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F8FAFF', border: '1px solid #E8E9EF' }}>
        <ImgWithFallback src={item.image_url || item.image} alt={item.name} emoji={item.emoji} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
        {editingPriceId === item.id ? (
          <input
            type="number" step={0.01} min={0} value={editPriceVal}
            onChange={e => setEditPriceVal(e.target.value)}
            onBlur={() => {
              const v = parseFloat(editPriceVal)
              if (!isNaN(v) && v >= 0 && updateCartItemPrice) updateCartItemPrice(item.id, v)
              setEditingPriceId(null)
            }}
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
            autoFocus
            style={{ width: 80, background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '4px 8px', color: '#111827', fontSize: 13, fontWeight: 700, marginTop: 2 }}
          />
        ) : (
          <div
            style={{ fontSize: 12, color: item.discount > 0 ? '#DC2626' : '#6B7280', fontWeight: 700, cursor: isManager ? 'pointer' : 'default', marginTop: 2 }}
            onClick={() => isManager && updateCartItemPrice && (setEditingPriceId(item.id), setEditPriceVal(String(item.price ?? 0)))}
          >
            {item.discount > 0 ? `${fmt(item.price * (1 - item.discount / 100), settings?.sym)} (-${item.discount}%)` : fmt(item.price, settings?.sym)}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#1A1A2E' }}>
          {fmt(item.price * (1 - (item.discount || 0) / 100) * item.qty, settings?.sym)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#F3F4F6', borderRadius: 20, padding: 2 }}>
          <button
            onClick={e => { e.stopPropagation(); updateQty(item.id, -1) }}
            style={{ width: 28, height: 28, borderRadius: 14, border: 'none', background: '#FFFFFF', color: '#374151', cursor: 'pointer', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >−</button>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#1A1A2E', minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
          <button
            onClick={e => { e.stopPropagation(); updateQty(item.id, 1) }}
            style={{ width: 28, height: 28, borderRadius: 14, border: 'none', background: '#FFFFFF', color: '#374151', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >+</button>
          {removeFromCart && (
            <button
              onClick={e => { e.stopPropagation(); setCart(c => c.filter(i => i.id !== item.id)) }}
              style={{ width: 28, height: 28, borderRadius: 14, border: 'none', background: '#FEE2E2', color: '#DC2626', cursor: 'pointer', fontSize: 14, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 2 }}
            >✕</button>
          )}
        </div>
      </div>
    </div>
  )
}
