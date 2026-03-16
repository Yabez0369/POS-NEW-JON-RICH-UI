import { ImgWithFallback } from '@/components/shared'
import { Toggle } from '@/components/ui'
import { PRODUCT_IMAGES } from '@/lib/seed-data'
import { fmt } from '@/lib/utils'
import { CardTerminal } from './CardTerminal'

export function POSCartPanel({
  cart, updateQty, setVoidItem, setCart,
  selCust, setSelCust, custSearch, setCustSearch, lookupCustomer, setShowNewCust,
  loyaltyRedeem, setLoyaltyRedeem,
  appliedCoupon, setAppliedCoupon, couponCode, setCouponCode, applyCoupon,
  cartSubtotal, cartTax, couponDiscount, loyaltyDiscount, cartTotal, pointsEarned,
  payMethod, setPayMethod,
  cashGiven, setCashGiven, cashGivenNum, cashChange,
  cardNum, setCardNum, setCardExp, setCardCvv,
  splitCash, setSplitCash, splitCard, setSplitCard,
  checkout, setShowCustDisplay,
  settings, t,
}) {
  return (
    <div style={{ width: 'clamp(260px,28vw,340px)', display: 'flex', flexDirection: 'column', background: t.posRight, flexShrink: 0, borderLeft: `1px solid ${t.border}` }} className="pos-right">
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${t.border}`, background: t.bg3 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: t.text3, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 7 }}>Customer</div>
        {selCust ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: t.text }}>👤 {selCust.name}</div>
              <div style={{ fontSize: 11, color: t.yellow }}>⭐ {selCust.loyaltyPoints} pts · {selCust.tier}</div>
            </div>
            <button onClick={() => { setSelCust(null); setLoyaltyRedeem(false) }} style={{ background: t.redBg, border: `1px solid ${t.redBorder}`, color: t.red, borderRadius: 7, padding: '3px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✕</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={custSearch} onChange={e => setCustSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && lookupCustomer()} placeholder="Phone / Name / Email..." style={{ flex: 1, background: t.input, border: `1px solid ${t.border}`, borderRadius: 8, padding: '7px 10px', color: t.text, fontSize: 12, outline: 'none' }} />
            <button onClick={lookupCustomer} style={{ background: t.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Find</button>
            <button onClick={() => setShowNewCust(true)} style={{ background: t.blue, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ New</button>
          </div>
        )}
      </div>

      <div style={{ padding: '6px 14px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13 }}>🏪</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: t.green }}>In-Store Transaction</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 10px', WebkitOverflowScrolling: 'touch' }}>
        {cart.length === 0
          ? <div style={{ textAlign: 'center', padding: '32px 16px', color: t.text3 }}><div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div><div style={{ fontSize: 13, fontWeight: 700 }}>Cart is empty</div><div style={{ fontSize: 12, marginTop: 4, color: t.text4 }}>Tap a product or scan barcode</div></div>
          : cart.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${t.border}` }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: t.bg3 }}>
                <ImgWithFallback src={PRODUCT_IMAGES[item.name]} alt={item.name} emoji={item.emoji} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                <div style={{ fontSize: 10, color: item.discount > 0 ? t.accent : t.green, fontWeight: 800 }}>
                  {item.discount > 0 ? `${fmt(item.price * (1 - item.discount / 100))} (-${item.discount}%)` : fmt(item.price)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => updateQty(item.id, -1)} style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid ${t.border}`, background: t.bg3, color: t.text, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontSize: 13, fontWeight: 900, color: t.text, minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid ${t.border}`, background: t.bg3, color: t.text, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <div style={{ fontSize: 12, fontWeight: 900, color: t.text, minWidth: 50, textAlign: 'right' }}>{fmt(item.price * (1 - (item.discount || 0) / 100) * item.qty)}</div>
              <button onClick={() => setCart(c => c.filter(i => i.id !== item.id))} style={{ background: 'none', border: 'none', color: t.text4, cursor: 'pointer', fontSize: 14, padding: '0 2px' }}>✕</button>
            </div>
          ))}
      </div>

      <div style={{ padding: '8px 14px', borderTop: `1px solid ${t.border}` }}>
        {appliedCoupon
          ? <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 8, padding: '7px 12px' }}>
            <span style={{ fontSize: 12, color: t.green, fontWeight: 800 }}>🎟️ {appliedCoupon.code} — {appliedCoupon.description}</span>
            <button onClick={() => { setAppliedCoupon(null); setCouponCode('') }} style={{ background: 'none', border: 'none', color: t.red, cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
          : <div style={{ display: 'flex', gap: 6 }}>
            <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code" style={{ flex: 1, background: t.input, border: `1px solid ${t.border}`, borderRadius: 8, padding: '7px 10px', color: t.text, fontSize: 12, outline: 'none' }} />
            <button onClick={applyCoupon} style={{ background: t.purple, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Apply</button>
          </div>}

        {selCust && (selCust.loyaltyPoints || 0) > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, background: t.yellowBg, border: `1px solid ${t.yellowBorder}`, borderRadius: 8, padding: '7px 12px' }}>
            <span style={{ fontSize: 12, color: t.yellow, fontWeight: 700 }}>⭐ Redeem {selCust.loyaltyPoints} pts = {fmt(selCust.loyaltyPoints * (settings.loyaltyValue || 0.01))}</span>
            <Toggle t={t} value={loyaltyRedeem} onChange={setLoyaltyRedeem} />
          </div>
        )}

        <div style={{ marginTop: 10 }}>
          {[['Subtotal', fmt(cartSubtotal)], [`VAT (${settings.vatRate}%)`, fmt(cartTax)], couponDiscount > 0 && [`Coupon (${appliedCoupon?.code})`, `-${fmt(couponDiscount)}`], loyaltyDiscount > 0 && ['Loyalty Discount', `-${fmt(loyaltyDiscount)}`]].filter(Boolean).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: v.startsWith?.('-') ? t.green : t.text3, marginBottom: 4 }}><span>{k}</span><span style={{ fontWeight: 700 }}>{v}</span></div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 900, color: t.text, paddingTop: 10, borderTop: `2px solid ${t.border}`, marginTop: 4 }}>
            <span>Total</span><span style={{ color: t.accent }}>{fmt(cartTotal)}</span>
          </div>
          {selCust && pointsEarned > 0 && <div style={{ fontSize: 11, color: t.yellow, textAlign: 'right', marginTop: 3 }}>+{pointsEarned} loyalty pts will be earned</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginTop: 10 }}>
          {[['Card', '💳'], ['Cash', '💵'], ['QR', '📱'], ['Split', '✂️']].map(([m, ic]) => (
            <button key={m} onClick={() => setPayMethod(m)} style={{ padding: '7px 4px', borderRadius: 8, border: `2px solid ${payMethod === m ? t.accent : t.border}`, background: payMethod === m ? t.accent + '15' : t.bg3, color: payMethod === m ? t.accent : t.text3, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>{ic} {m}</button>
          ))}
        </div>

        {payMethod === 'Card' && <CardTerminal total={cartTotal} onApproved={() => { setCardNum('4242424242424242'); setCardExp('12/26'); setCardCvv('123') }} t={t} />}

        {payMethod === 'Cash' && (
          <div style={{ marginTop: 8 }}>
            <input value={cashGiven} onChange={e => setCashGiven(e.target.value)} placeholder="Cash received (£)" type="number" style={{ width: '100%', background: t.input, border: `1px solid ${cashGiven && cashGivenNum >= cartTotal ? t.greenBorder : t.border}`, borderRadius: 8, padding: '9px 12px', color: t.text, fontSize: 14, fontWeight: 800, outline: 'none', boxSizing: 'border-box' }} />
            {cashGiven !== '' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
                {[['Cash Given', fmt(cashGivenNum), t.text], ['Change Due', cashChange >= 0 ? fmt(cashChange) : 'Insufficient', cashChange >= 0 ? t.green : t.red]].map(([k, v, c]) => (
                  <div key={k} style={{ background: t.bg3, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: t.text4 }}>{k}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {payMethod === 'Split' && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: t.text3, textTransform: 'uppercase' }}>Split Payment (Cash + Card)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div>
                <div style={{ fontSize: 10, color: t.text4, marginBottom: 3 }}>💵 Cash Amount</div>
                <input value={splitCash} onChange={e => { setSplitCash(e.target.value); const c = parseFloat(e.target.value) || 0; setSplitCard(String(Math.max(0, Math.round((cartTotal - c) * 100) / 100))) }}
                  placeholder="0.00" type="number" style={{ width: '100%', background: t.input, border: `1px solid ${t.border}`, borderRadius: 8, padding: '9px 10px', color: t.text, fontSize: 13, fontWeight: 800, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: t.text4, marginBottom: 3 }}>💳 Card Amount</div>
                <input value={splitCard} onChange={e => { setSplitCard(e.target.value); const c = parseFloat(e.target.value) || 0; setSplitCash(String(Math.max(0, Math.round((cartTotal - c) * 100) / 100))) }}
                  placeholder="0.00" type="number" style={{ width: '100%', background: t.input, border: `1px solid ${t.border}`, borderRadius: 8, padding: '9px 10px', color: t.text, fontSize: 13, fontWeight: 800, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            {(parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0) > 0 && (
              <div style={{ background: t.bg3, borderRadius: 8, padding: '6px 10px', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: t.text3 }}>Total: {fmt((parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0))}</span>
                <span style={{ color: Math.abs((parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0) - cartTotal) < 0.01 ? t.green : t.red, fontWeight: 800 }}>
                  {Math.abs((parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0) - cartTotal) < 0.01 ? '✓ Balanced' : 'Amounts must equal total'}
                </span>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button onClick={checkout} disabled={cart.length === 0}
            style={{ flex: 1, padding: '13px', background: cart.length === 0 ? t.bg4 : `linear-gradient(135deg,${t.accent},${t.accent2})`, color: cart.length === 0 ? t.text3 : '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 900, cursor: cart.length === 0 ? 'not-allowed' : 'pointer', boxShadow: cart.length > 0 ? `0 4px 14px ${t.accent}40` : 'none' }}>
            {cart.length === 0 ? 'Add items to cart' : `${payMethod === 'Card' ? '💳' : payMethod === 'Cash' ? '💵' : payMethod === 'Split' ? '✂️' : '📱'} Pay ${fmt(cartTotal)}`}
          </button>
          <button onClick={() => setShowCustDisplay(true)} title="Customer Display" style={{ padding: '13px 12px', background: t.tealBg, border: `1px solid ${t.tealBorder}`, borderRadius: 10, color: t.teal, cursor: 'pointer', fontSize: 16 }}>🖥️</button>
        </div>
        {cart.length > 0 && <button onClick={() => setCart([])} style={{ width: '100%', padding: '6px', marginTop: 5, background: 'transparent', color: t.text4, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 11, cursor: 'pointer' }}>🗑️ Clear Cart</button>}
      </div>
    </div>
  )
}
