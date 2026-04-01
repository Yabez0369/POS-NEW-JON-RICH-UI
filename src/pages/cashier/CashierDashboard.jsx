import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { 
  Plus, ShoppingBag, ArrowLeftRight, RotateCcw, 
  Truck, Banknote, Printer, LogOut, Receipt, KeyRound
} from 'lucide-react'

export function CashierDashboard() {
  const { t, darkMode } = useTheme()
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [showOverflowMenu, setShowOverflowMenu] = useState(false)

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: t.bg,
      fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif"
    }}>
      <style>{`
        /* PRIMARY - Large, High Contrast, Strong Elevation */
        .pos-primary-btn {
          transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease;
          box-shadow: 0 16px 48px -12px rgba(10, 35, 87, 0.5);
        }
        .pos-primary-btn:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 24px 56px -12px rgba(10, 35, 87, 0.6);
        }
        .pos-primary-btn:active {
          transform: translateY(0) scale(0.99);
          box-shadow: 0 8px 24px -8px rgba(10, 35, 87, 0.5);
        }

        /* SECONDARY - Medium, Moderate Feedback */
        .pos-secondary-btn {
          transition: transform 0.1s ease, box-shadow 0.1s ease, border-color 0.1s ease;
          box-shadow: 0 4px 12px -4px rgba(0,0,0,0.03);
        }
        .pos-secondary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -6px rgba(0,0,0,0.08);
          border-color: #cbd5e1 !important;
        }
        .pos-secondary-btn:active {
          transform: scale(0.98);
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        /* UTILITY - Small, Subtle, Low Contrast */
        .pos-utility-btn {
          transition: background 0.1s ease, transform 0.1s ease;
        }
        .pos-utility-btn:hover {
          background: var(--hover-bg) !important;
        }
        .pos-utility-btn:active {
          transform: scale(0.98);
        }

        .dark .pos-primary-btn { box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.8); }
        .dark .pos-secondary-btn { box-shadow: 0 4px 12px -4px rgba(0,0,0,0.2); }
        .dark .pos-secondary-btn:hover { border-color: #475569 !important; }
      `}</style>
      
      {/* TOP HEADER */}
      <div style={{ 
        height: 70, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '0 32px', 
        background: t.bg2,
        borderBottom: `1px solid ${t.border}`,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#10b98120', padding: '6px 14px', borderRadius: 20, border: '1px solid #10b98150' }}>
            <div style={{ width: 10, height: 10, background: '#10b981', borderRadius: '50%' }}></div>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981', letterSpacing: 0.5 }}>TERMINAL 01</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: t.text, letterSpacing: '-0.5px' }}>
            SCSTIX POS
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
              {currentUser?.name?.charAt(0) || 'C'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{currentUser?.name || 'Cashier Role'}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: t.text3, textTransform: 'uppercase' }}>Session V-8829</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setShowOverflowMenu(true)}
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: t.bg3,
                border: `1px solid ${t.border}`,
                color: t.text3,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                lineHeight: 1
              }}
              title="More"
            >
              ···
            </button>
            <button 
              onClick={logout} 
              style={{ 
                display: 'flex', 
                gap: 8, 
                alignItems: 'center', 
                background: t.bg3, 
                border: `1px solid ${t.border}`, 
                padding: '10px 16px',
                borderRadius: 12,
                color: t.red, 
                fontWeight: 700, 
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              <LogOut size={18} strokeWidth={2.5} /> EXIT
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (PRIMARY & SECONDARY) */}
      <div style={{ flex: 1, display: 'flex', gap: 32, padding: '32px 32px 0 32px', minHeight: 0 }}>
        
        {/* DOMINANT LEFT: START SALE (Level 1) */}
        <div style={{ flex: 1.6, display: 'flex' }}>
          <button 
            className="pos-primary-btn" 
            onClick={() => navigate('/app/pos')} 
            style={{ 
              width: '100%', 
              borderRadius: 32, 
              background: darkMode ? '#0f172a' : '#0a2357', 
              color: 'white', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: darkMode ? '1px solid #1e293b' : 'none',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Soft Glow */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }} />

            <div style={{ position: 'absolute', top: 32, left: 32, background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 800, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              NEW CUSTOMER
            </div>

            <div style={{
              width: 140, height: 140, borderRadius: 40, background: 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: 32
            }}>
              <Plus size={80} strokeWidth={1.5} />
            </div>

            <h2 style={{ fontSize: 'clamp(48px, 6vw, 72px)', fontWeight: 800, margin: 0, letterSpacing: '-2px', textTransform: 'uppercase' }}>
              Start Sale
            </h2>
            <p style={{ fontSize: 20, fontWeight: 500, opacity: 0.7, margin: '12px 0 0 0' }}>This is the standard used in most self-service checkouts</p>
          </button>
        </div>

        {/* RIGHT SIDE: CORE OPERATIONS (Level 2) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ fontSize: 13, fontWeight: 800, color: t.text4, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Core Operations
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 16, flex: 1 }}>
            
            {/* ONLINE ORDERS: Spans full width (Asymmetric Layout) */}
            <button 
              className="pos-secondary-btn"
              onClick={() => navigate('/app/orders')}
              style={{
                gridColumn: '1 / span 2',
                background: t.bg2,
                border: `1px solid ${t.border}`,
                borderRadius: 24,
                display: 'flex',
                alignItems: 'center',
                padding: '0 32px',
                gap: 24,
                cursor: 'pointer',
                color: t.text
              }}
            >
              <div style={{ 
                width: 64, height: 64, borderRadius: 16, background: '#3b82f615',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6'
              }}>
                <ShoppingBag size={32} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px' }}>Online Orders</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text3, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Review and prepare pending orders
                </div>
              </div>
              <div style={{ 
                background: '#0a2357', color: '#fff', padding: '6px 14px', 
                borderRadius: 20, fontSize: 14, fontWeight: 800, letterSpacing: 0.5 
              }}>
                12 AWAITING
              </div>
            </button>

            {/* RETURNS: Half width */}
            <button 
              className="pos-secondary-btn"
              onClick={() => navigate('/app/returns')}
              style={{
                background: t.bg2,
                border: `1px solid ${t.border}`,
                borderRadius: 24,
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '24px',
                gap: 12,
                cursor: 'pointer',
                color: t.text
              }}
            >
              <div style={{ 
                width: 56, height: 56, borderRadius: 16, background: '#ef444415',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444'
              }}>
                <RotateCcw size={28} strokeWidth={1.5} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>Returns</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.text3, marginTop: -4, whiteSpace: 'nowrap' }}>
                Refund or return sold items
              </div>
            </button>

            {/* EXCHANGE: Half width */}
            <button 
              className="pos-secondary-btn"
              onClick={() => navigate('/app/returns')}
              style={{
                background: t.bg2,
                border: `1px solid ${t.border}`,
                borderRadius: 24,
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '24px',
                gap: 12,
                cursor: 'pointer',
                color: t.text
              }}
            >
              <div style={{ 
                width: 56, height: 56, borderRadius: 16, background: '#8b5cf615',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6'
              }}>
                <ArrowLeftRight size={28} strokeWidth={1.5} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>Exchange</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.text3, marginTop: -4, whiteSpace: 'nowrap' }}>
                Swap item, size, or variant
              </div>
            </button>

          </div>
        </div>
      </div>

      {/* UTILITY ACTIONS STRIP (Level 3 - Visually quiet, outline style) */}
      <div style={{ padding: '32px', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: t.text4, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
          Terminal Utilities
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'Pickup Orders', icon: Truck, route: '/app/pickup' },
            { label: 'Order History', icon: Receipt, route: '/app/orders' },
            { label: 'Cash Drawer', icon: Banknote, route: '/app/cash' },
            { label: 'Hardware', icon: Printer, route: '/app/hardware' },
          ].map((item, i) => (
            <button
              key={i}
              className="pos-utility-btn"
              onClick={() => navigate(item.route)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                height: 64,
                background: 'transparent',
                border: `1px solid ${t.border}`,
                borderRadius: 16,
                color: t.text3,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                '--hover-bg': t.bg3
              }}
            >
              <item.icon size={20} strokeWidth={2} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overflow menu (keeps Admin Override off the main screen) */}
      {showOverflowMenu && (
        <div
          onClick={() => setShowOverflowMenu(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
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
              width: 'min(420px, 100%)',
              background: t.bg2,
              border: `1px solid ${t.border}`,
              borderRadius: 18,
              boxShadow: '0 25px 80px rgba(0,0,0,0.35)',
              padding: 16
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 900, color: t.text4, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Manager Actions
            </div>
            <button
              onClick={() => {
                setShowOverflowMenu(false)
                navigate('/app/dashboard')
              }}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: t.bg,
                border: `1px solid ${t.border}`,
                borderRadius: 14,
                color: t.text,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 10
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <KeyRound size={18} strokeWidth={2.5} />
                Admin Override
              </span>
              <span style={{ color: t.text3, fontWeight: 900 }}>→</span>
            </button>
            <button
              onClick={() => setShowOverflowMenu(false)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                border: `1px solid ${t.border}`,
                borderRadius: 14,
                color: t.text3,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
