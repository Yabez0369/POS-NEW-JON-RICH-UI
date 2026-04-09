import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { notify } from '@/components/shared'
import { LogIn, ArrowLeft, Mail, Lock, ShieldCheck, Eye, EyeOff, Zap, Users, BarChart3 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const ROLE_HINTS = [
  { icon: Zap, label: 'Cashier', desc: '→ POS Terminal', color: '#10B981' },
  { icon: Users, label: 'Manager', desc: '→ Reports & Team', color: '#2563EB' },
  { icon: BarChart3, label: 'Admin', desc: '→ Full Dashboard', color: '#7C3AED' },
]

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    if (e) e.preventDefault()
    setErr('')
    const parsed = loginSchema.safeParse({ email, password: pass })
    if (!parsed.success) {
      const firstError = parsed.error?.issues?.[0]?.message
      notify(firstError || 'Validation failed', 'error')
      setErr(firstError || 'Validation failed')
      return
    }
    setLoading(true)
    try {
      const user = await login(email, pass)
      if (user.role === 'cashier') {
        navigate('/app/pos')
      } else if (user.role === 'admin') {
        navigate('/app/dashboard')
      } else if (user.role === 'manager') {
        navigate('/app/reports')
      } else {
        navigate('/app/dashboard')
      }
    } catch (e) {
      setErr(e.message || 'Invalid email or password')
      notify(e.message || 'Invalid email or password', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', left: '50%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', transform: 'translate(-50%,-50%)' }} />

      <div style={{ width: '100%', maxWidth: 960, display: 'flex', borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1, minHeight: 580 }}>

        {/* LEFT PANEL — Branding */}
        <div style={{
          display: 'none',
          flex: 1,
          background: 'linear-gradient(160deg, #2563EB 0%, #1D4ED8 60%, #1e3a8a 100%)',
          padding: '48px 44px',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          ...(typeof window !== 'undefined' && window.innerWidth >= 768 ? { display: 'flex' } : {}),
        }} className="login-left-panel">
          {/* Grid pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.06,
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          <div style={{ position: 'absolute', bottom: -60, right: -60, width: 280, height: 280, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: -40, right: 40, width: 160, height: 160, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
              <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}>
                <ShieldCheck size={28} color="#fff" />
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1 }}>SCSTIX</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>EPOS Platform</div>
              </div>
            </div>
            <h2 style={{ color: '#fff', fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 900, lineHeight: 1.15, letterSpacing: -1, marginBottom: 16 }}>
              The smarter way<br />to run your business
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 16, lineHeight: 1.65, maxWidth: 320 }}>
              Fast billing, real-time inventory, multi-outlet management and powerful analytics — all in one platform.
            </p>
          </div>

          {/* Role hints */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>Login as</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ROLE_HINTS.map(({ icon: Icon, label, desc, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: 10, backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ width: 32, height: 32, background: color, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color="#fff" />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>{label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Form */}
        <div style={{ flex: 1, background: '#fff', padding: 'clamp(28px,6vw,52px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }} className="mobile-logo">
            <div style={{ width: 40, height: 40, background: '#2563EB', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} color="#fff" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 18, color: '#1F2937' }}>SCSTIX EPOS</span>
          </div>

          <div style={{ marginBottom: 32 }}>
            <button
              onClick={() => navigate('/')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}
            >
              <ArrowLeft size={16} />
              Back to Home
            </button>
            <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 900, color: '#111827', marginBottom: 6, letterSpacing: -0.5 }}>Welcome back 👋</h1>
            <p style={{ color: '#6B7280', fontSize: 15 }}>Enter your credentials to access the system</p>
          </div>

          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                <Mail size={14} color="#9CA3AF" />
                Email Address
              </label>
              <input
                id="login-email"
                type="text"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '13px 16px', fontSize: 15,
                  border: err ? '2px solid #EF4444' : '2px solid #E5E7EB',
                  borderRadius: 12, outline: 'none',
                  background: '#F9FAFB', color: '#111827',
                  transition: 'border-color .2s',
                  fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = err ? '#EF4444' : '#E5E7EB'; e.target.style.background = '#F9FAFB' }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: '#374151' }}>
                  <Lock size={14} color="#9CA3AF" />
                  Password
                </label>
                <button type="button" style={{ fontSize: 12, fontWeight: 700, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '13px 48px 13px 16px', fontSize: 15,
                    border: err ? '2px solid #EF4444' : '2px solid #E5E7EB',
                    borderRadius: 12, outline: 'none',
                    background: '#F9FAFB', color: '#111827',
                    transition: 'border-color .2s',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = err ? '#EF4444' : '#E5E7EB'; e.target.style.background = '#F9FAFB' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {err && (
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#DC2626', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚠️ {err}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '15px', fontSize: 16, fontWeight: 800,
                background: loading ? '#93C5FD' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#fff', border: 'none', borderRadius: 12, cursor: loading ? 'default' : 'pointer',
                boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'opacity .2s, transform .1s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.opacity = '0.92'; e.target.style.transform = 'translateY(-1px)' } }}
              onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)' }}
              onMouseDown={e => { e.target.style.transform = 'scale(0.98)' }}
              onMouseUp={e => { e.target.style.transform = 'translateY(-1px)' }}
            >
              {loading ? (
                <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <>
                  <LogIn size={18} />
                  Sign in to System
                </>
              )}
            </button>
          </form>

          <p style={{ marginTop: 28, textAlign: 'center', color: '#9CA3AF', fontSize: 12, fontStyle: 'italic' }}>
            Speed · Clarity · Business Efficiency
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .login-left-panel { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
        @media (max-width: 767px) {
          .mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
