import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { 
  Plus, ShoppingBag, ArrowLeftRight, RotateCcw, 
  Truck, Banknote, Printer, History as HistoryIcon,
  User, X, KeyRound, LogOut
} from 'lucide-react'
import dayjs from 'dayjs'
import './CashierDashboard.css'

export function CashierDashboard({ orders = [], settings }) {
  const { logout, currentUser } = useAuth()
  const navigate = useNavigate()
  const [now, setNow] = useState(dayjs())
  const [showManagerMenu, setShowManagerMenu] = useState(false)

  // Real-time Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="ipad-root">
      
      {/* ── NATIVE HEADER ── */}
      <header className="ipad-header">
        {/* LEFT GROUP */}
        <div className="header-left-group">
          <div className="header-logo">
            SCSTIX <span>POS</span>
          </div>
          <div className="status-pills">
            <div className="pills-dot"></div>
            <span className="pills-text">System Ready</span>
          </div>
        </div>

        {/* CENTER GROUP (STAY CENTER) */}
        <div className="header-clock">
          <div className="clock-main">{now.format('h:mm A')}</div>
          <div className="clock-sub">{now.format('ddd, MMM D')}</div>
        </div>

        {/* RIGHT GROUP */}
        <div className="header-right-group">
          <div className="profile-shell">
            <div className="shell-text">
              <span className="shell-name">{currentUser?.name || 'Cashier User'}</span>
              <span className="shell-role">Terminal Unit 01</span>
            </div>
            <div className="shell-icon">
              <User size={20} fill="currentColor" />
            </div>
          </div>

          <button className="logout-btn-icon" onClick={() => navigate('/app/cash')}>
            <LogOut size={24} strokeWidth={3} />
          </button>
        </div>
      </header>

      {/* ── MAIN DASHBOARD CONTENT ── */}
      <main className="dashboard-main">
        
        {/* Left Section: Hero Action */}
        <section className="hero-column">
          <div className="hero-slab" onClick={() => navigate('/app/pos')}>
            <div className="hero-slab-shine"></div>
            <div className="hero-box">
              <Plus size={80} strokeWidth={3} color="white" />
            </div>
            <h2>NEW SALE</h2>
            <span>Tap screen to begin</span>
          </div>
        </section>

        {/* Right Section: Strategic Actions */}
        <section className="cards-right">
          
          <div className="premium-card card-wide" onClick={() => navigate('/app/orders')}>
            <div className="icon-box-major">
              <ShoppingBag size={36} strokeWidth={2.5} />
            </div>
            <div className="card-labels">
              <span className="premium-text-title">Online Orders</span>
              <span className="premium-text-sub">Manage delivery & pickup</span>
            </div>
            <div className="badge-glow">12</div>
          </div>

          <div className="mini-grid">
            <div className="premium-card card-mini" onClick={() => navigate('/app/returns')}>
              <div className="icon-box-mini" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>
                <RotateCcw size={28} strokeWidth={3} />
              </div>
              <span className="premium-text-title">Returns</span>
              <span className="premium-text-sub">Process refunds</span>
            </div>

            <div className="premium-card card-mini" onClick={() => navigate('/app/returns')}>
              <div className="icon-box-mini" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>
                <ArrowLeftRight size={28} strokeWidth={3} />
              </div>
              <span className="premium-text-title">Exchange</span>
              <span className="premium-text-sub">Swaps & credits</span>
            </div>

            <div className="premium-card card-mini" onClick={() => navigate('/app/history')}>
              <div className="icon-box-mini" style={{ background: '#ECFDF5', color: '#10B981' }}>
                <HistoryIcon size={28} strokeWidth={3} />
              </div>
              <span className="premium-text-title">History</span>
              <span className="premium-text-sub">Recent sales</span>
            </div>

            <div className="premium-card card-mini" onClick={() => navigate('/app/cash')}>
              <div className="icon-box-mini" style={{ background: '#FFF7ED', color: '#F97316' }}>
                <Banknote size={28} strokeWidth={3} />
              </div>
              <span className="premium-text-title">Cash Drawer</span>
              <span className="premium-text-sub">Open vault</span>
            </div>
          </div>
        </section>
      </main>

      {/* ── FLOATING IPADOS NAV DOCK ── */}
      <div className="nav-dock-container">
        <nav className="nav-dock-pill">
          <button className="nav-dock-item" onClick={() => navigate('/app/pickup')}>
            <Truck size={22} strokeWidth={3} />
            Delivery
          </button>
          <button className="nav-dock-item" onClick={() => navigate('/app/hardware')}>
            <Printer size={22} strokeWidth={3} />
            Hardware
          </button>
          <button className="nav-dock-item" onClick={() => setShowManagerMenu(true)}>
            <KeyRound size={22} strokeWidth={3} />
            Manager
          </button>
        </nav>
      </div>

      {/* ── MANAGER OVERRIDE AUTH ── */}
      {showManagerMenu && (
        <div className="auth-overlay-backdrop" onClick={() => setShowManagerMenu(false)} style={overlayStyle}>
          <div className="auth-pill-card" onClick={e => e.stopPropagation()} style={authCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 950, color: '#94A3B8', letterSpacing: 2.5, textTransform: 'uppercase' }}>
                Security Authorization
              </div>
              <X size={24} onClick={() => setShowManagerMenu(false)} style={{ cursor: 'pointer', color: '#CBD5E1' }} />
            </div>
            <h3 style={{ fontSize: 28, fontWeight: 950, marginBottom: 12, letterSpacing: -1 }}>Manager PIN Required</h3>
            <p style={{ fontSize: 16, color: '#64748B', marginBottom: 40, fontWeight: 700, lineHeight: 1.5 }}>
              Enter terminal security credentials to proceed.
            </p>
            
            <button 
              className="auth-cta-btn"
              onClick={() => {
                setShowManagerMenu(false)
                navigate('/app/dashboard')
              }}
              style={authBtnStyle}
            >
              <span>Admin Override</span>
              <KeyRound size={20} strokeWidth={3} />
            </button>
            
            <button 
              className="auth-close-btn"
              onClick={() => setShowManagerMenu(false)}
              style={authCancelStyle}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

const overlayStyle = {
  position: 'fixed', inset: 0, 
  background: 'rgba(15, 23, 42, 0.4)', 
  backdropFilter: 'blur(30px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 10000,
  animation: 'fadeIn 0.4s ease'
}

const authCardStyle = {
  width: 'min(440px, 92vw)',
  background: 'rgba(255, 255, 255, 0.99)',
  padding: '48px',
  borderRadius: 48,
  boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
  border: '1px solid white'
}

const authBtnStyle = {
  width: '100%', height: 72, 
  background: '#0F172A', color: 'white', 
  borderRadius: 24, border: 'none', 
  fontSize: 18, fontWeight: 950, 
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 32px', cursor: 'pointer', marginBottom: 12,
  boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
}

const authCancelStyle = {
  width: '100%', height: 60,
  background: 'transparent', border: '1px solid #F1F5F9',
  borderRadius: 20, color: '#94A3B8', fontWeight: 950,
  fontSize: 16, cursor: 'pointer'
}
