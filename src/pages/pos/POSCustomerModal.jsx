import { useState, useEffect } from 'react'
import { Modal, Btn, Input, Badge } from '@/components/ui'
import { NumberPadModal } from '@/components/ui/NumberPadModal'
import { FullKeyboard } from '@/components/ui/FullKeyboard'
import { notify } from '@/components/shared'
import { ts, fmt, getTier } from '@/lib/utils'

export function POSCustomerModal({
  isOpen, onClose, users, setUsers, setSelCust, t, addAudit, user, settings
}) {
  const [step, setStep] = useState('phone') // 'phone', 'found', 'register', 'otp', 'success'
  const [phone, setPhone] = useState('')
  const [foundCust, setFoundCust] = useState(null)
  const [newName, setNewName] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNumpad, setShowNumpad] = useState(false)
  const [showFullKeyboard, setShowFullKeyboard] = useState(false)
  const [keyboardTarget, setKeyboardTarget] = useState(null) // 'phone', 'name', 'otp'


  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [isOpen])

  // Auto-trigger Numpad when modal opens at phone step

  // Auto-search as typing phone number
  useEffect(() => {
    if (step === 'phone' && phone.length >= 7) {
      const match = users.find(u => u.role === 'customer' && u.phone === phone)
      if (match) {
        setFoundCust(match)
        setStep('found')
      }
    }
  }, [phone, users, step])

  const handleSearch = () => {
    if (!phone) return
    const match = users.find(u => u.role === 'customer' && u.phone === phone)
    if (match) {
      setFoundCust(match)
      setStep('found')
    } else {
      setStep('register')
    }
  }

  const sendOtp = () => {
    if (!newName || !phone) return
    setLoading(true)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(code)

    // Simulate API delay
    setTimeout(() => {
      setLoading(false)
      setStep('otp')
      notify(`Demo OTP for ${phone}: ${code}`, 'info', 8000)
    }, 800)
  }

  const verifyAndSave = () => {
    if (otp !== generatedOtp) {
      notify('Invalid OTP. Please try again.', 'error')
      return
    }

    setLoading(true)
    // Simulate DB save
    setTimeout(() => {
      const newUser = {
        id: 'temp-' + (window.crypto?.randomUUID ? window.crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        })),
        name: newName,
        phone: phone,
        email: `${phone}@customer.com`,
        role: 'customer',
        avatar: newName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        active: true,
        joinDate: ts(),
        loyaltyPoints: 0,
        tier: 'Bronze',
        totalSpent: 0
      }

      setUsers(prev => {
        const exists = prev.find(u => u.phone === phone)
        if (exists) {
          return prev.map(u => u.phone === phone ? { ...u, name: newName, avatar: newName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) } : u)
        }
        return [...prev, newUser]
      })
      setSelCust(newUser)
      addAudit(user, 'Customer Registered', 'POS', `New customer ${newName} registered via POS`)
      setLoading(false)
      setStep('success')
    }, 1000)
  }

  const attachFound = () => {
    setSelCust(foundCust)
    notify(`Customer ${foundCust.name} attached!`, 'success')
    onClose()
  }

  const reset = () => {
    setStep('phone')
    setPhone('')
    setFoundCust(null)
    setNewName('')
    setOtp('')
    setGeneratedOtp('')
    setLoading(false)
  }


  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: showFullKeyboard ? 'flex-start' : 'center',
      padding: '40px'
    }}>
      {/* UNIT WRAPPER — Equal height side-by-side container */}
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: '24px',
        maxWidth: '100%',
        animation: 'fadeIn 0.5s ease'
      }}>
        {/* NUMBER PAD — Independently draggable tool */}
        {showNumpad && (
          <div style={{ 
            flex: '0 0 300px', 
            height: 500,
            zIndex: 100,
            position: 'relative'
          }}>
            <NumberPadModal
              title={keyboardTarget === 'phone' ? 'Customer Phone' : 'Verification OTP'}
              subtitle={keyboardTarget === 'phone' ? 'Enter number to search profile' : 'Enter the 6-digit code received'}
              initialValue={keyboardTarget === 'phone' ? phone : otp}
              onClose={() => setShowNumpad(false)}
              t={t}
              isInline={true}
              size="sm"
              hideOverlay={true}
              hidePreview={true}
              fullHeight={true} 
              showCurrency={false}
              isDecimal={false}
              onSave={(v) => {
                if (keyboardTarget === 'phone') {
                  setPhone(v)
                  if (v.length >= 5) setShowNumpad(false)
                } else {
                  setOtp(v)
                  if (v.length === 6) setShowNumpad(false)
                }
              }}
              onChange={(v) => {
                if (keyboardTarget === 'phone') setPhone(v)
                else setOtp(v)
              }}
            />
          </div>
        )}

        {/* SEARCH FORM — Fixed anchor */}
        <div style={{ 
          flex: '0 0 460px',
          background: t.bg2,
          borderRadius: 28,
          height: 500,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
          border: `1px solid ${t.border}`,
          overflow: 'hidden',
          animation: 'fadeInRight 0.4s ease-out'
        }}>
          {/* Header */}
          <div style={{ padding: '24px 30px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: t.text }}>
                {step === 'success' ? 'Registration Complete' : 'Customer Search'}
              </div>
            </div>
            <button 
              onClick={() => { onClose(); reset(); }}
              style={{ background: t.bg3, border: `1px solid ${t.border}`, borderRadius: 12, width: 36, height: 36, cursor: 'pointer', color: t.text3 }}
            >✕</button>
          </div>

          <div style={{ padding: '24px 30px', flex: 1, overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              minHeight: 280,
              justifyContent: 'center'
            }}>

        {/* STEP: PHONE ENTRY */}
        {step === 'phone' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Identify Customer</div>
              <div style={{ fontSize: 15, color: t.text2 }}>Enter the customer's phone number to begin</div>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', opacity: 0.5, pointerEvents: 'none' }}>📱</div>
              <Input
                t={t}
                value={phone}
                onChange={setPhone}
                onFocus={() => { setKeyboardTarget('phone'); setShowNumpad(true); }}
                onClick={() => { setKeyboardTarget('phone'); setShowNumpad(true); }}
                readOnly={showNumpad}
                placeholder="566778899*"
                type="tel"
                autoFocus
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  textAlign: 'center',
                  padding: '20px 20px 20px 50px',
                  borderRadius: 18,
                  background: t.input,
                  border: `3px solid ${phone.length >= 7 ? t.accent : t.border}`,
                  color: t.accent,
                  letterSpacing: 2,
                  boxShadow: phone.length >= 7 ? `0 0 15px ${t.accent}20` : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
              {phone && (
                <button
                  onClick={() => setPhone('')}
                  style={{
                    position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
                    background: t.border, color: t.text, border: 'none', borderRadius: '50%',
                    width: 28, height: 28, cursor: 'pointer', fontSize: 12, fontWeight: 900,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >✕</button>
              )}
            </div>

            <Btn
              t={t}
              variant="primary"
              size="lg"
              fullWidth
              style={{ marginTop: 24, padding: '16px', fontSize: 16, borderRadius: 14 }}
              onClick={handleSearch}
              disabled={phone.length < 5}
            >
              Continue →
            </Btn>
          </div>
        )}

        {/* STEP: CUSTOMER FOUND */}
        {step === 'found' && foundCust && (
          <div style={{ textAlign: 'center', animation: 'scaleIn 0.35s ease' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
              color: '#fff', fontSize: 28, fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', boxShadow: `0 8px 20px ${t.accent}40`
            }}>
              {foundCust.avatar || foundCust.name.charAt(0)}
            </div>

            <Badge t={t} text="Registered Member" color="green" />

            <div style={{ fontSize: 24, fontWeight: 900, color: t.text, marginTop: 12 }}>{foundCust.name}</div>
            <div style={{ fontSize: 14, color: t.text3, marginBottom: 20 }}>{foundCust.phone}</div>

            <div style={{
              background: t.bg3,
              borderRadius: 16,
              padding: '16px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 24,
              border: `1px solid ${t.border}`
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: t.text4, textTransform: 'uppercase' }}>Loyalty Points</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: t.yellow }}>⭐ {foundCust.loyaltyPoints}</div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: t.text4, textTransform: 'uppercase' }}>Member Tier</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: t.accent }}>{foundCust.tier} Member</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 'auto' }}>
              <Btn t={t} variant="ghost" flex={1} size="lg" style={{ borderRadius: 16, fontWeight: 700 }} onClick={() => { setNewName(foundCust.name); setStep('register'); }}>Not the one?</Btn>
              <Btn t={t} variant="primary" flex={1} size="lg" style={{ borderRadius: 16, fontWeight: 900 }} onClick={attachFound}>✓ Attach to Bill</Btn>
            </div>
          </div>
        )}

        {/* STEP: REGISTER (NOT FOUND) */}
        {step === 'register' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{
              background: '#FEE2E2', color: '#B91C1C',
              padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20
            }}>
              <span>🚫</span> Couldn't find any customer with this number.
            </div>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: t.text }}>Quick Register</div>
              <div style={{ fontSize: 14, color: t.text3 }}>Fill in the name to create a new profile</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: t.text3, textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 }}>Phone Number</div>
                <Input
                  t={t}
                  value={phone}
                  onChange={setPhone}
                  onFocus={() => { setKeyboardTarget('phone'); setShowNumpad(true); }}
                  onClick={() => { setKeyboardTarget('phone'); setShowNumpad(true); }}
                  readOnly={showNumpad}
                  placeholder="566778899*"
                  type="tel"
                  style={{ fontSize: 18, fontWeight: 800, padding: '12px 16px', borderRadius: 12 }}
                />
              </div>

              <Input
                t={t}
                label="Full Name"
                value={newName}
                onChange={setNewName}
                onFocus={() => { setKeyboardTarget('name'); setShowFullKeyboard(true); }}
                onClick={() => { setKeyboardTarget('name'); setShowFullKeyboard(true); }}
                readOnly={showFullKeyboard}
                placeholder="e.g. John Doe"
                autoFocus
                style={{ fontSize: 16, padding: '14px', borderRadius: 12 }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 16 }}>
                <Btn t={t} variant="ghost" size="lg" flex={1} onClick={() => setStep('phone')} style={{ borderRadius: 16, fontWeight: 700 }}>← Back</Btn>
                <Btn
                  t={t}
                  variant="primary"
                  size="lg"
                  flex={1}
                  onClick={sendOtp}
                  loading={loading}
                  disabled={!newName || newName.length < 3}
                  style={{ borderRadius: 16, fontWeight: 900 }}
                >
                  Verify & Save →
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* STEP: OTP */}
        {step === 'otp' && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: t.text }}>Verify Phone Number</div>
            <div style={{ fontSize: 14, color: t.text3, marginBottom: 24 }}>We've sent a 6-digit code to <b>{phone}</b></div>

            <div style={{ position: 'relative', marginBottom: 24 }}>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                onFocus={() => { setKeyboardTarget('otp'); setShowNumpad(true); }}
                onClick={() => { setKeyboardTarget('otp'); setShowNumpad(true); }}
                readOnly={showNumpad}
                autoFocus
                placeholder="••••••"
                style={{
                  width: '100%',
                  background: t.bg3,
                  border: `2px solid ${otp.length === 6 ? t.accent : t.border}`,
                  borderRadius: 16,
                  padding: '16px',
                  fontSize: 32,
                  fontWeight: 900,
                  textAlign: 'center',
                  color: t.accent,
                  letterSpacing: 12,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{
                position: 'absolute', bottom: -20, left: 0, right: 0,
                fontSize: 11, fontWeight: 800, color: t.text4
              }}>
                Didn't receive it? <span style={{ color: t.accent, cursor: 'pointer' }} onClick={sendOtp}>Resend Code</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 16 }}>
              <Btn t={t} variant="ghost" flex={1} size="lg" style={{ borderRadius: 16, fontWeight: 700 }} onClick={() => setStep('register')}>Back</Btn>
              <Btn
                t={t}
                variant="primary"
                size="lg"
                flex={1}
                onClick={verifyAndSave}
                loading={loading}
                disabled={otp.length !== 6}
                style={{ borderRadius: 16, fontWeight: 900 }}
              >
                ✓ Verify & Register
              </Btn>
            </div>

            {/* DEMO TOOLTIP */}
            <div style={{ marginTop: 32, padding: '10px', background: t.yellowBg, borderRadius: 10, border: `1px solid ${t.yellowBorder}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: t.yellow, textTransform: 'uppercase', marginBottom: 2 }}>Demo Test Code</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: t.yellow, letterSpacing: 4 }}>{generatedOtp}</div>
            </div>
          </div>
        )}

        {/* STEP: SUCCESS */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', animation: 'bounceIn 0.6s ease' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎊</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: t.text }}>Welcome Aboard!</div>
            <div style={{ fontSize: 15, color: t.text3, marginBottom: 32 }}>Customer <b>{newName}</b> has been registered and attached to this bill.</div>

            <Btn
              t={t}
              variant="success"
              size="lg"
              fullWidth
              style={{ padding: '16px', borderRadius: 14, fontWeight: 900, fontSize: 16, boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}
              onClick={() => { onClose(); reset() }}
            >
              Continue to Cart
            </Btn>
          </div>
        )}
      </div>
    </div>
  </div>
</div>

      {showFullKeyboard && (
        <FullKeyboard
          initialValue={newName}
          t={t}
          position="right"
          onClose={() => setShowFullKeyboard(false)}
          onSave={(v) => {
            setNewName(v)
            setShowFullKeyboard(false)
          }}
          onChange={setNewName}
        />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
