import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { 
  Plus, ShoppingBag, ArrowLeftRight, RotateCcw, 
<<<<<<< HEAD
  Truck, Banknote, Printer, History as HistoryIcon,
  User, X, KeyRound, LogOut
=======
  Truck, Banknote, Printer, LogOut, Receipt, KeyRound,
  User
>>>>>>> e5a59c6 (manager dashboard changes)
} from 'lucide-react'
import dayjs from 'dayjs'
import './CashierDashboard.css'

export function CashierDashboard() {
  const { logout, currentUser } = useAuth()
  const navigate = useNavigate()
<<<<<<< HEAD
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
=======
  const [showOverflowMenu, setShowOverflowMenu] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: darkMode 
        ? `radial-gradient(circle at 50% -20%, #1e293b 0%, #0f172a 100%)`
        : `radial-gradient(circle at 50% -20%, #f8fafc 0%, #e2e8f0 100%)`,
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      overflow: 'hidden',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent'
    }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes content-reveal {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }

        @keyframes shine {
          0% { left: -100%; transition-property: left; }
          30% { left: 100%; transition-property: left; }
          100% { left: 100%; transition-property: left; }
        }

        .premium-card {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.4s cubic-bezier(0.2, 1, 0.2, 1);
          border: 1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} !important;
          box-shadow: 0 10px 30px ${darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)'};
        }

        .premium-card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 40px 80px -20px ${darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)'};
          border-color: ${t.blue}40 !important;
        }

        .premium-card:active {
          transform: translateY(-2px) scale(0.98);
          transition: all 0.1s ease;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .hero-action-btn {
          position: relative;
          background: ${darkMode 
            ? 'linear-gradient(145deg, #1e293b, #020617)' 
            : 'linear-gradient(145deg, #0f172a, #334155)'};
          overflow: hidden;
          animation: content-reveal 0.8s cubic-bezier(0.2, 1, 0.2, 1) forwards;
        }

        .hero-action-btn::after {
          content: "";
          position: absolute;
          top: -110%;
          left: -210%;
          width: 200%;
          height: 200%;
          opacity: 0.1;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0.13) 0%,
            rgba(255, 255, 255, 0.13) 77%,
            rgba(255, 255, 255, 0.5) 92%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(30deg);
          animation: shine 4s infinite linear;
        }

        .stix-logo-anim {
          background: linear-gradient(135deg, ${t.blue}, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .interactive-icon {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .premium-card:hover .interactive-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .status-dot {
          position: relative;
        }
        .status-dot::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: ${t.green};
          animation: pulse-ring 2s infinite;
        }

        /* iPad Scroll behavior removal */
        ::-webkit-scrollbar { display: none; }
      `}</style>
      
      {/* TOP HEADER - Floating Style */}
      <div style={{ 
        height: 120, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 60px 0 60px', 
        zIndex: 100,
        flexShrink: 0
      }}>
        {/* Left: Branding & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <div style={{ 
            fontSize: 32, 
            className: 'stix-logo-anim',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <span style={{ fontWeight: 900, color: t.text }}>SCSTIX</span>
            <span style={{ color: t.blue, fontWeight: 900, opacity: 0.8 }}>POS</span>
          </div>
          
          <div style={{ 
            height: 32, 
            width: 1, 
            background: t.border, 
            opacity: 0.5 
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="status-dot" style={{ width: 12, height: 12, background: t.green, borderRadius: '50%' }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: t.text, opacity: 0.7, letterSpacing: 1.5, textTransform: 'uppercase' }}>SYSTEM READY</span>
          </div>
        </div>
        
        {/* Center: Real-time clock for premium feel */}
        <div style={{ 
          position: 'absolute', 
          left: '50%', 
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: '-0.5px', lineHeight: 1 }}>
            {formatTime(currentTime)}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: t.text3, textTransform: 'uppercase', letterSpacing: 2 }}>
            {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Right: User profile with iPad style interaction */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16, 
            background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            padding: '8px 8px 8px 16px',
            borderRadius: 20,
            border: `1px solid ${t.border}`
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: t.text }}>{currentUser?.name || 'Cashier User'}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: t.blue, textTransform: 'uppercase' }}>Terminal Unit 01</span>
            </div>
            <div style={{ 
              width: 44, height: 44, borderRadius: 14, background: t.blue, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              boxShadow: `0 8px 20px ${t.blue}30` 
            }}>
              <User size={22} strokeWidth={2.5} />
            </div>
          </div>
          
          <button 
            onClick={logout}
            style={{
              width: 52, height: 52, borderRadius: 18, background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
              border: `1px solid ${t.red}20`, color: t.red, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.3s ease'
            }}
          >
            <LogOut size={22} strokeWidth={2.5} />
          </button>
>>>>>>> e5a59c6 (manager dashboard changes)
        </div>

<<<<<<< HEAD
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

          <button className="logout-btn-icon" onClick={logout}>
            <LogOut size={24} strokeWidth={3} />
=======
      {/* MAIN CONTENT AREA */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        gap: 32, 
        padding: '0 60px 40px 60px', 
        minHeight: 0 
      }}>
        
        {/* LEFT: THE HERO ACTION */}
        <div style={{ flex: 1.2, position: 'relative' }}>
          <button 
            className="premium-card hero-action-btn"
            onClick={() => navigate('/app/pos')}
            style={{ 
              width: '100%', 
              height: '100%',
              borderRadius: 48, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              border: 'none',
              color: 'white',
              boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{
              width: 160, height: 160, borderRadius: 52, background: 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: 40,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <Plus size={80} strokeWidth={1.5} className="interactive-icon" style={{ color: '#fff' }} />
            </div>

            <h2 style={{ 
              fontSize: 64, 
              fontWeight: 900, 
              margin: 0, 
              letterSpacing: '-2px', 
              textTransform: 'uppercase',
              textShadow: '0 10px 20px rgba(0,0,0,0.3)'
            }}>
              New Sale
            </h2>
            <div style={{ 
              fontSize: 18, 
              fontWeight: 700, 
              color: 'rgba(255,255,255,0.4)', 
              marginTop: 12, 
              letterSpacing: 2,
              textTransform: 'uppercase'
            }}>
              Tap screen to begin
            </div>
>>>>>>> e5a59c6 (manager dashboard changes)
          </button>
        </div>
      </header>

<<<<<<< HEAD
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

            <div className="premium-card card-mini" onClick={() => navigate('/app/orders')}>
              <div className="icon-box-mini" style={{ background: '#ECFDF5', color: '#10B981' }}>
                <HistoryIcon size={28} strokeWidth={3} />
              </div>
              <span className="premium-text-title">History</span>
              <span className="premium-text-sub">Session logs</span>
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
=======
        {/* RIGHT: OPERATIONAL GRID */}
        <div style={{ 
          flex: 1, 
          display: 'grid', 
          gridTemplateRows: 'auto 1fr', 
          gap: 24,
          maxHeight: '100%' 
        }}>
          
          {/* TOP SECTION: ONLINE ORDERS */}
          <button 
            className="premium-card"
            onClick={() => navigate('/app/orders')}
            style={{
              height: 160,
              background: darkMode ? 'rgba(30, 41, 59, 0.4)' : '#fff',
              borderRadius: 40,
              display: 'flex',
              alignItems: 'center',
              padding: '0 32px',
              gap: 24,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ 
              width: 72, height: 72, borderRadius: 24, background: `${t.blue}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.blue,
              boxShadow: `0 10px 20px ${t.blue}20`, border: `1px solid ${t.blue}30`
            }}>
              <ShoppingBag size={32} strokeWidth={2} className="interactive-icon" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: t.text, letterSpacing: '-0.5px' }}>Online Orders</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text3, marginTop: 4 }}>Manage delivery & pickup</div>
            </div>
            <div style={{ 
              background: t.blue, color: '#fff', padding: '10px 22px', 
              borderRadius: 20, fontSize: 18, fontWeight: 900,
              boxShadow: `0 12px 24px ${t.blue}40`,
              animation: 'float 3s infinite ease-in-out'
            }}>
              12
            </div>
          </button>

          {/* MIDDLE SECTION: SECONDARY 2x2 GRID */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gridTemplateRows: '1fr 1fr',
            gap: 24 
          }}>
            {[
              { label: 'Returns', icon: RotateCcw, color: t.purple, desc: 'Process refunds' },
              { label: 'Exchange', icon: ArrowLeftRight, color: t.purple, desc: 'Swaps & credits' },
              { label: 'History', icon: Receipt, color: t.green, desc: 'Session logs' },
              { label: 'Cash Drawer', icon: Banknote, color: t.orange, desc: 'Open vault' },
            ].map((item, i) => (
              <button 
                key={i}
                className="premium-card"
                onClick={() => navigate(i < 2 ? '/app/returns' : (i === 2 ? '/app/orders' : '/app/cash'))}
                style={{
                  background: darkMode ? 'rgba(30, 41, 59, 0.4)' : '#fff',
                  borderRadius: 40,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '24px 32px',
                  gap: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  height: '100%'
                }}
              >
                <div style={{ 
                  width: 52, height: 52, borderRadius: 18, background: `${item.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color,
                  border: `1px solid ${item.color}30`
                }}>
                  <item.icon size={24} strokeWidth={2.5} className="interactive-icon" />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>{item.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text3, marginTop: 2 }}>{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM UTILITY DOCK - High-end Floating Dock */}
      <div style={{ 
        height: 100, 
        padding: '0 60px 40px 60px', 
        display: 'flex', 
        justifyContent: 'center',
        background: darkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${t.border}`
      }}>
        <div style={{ 
          display: 'flex', 
          gap: 12, 
          height: 64, 
          marginTop: 18,
          background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          padding: '6px',
          borderRadius: 24,
          border: `1px solid ${t.border}`
        }}>
          {[
            { icon: Truck, label: 'Delivery', route: '/app/pickup' },
            { icon: Printer, label: 'Hardware', route: '/app/hardware' },
            { icon: KeyRound, label: 'Manager', onClick: () => setShowOverflowMenu(true) },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.onClick || (() => navigate(item.route))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 24px',
                borderRadius: 18,
                background: 'transparent',
                border: 'none',
                color: t.text,
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.2, 1, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <item.icon size={20} strokeWidth={2.5} style={{ opacity: 0.8 }} />
              <span style={{ opacity: 0.9 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* OVERFLOW MENU - Reimagined as a Modal Slab */}
      {showOverflowMenu && (
        <div
          onClick={() => setShowOverflowMenu(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 480,
              background: darkMode ? '#1e293b' : '#fff',
              borderRadius: 48,
              boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
              padding: 48,
              textAlign: 'center',
              animation: 'content-reveal 0.4s cubic-bezier(0.2, 1, 0.2, 1)'
            }}
          >
            <div style={{ 
              width: 80, height: 80, borderRadius: 28, background: `${t.blue}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.blue,
              margin: '0 auto 24px auto'
            }}>
              <KeyRound size={40} strokeWidth={2} />
            </div>
            
            <h3 style={{ fontSize: 24, fontWeight: 900, color: t.text, marginBottom: 8 }}>Manager Override</h3>
            <p style={{ fontSize: 16, fontWeight: 700, color: t.text3, marginBottom: 40 }}>Authorization required to proceed</p>
            
            <button
>>>>>>> e5a59c6 (manager dashboard changes)
              onClick={() => {
                setShowManagerMenu(false)
                navigate('/app/dashboard')
              }}
<<<<<<< HEAD
              style={authBtnStyle}
            >
              <span>Admin Override</span>
              <KeyRound size={20} strokeWidth={3} />
            </button>
            
            <button 
              className="auth-close-btn"
              onClick={() => setShowManagerMenu(false)}
              style={authCancelStyle}
=======
              style={{
                width: '100%',
                height: 72,
                borderRadius: 24,
                background: t.blue,
                color: 'white',
                fontSize: 18,
                fontWeight: 900,
                border: 'none',
                cursor: 'pointer',
                marginBottom: 16,
                boxShadow: `0 12px 32px ${t.blue}40`
              }}
            >
              Enter Passcode
            </button>
            <button
              onClick={() => setShowOverflowMenu(false)}
              style={{
                width: '100%',
                height: 72,
                borderRadius: 24,
                background: 'transparent',
                color: t.text3,
                fontSize: 16,
                fontWeight: 800,
                border: `1px solid ${t.border}`,
                cursor: 'pointer'
              }}
>>>>>>> e5a59c6 (manager dashboard changes)
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
