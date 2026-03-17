import { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Btn, Input, Modal, Select } from '@/components/ui'
import { notify, ReceiptModal } from '@/components/shared'
import { fmt, ts, genId, isBannerActive, getTier } from '@/lib/utils'
import { POSProductGrid } from './POSProductGrid'
import { POSCartPanel } from './POSCartPanel'

export const POSTerminal = ({ products, setProducts, orders, setOrders, users, setUsers, coupons, settings, counters, addAudit }) => {
  const { t } = useTheme()
  const { currentUser } = useAuth()
  const user = currentUser

  const [cart, setCart] = useState([])
  const [cat, setCat] = useState('All')
  const [search, setSearch] = useState('')
  const [payMethod, setPayMethod] = useState('Card')
  const [splitCash, setSplitCash] = useState('')
  const [splitCard, setSplitCard] = useState('')
  const [showReceipt, setShowReceipt] = useState(null)
  const [custSearch, setCustSearch] = useState('')
  const [selCust, setSelCust] = useState(null)
  const [showNewCust, setShowNewCust] = useState(false)
  const [otpStep, setOtpStep] = useState(1)
  const [newCustForm, setNewCustForm] = useState({ name: '', phone: '' })
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [otpInput, setOtpInput] = useState('')
  const [cashGiven, setCashGiven] = useState('')
  const [cardNum, setCardNum] = useState('')
  const [cardExp, setCardExp] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [qrPaid, setQrPaid] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [loyaltyRedeem, setLoyaltyRedeem] = useState(false)
  const [parked, setParked] = useState([])
  const [favourites] = useState([1, 6, 9, 4])
  const [showCustDisplay, setShowCustDisplay] = useState(false)
  const [scanMsg, setScanMsg] = useState('')
  const [manualBarcode, setManualBarcode] = useState('')
  const [showBarcodeInput, setShowBarcodeInput] = useState(false)
  const [showParkedDropdown, setShowParkedDropdown] = useState(false)

  const [variantProduct, setVariantProduct] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState({ size: '', color: '' })

  const barcodeBuffer = useRef('')
  const lastKeyTime = useRef(0)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return
      const now = Date.now()
      if (now - lastKeyTime.current > 80) barcodeBuffer.current = ''
      lastKeyTime.current = now

      if (e.key === 'Enter' && barcodeBuffer.current.length >= 3) {
        const code = barcodeBuffer.current
        barcodeBuffer.current = ''
        const product = products.find(p => p.sku === code || p.id.toString() === code)
        if (product) {
          addToCart(product)
          setScanMsg(`✓ Scanned: ${product.name}`)
        } else {
          setScanMsg('❌ Product not found: ' + code)
        }
        setTimeout(() => setScanMsg(''), 2500)
        return
      }
      if (e.key.length === 1) barcodeBuffer.current += e.key
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [products])

  const banners = []
  const activeOffers = (settings.banners || banners || []).filter(b => isBannerActive?.(b)).filter(b => b.offerType !== 'none') || []
  const vatRate = (settings.vatRate || 20) / 100
  const filteredProds = products.filter(p => (cat === 'All' || p.category === cat) && (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())))
  const favProds = products.filter(p => favourites.includes(p.id))

  const getItemDiscount = useCallback((product) => {
    const promo = product.promo
    if (promo?.active && promo.price != null) {
      const now = new Date()
      const start = promo.startDate ? new Date(promo.startDate) : null
      const end = promo.endDate ? new Date(promo.endDate) : null
      const inRange = (!start || now >= start) && (!end || now <= end)
      if (inRange) {
        const promoPrice = Number(promo.price)
        if (promoPrice > 0 && product.price > 0) {
          const effectiveDiscount = (1 - promoPrice / product.price) * 100
          return Math.max(0, effectiveDiscount)
        }
      }
    }
    const offer = activeOffers.find(b => b.offerType === 'category' && b.offerTarget === product.category)
    const bannerDisc = offer ? offer.offerDiscount : 0
    const prodDisc = product.discount || 0
    return Math.max(bannerDisc, prodDisc)
  }, [activeOffers])

  const handleProductClick = (p) => {
    if ((p.sizes && p.sizes.length > 0) || (p.colors && p.colors.length > 0)) {
      setVariantProduct(p)
      setSelectedVariant({
        size: p.sizes?.length ? p.sizes[0] : '',
        color: p.colors?.length ? p.colors[0] : ''
      })
    } else {
      addToCart(p)
    }
  }

  const addToCart = (p, variantStr = '') => {
    const cartId = variantStr ? `${p.id}-${variantStr}` : p.id
    const displayName = variantStr ? `${p.name} (${variantStr})` : p.name

    const currentQtyForProduct = cart.filter(i => (i.originalId || i.id) === p.id).reduce((s, i) => s + i.qty, 0)

    if (currentQtyForProduct >= p.stock) { notify(`Only ${p.stock} total in stock for ${p.name}!`, 'error'); return }
    const disc = getItemDiscount(p)
    setCart(c => {
      const ex = c.find(i => i.id === cartId)
      if (ex) return c.map(i => i.id === cartId ? { ...i, qty: i.qty + 1 } : i)
      return [...c, { ...p, id: cartId, originalId: p.id, name: displayName, qty: 1, discount: disc }]
    })
    if (disc > 0) notify(`🎉 ${disc}% offer applied on ${p.name}!`, 'success')
  }

  const confirmVariant = () => {
    if (!variantProduct) return
    const parts = []
    if (selectedVariant.size) parts.push(selectedVariant.size)
    if (selectedVariant.color) parts.push(selectedVariant.color)
    addToCart(variantProduct, parts.join(', '))
    setVariantProduct(null)
  }

  const updateQty = (id, d) => {
    const ci = cart.find(i => i.id === id)
    if (!ci) return
    const baseId = ci.originalId || id
    const p = products.find(x => x.id === baseId)
    if (!p) return

    if (d > 0) {
      const currentQtyForProduct = cart.filter(i => (i.originalId || i.id) === baseId).reduce((s, i) => s + i.qty, 0)
      if (currentQtyForProduct >= p.stock) { notify(`Max total stock reached for ${p.name} (${p.stock})`, 'error'); return }
    }
    setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + d) } : i).filter(i => i.qty > 0))
  }

  const cartSubtotal = cart.reduce((s, i) => s + (i.price * (1 - (i.discount || 0) / 100)) * i.qty, 0)
  const cartTax = cartSubtotal * vatRate
  const cartBeforeExtras = cartSubtotal + cartTax
  let couponDiscount = 0
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') couponDiscount = cartBeforeExtras * appliedCoupon.value / 100
    else if (appliedCoupon.type === 'fixed') couponDiscount = Math.min(appliedCoupon.value, cartBeforeExtras)
  }
  const custPoints = selCust?.loyaltyPoints || 0
  const loyaltyDiscount = loyaltyRedeem ? Math.min(custPoints * (settings.loyaltyValue || 0.01), cartBeforeExtras - couponDiscount) : 0
  const cartTotal = Math.max(0, Math.round((cartBeforeExtras - couponDiscount - loyaltyDiscount) * 100) / 100)
  const cashGivenNum = parseFloat(cashGiven) || 0
  const cashChange = payMethod === 'Cash' && cashGiven !== '' ? Math.round((cashGivenNum - cartTotal) * 100) / 100 : 0
  const pointsEarned = selCust ? Math.floor(cartTotal * (settings.loyaltyRate || 1)) : 0

  const applyCoupon = () => {
    const c = coupons.find(x => x.code === couponCode.toUpperCase() && x.active && new Date(x.expiry) >= new Date())
    if (!c) { notify('Invalid or expired coupon', 'error'); return }
    if (cartSubtotal < c.minOrder) { notify(`Minimum order ${fmt(c.minOrder, settings?.sym)} required`, 'error'); return }
    setAppliedCoupon(c); notify(`Coupon ${c.code} applied!`, 'success')
  }

  const parkBill = () => {
    if (cart.length === 0) return
    const id = genId('PARKED')
    setParked(p => [...p, { id, cart, selCust, ts: ts() }])
    setCart([]); setSelCust(null)
    notify(`Bill parked as ${id}`, 'info')
  }

  const recallBill = (pb) => {
    setCart(pb.cart); setSelCust(pb.selCust)
    setParked(p => p.filter(x => x.id !== pb.id))
    setShowParkedDropdown(false)
    notify('Parked bill recalled', 'success')
  }

  const handleBarcodeScan = (barcode) => {
    const product = products.find(p => p.sku === barcode || p.id.toString() === barcode)
    if (product) {
      addToCart(product)
      setScanMsg(`✓ Scanned: ${product.name}`)
    } else {
      setScanMsg('❌ Product not found')
    }
    setTimeout(() => setScanMsg(''), 2500)
    setManualBarcode('')
    setShowBarcodeInput(false)
  }

  const lookupCustomer = () => {
    const c = users.find(u => u.role === 'customer' && (u.phone === custSearch || u.name.toLowerCase().includes(custSearch.toLowerCase()) || u.email.toLowerCase().includes(custSearch.toLowerCase())))
    if (c) { setSelCust(c); notify(`✓ ${c.name} — ⭐${c.loyaltyPoints} pts`, 'success') }
    else notify('Customer not found. Add as new?', 'warning')
  }

  const sendNewCustOtp = () => {
    if (!newCustForm.name || !newCustForm.phone) return
    const code = String(Math.floor(100000 + Math.random() * 900000))
    setGeneratedOtp(code)
    setOtpStep(2)
    notify(`OTP for ${newCustForm.phone}: ${code}`, 'info', 8000)
  }

  const verifyNewCust = () => {
    if (otpInput !== generatedOtp) { notify('Wrong OTP', 'error'); return }
    // TODO: Replace with Supabase Auth invite flow — no password stored client-side
    const nc = { id: Date.now(), name: newCustForm.name, phone: newCustForm.phone, email: `${newCustForm.phone.replace(/\s/g, '')}@customer.com`, role: 'customer', avatar: newCustForm.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2), active: true, joinDate: ts(), loyaltyPoints: 0, tier: 'Bronze', totalSpent: 0 }
    setUsers(us => [...us, nc])
    setSelCust(nc)
    setShowNewCust(false)
    setOtpStep(1); setNewCustForm({ name: '', phone: '' }); setOtpInput('')
    addAudit(user, 'Customer Registered', 'POS', `New customer ${nc.name} registered`)
    notify(`${nc.name} registered & attached!`, 'success')
  }

  const processOrder = () => {
    const orderId = genId('ORD')
    const ptUsed = loyaltyRedeem ? Math.floor(loyaltyDiscount / (settings.loyaltyValue || 0.01)) : 0
    const newOrder = {
      id: orderId, customerId: selCust?.id || null, customerName: selCust?.name || 'Walk-in',
      cashierId: user.id, cashierName: user.name,
      items: cart.map(i => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price, discount: i.discount || 0 })),
      subtotal: cartSubtotal, tax: cartTax, discountAmt: couponDiscount + loyaltyDiscount,
      loyaltyDiscount, couponDiscount, couponCode: appliedCoupon?.code || null,
      deliveryCharge: 0, total: cartTotal,
      payment: payMethod,
      cardLast4: payMethod === 'Card' ? cardNum.slice(-4) : null,
      cashGiven: payMethod === 'Cash' ? cashGivenNum : payMethod === 'Split' ? parseFloat(splitCash) || 0 : null,
      cashChange: payMethod === 'Cash' ? cashChange : null,
      splitCash: payMethod === 'Split' ? parseFloat(splitCash) || 0 : null,
      splitCard: payMethod === 'Split' ? parseFloat(splitCard) || 0 : null,
      date: ts(), counter: user.counter || 'Counter 1', status: 'completed',
      orderType: 'in-store', loyaltyEarned: selCust ? pointsEarned : 0, loyaltyUsed: ptUsed,
    }
    setOrders(o => [newOrder, ...o])
    setProducts(ps => ps.map(p => { const ci = cart.find(i => i.id === p.id); return ci ? { ...p, stock: p.stock - ci.qty } : p }))
    if (selCust) {
      const newPts = Math.max(0, (selCust.loyaltyPoints || 0) - ptUsed + pointsEarned)
      const newSpent = (selCust.totalSpent || 0) + cartTotal
      setUsers(us => us.map(u => u.id === selCust.id ? { ...u, loyaltyPoints: newPts, totalSpent: newSpent, tier: getTier(newSpent) } : u))
    }
    addAudit(user, 'Payment Completed', 'POS', `${orderId} — ${fmt(cartTotal, settings?.sym)} via ${payMethod}`)
    notify(`Order ${orderId} complete! 🎉`, 'success')
    setShowReceipt(newOrder)
    setCart([]); setCashGiven(''); setCardNum(''); setCardExp(''); setCardCvv(''); setQrPaid(false); setAppliedCoupon(null); setCouponCode(''); setLoyaltyRedeem(false); setShowQrModal(false); setSplitCash(''); setSplitCard('')
  }

  const checkout = () => {
    if (cart.length === 0) return
    if (payMethod === 'Cash' && (cashGiven === '' || cashGivenNum < cartTotal)) { notify('Enter sufficient cash amount', 'error'); return }
    if (payMethod === 'Card' && cardNum.length < 4) { notify('Please tap/insert card on terminal first', 'error'); return }
    if (payMethod === 'QR' && !qrPaid) { setShowQrModal(true); return }
    if (payMethod === 'Split') {
      const sc = parseFloat(splitCash) || 0
      const cc = parseFloat(splitCard) || 0
      if (Math.abs(sc + cc - cartTotal) > 0.01) { notify('Split amounts must equal the total', 'error'); return }
      if (sc <= 0 || cc <= 0) { notify('Both cash and card amounts must be > 0', 'error'); return }
    }
    processOrder()
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 48px)', overflow: 'hidden', fontFamily: 'inherit' }} className="pos-layout">
      <POSProductGrid search={search} setSearch={setSearch} cat={cat} setCat={setCat} filteredProds={filteredProds} favProds={favProds} getItemDiscount={getItemDiscount} addToCart={handleProductClick} scanMsg={scanMsg} parkBill={parkBill} parked={parked} recallBill={recallBill} showParkedDropdown={showParkedDropdown} setShowParkedDropdown={setShowParkedDropdown} setShowBarcodeInput={setShowBarcodeInput} settings={settings} t={t} />

      <POSCartPanel cart={cart} updateQty={updateQty} setCart={setCart} selCust={selCust} setSelCust={setSelCust} custSearch={custSearch} setCustSearch={setCustSearch} lookupCustomer={lookupCustomer} setShowNewCust={setShowNewCust} loyaltyRedeem={loyaltyRedeem} setLoyaltyRedeem={setLoyaltyRedeem} appliedCoupon={appliedCoupon} setAppliedCoupon={setAppliedCoupon} couponCode={couponCode} setCouponCode={setCouponCode} applyCoupon={applyCoupon} cartSubtotal={cartSubtotal} cartTax={cartTax} couponDiscount={couponDiscount} loyaltyDiscount={loyaltyDiscount} cartTotal={cartTotal} pointsEarned={pointsEarned} payMethod={payMethod} setPayMethod={setPayMethod} cashGiven={cashGiven} setCashGiven={setCashGiven} cashGivenNum={cashGivenNum} cashChange={cashChange} cardNum={cardNum} setCardNum={setCardNum} setCardExp={setCardExp} setCardCvv={setCardCvv} splitCash={splitCash} setSplitCash={setSplitCash} splitCard={splitCard} setSplitCard={setSplitCard} checkout={checkout} setShowCustDisplay={setShowCustDisplay} settings={settings} t={t} />

      {variantProduct && (
        <Modal t={t} title="Select Variant" subtitle={variantProduct.name} onClose={() => setVariantProduct(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {variantProduct.sizes && variantProduct.sizes.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text3, marginBottom: 8 }}>Size</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {variantProduct.sizes.map(s => (
                    <button key={s} onClick={() => setSelectedVariant(v => ({ ...v, size: s }))} style={{ padding: '8px 16px', borderRadius: 8, border: `2px solid ${selectedVariant.size === s ? t.accent : t.border}`, background: selectedVariant.size === s ? t.accent + '15' : t.bg3, color: selectedVariant.size === s ? t.accent : t.text, fontWeight: 700, cursor: 'pointer' }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {variantProduct.colors && variantProduct.colors.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text3, marginBottom: 8 }}>Color</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {variantProduct.colors.map(c => (
                    <button key={c} onClick={() => setSelectedVariant(v => ({ ...v, color: c }))} style={{ padding: '8px 16px', borderRadius: 8, border: `2px solid ${selectedVariant.color === c ? t.accent : t.border}`, background: selectedVariant.color === c ? t.accent + '15' : t.bg3, color: selectedVariant.color === c ? t.accent : t.text, fontWeight: 700, cursor: 'pointer' }}>{c}</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <Btn t={t} variant="ghost" onClick={() => setVariantProduct(null)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn t={t} variant="primary" onClick={confirmVariant} style={{ flex: 1 }}>Add to Cart</Btn>
            </div>
          </div>
        </Modal>
      )}

      {showNewCust && (
        <Modal t={t} title="Register New Customer" subtitle="Verify phone number via OTP" onClose={() => { setShowNewCust(false); setOtpStep(1) }}>
          {otpStep === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input t={t} label="Customer Full Name" value={newCustForm.name} onChange={v => setNewCustForm(f => ({ ...f, name: v }))} required />
              <Input t={t} label="Mobile Number" value={newCustForm.phone} onChange={v => setNewCustForm(f => ({ ...f, phone: v }))} placeholder="+44 7700 900000" required note="OTP will be sent to verify this number" />
              <Btn t={t} onClick={sendNewCustOtp} disabled={!newCustForm.name || !newCustForm.phone} fullWidth>Send OTP →</Btn>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: t.yellowBg, border: `1px solid ${t.yellowBorder}`, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 13, color: t.yellow, fontWeight: 700, marginBottom: 4 }}>📱 Demo OTP sent to {newCustForm.phone}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: t.yellow, letterSpacing: 8, fontFamily: 'monospace' }}>{generatedOtp}</div>
              </div>
              <Input t={t} label="Enter 6-Digit OTP" value={otpInput} onChange={setOtpInput} placeholder="______" />
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn t={t} variant="ghost" onClick={() => setOtpStep(1)}>← Back</Btn>
                <Btn t={t} variant="success" onClick={verifyNewCust} disabled={otpInput.length < 6} style={{ flex: 1 }}>✓ Verify & Register</Btn>
              </div>
            </div>
          )}
        </Modal>
      )}

      {showQrModal && (
        <Modal t={t} title="QR Payment" subtitle={`Scan to pay ${fmt(cartTotal, settings?.sym)}`} onClose={() => setShowQrModal(false)}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#fff', border: '3px solid #000', borderRadius: 12, padding: 24, display: 'inline-block', margin: '0 auto 20px' }}>
              <div style={{ width: 160, height: 160, display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 1 }}>
                {Array.from({ length: 64 }, (_, i) => <div key={i} style={{ background: (i + Math.floor(i / 8)) % 3 === 0 ? '#000' : '#fff', borderRadius: 1 }} />)}
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: t.accent, marginBottom: 6 }}>{fmt(cartTotal, settings?.sym)}</div>
            <div style={{ fontSize: 14, color: t.text3, marginBottom: 24 }}>Scan with Google Pay, Apple Pay, or bank app</div>
            <Btn t={t} variant="success" size="lg" fullWidth onClick={() => { setQrPaid(true); setShowQrModal(false); processOrder() }}>✓ Confirm Payment Received</Btn>
          </div>
        </Modal>
      )}

      {showBarcodeInput && (
        <Modal t={t} title="Enter Barcode" subtitle="Scan or type product barcode/SKU" onClose={() => setShowBarcodeInput(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ textAlign: 'center', padding: 20, background: t.bg3, borderRadius: 10 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>📷</div>
              <div style={{ fontSize: 14, color: t.text3 }}>Position barcode in front of scanner</div>
              <div style={{ fontSize: 11, color: t.text4, marginTop: 4 }}>Keyboard wedge scanners auto-detect rapid input</div>
            </div>
            <Input t={t} label="Barcode/SKU" value={manualBarcode} onChange={setManualBarcode} placeholder="Scan or type barcode..." />
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn t={t} variant="ghost" onClick={() => setShowBarcodeInput(false)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn t={t} variant="success" onClick={() => handleBarcodeScan(manualBarcode)} disabled={!manualBarcode.trim()} style={{ flex: 1 }}>✓ Scan Product</Btn>
            </div>
          </div>
        </Modal>
      )}

      {showCustDisplay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0a0f1e', borderRadius: 20, padding: 32, width: 480, color: '#fff', boxShadow: '0 25px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 24 }}>⚽</div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>SCSTix EPOS</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{user?.counter} · Customer Display</div>
            </div>
            {selCust && <div style={{ background: '#1e293b', borderRadius: 10, padding: '10px 16px', marginBottom: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Welcome,</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fbbf24' }}>{selCust.name} {selCust.tier === 'Gold' ? '🥇' : selCust.tier === 'Silver' ? '🥈' : '🥉'}</div>
              <div style={{ fontSize: 12, color: '#fbbf24' }}>⭐ {selCust.loyaltyPoints} points balance</div>
            </div>}
            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 14 }}>
              {cart.map(i => <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #1e293b', fontSize: 13 }}>
                <span style={{ color: '#e2e8f0' }}>{i.emoji} {i.name} × {i.qty}</span>
                <span style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(i.price * (1 - (i.discount || 0) / 100) * i.qty, settings?.sym)}</span>
              </div>)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, fontWeight: 900, color: '#fff', paddingTop: 10, borderTop: '2px solid #334155', marginTop: 6 }}>
              <span>TOTAL</span><span style={{ color: '#ef4444' }}>{fmt(cartTotal, settings?.sym)}</span>
            </div>
            <button onClick={() => setShowCustDisplay(false)} style={{ width: '100%', marginTop: 20, padding: 12, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Close Display</button>
          </div>
        </div>
      )}

      {showReceipt && <ReceiptModal order={showReceipt} settings={settings} onClose={() => setShowReceipt(null)} t={t} />}
    </div>
  )
}
