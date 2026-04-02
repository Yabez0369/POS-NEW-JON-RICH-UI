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
        /* ANIMATIONS */
        @keyframes subtle-pulse {
          0% { transform: scale(1); box-shadow: 0 16px 48px -12px rgba(59, 130, 246, 0.3); }
          50% { transform: scale(1.005); box-shadow: 0 20px 56px -8px rgba(59, 130, 246, 0.45); }
          100% { transform: scale(1); box-shadow: 0 16px 48px -12px rgba(59, 130, 246, 0.3); }
        }

        @keyframes badge-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* PRIMARY - Focused, Interactive, Premium Gradient */
        .pos-primary-btn {
          transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
          animation: subtle-pulse 4s infinite ease-in-out;
          border: 1px solid rgba(255,255,255,0.05) !important;
        }
        .pos-primary-btn:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 32px 64px -16px rgba(10, 35, 87, 0.5);
          border: 1px solid rgba(255,255,255,0.12) !important;
        }
        .pos-primary-btn:active {
          transform: translateY(-2px) scale(0.99);
          box-shadow: 0 12px 32px -8px rgba(10, 35, 87, 0.4);
        }

        /* SECONDARY - Balanced Card System */
        .pos-secondary-btn {
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          border: 1px solid var(--border-color) !important;
        }
        .pos-secondary-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px -8px rgba(0,0,0,0.1);
          background: var(--hover-bg) !important;
          border-color: var(--accent-color) !important;
        }
        .pos-secondary-btn:active {
          transform: translateY(0) scale(0.98);
        }

        /* UTILITY - Soft Card Style */
        .pos-utility-btn {
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          background: var(--btn-bg) !important;
          border: 1px solid var(--border-color) !important;
        }
        .pos-utility-btn:hover {
          transform: translateY(-3px);
          background: var(--hover-bg) !important;
          box-shadow: 0 12px 24px -10px rgba(0,0,0,0.08);
          border-color: var(--accent-color) !important;
        }
        .pos-utility-btn:active {
          transform: translateY(0) scale(0.97);
        }

        .dark .pos-primary-btn { box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.8); }
        .dark .pos-primary-btn:hover { box-shadow: 0 32px 72px -16px rgba(0, 0, 0, 0.9); }
      `}</style>
      
      {/* TOP HEADER */}
      <div style={{ 
        height: 72, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '0 40px', 
        background: t.bg2,
        borderBottom: `1px solid ${t.border}`,
        flexShrink: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${t.green}15`, padding: '6px 14px', borderRadius: 20, border: `1px solid ${t.green}30` }}>
            <div style={{ width: 8, height: 8, background: t.green, borderRadius: '50%', boxShadow: `0 0 12px ${t.green}` }}></div>
            <span style={{ fontSize: 12, fontWeight: 800, color: t.green, letterSpacing: 0.5 }}>TERMINAL ONLINE</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: t.text, letterSpacing: '-0.3px', opacity: 0.9 }}>
            SCSTIX <span style={{ color: t.blue }}>POS</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingRight: 16, borderRight: `1px solid ${t.border}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: t.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, boxShadow: `0 4px 12px ${t.blue}40` }}>
              {currentUser?.name?.charAt(0) || 'C'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: t.text, lineHeight: 1.2 }}>{currentUser?.name || 'Cashier'}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: t.text3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Level: Staff</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setShowOverflowMenu(true)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: t.bg3,
                border: `1px solid ${t.border}`,
                color: t.text3,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                transition: 'all 0.2s ease'
              }}
              className="pos-utility-btn"
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
                padding: '12px 20px',
                borderRadius: 14,
                color: t.red, 
                fontWeight: 700, 
                cursor: 'pointer',
                fontSize: 13,
                letterSpacing: 0.5
              }}
              className="pos-utility-btn"
            >
              <LogOut size={16} strokeWidth={2.5} /> EXIT
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT Area - Balanced flex ratios */}
      <div style={{ flex: 1, display: 'flex', gap: 40, padding: '40px 40px 0 40px', minHeight: 0, overflow: 'hidden' }}>
        
        {/* LEFT PANEL: START SALE (Refined dominance) */}
        <div style={{ flex: 1.4, display: 'flex', animation: 'slide-up 0.5s ease-out' }}>
          <button 
            className="pos-primary-btn" 
            onClick={() => navigate('/app/pos')} 
            style={{ 
              width: '100%', 
              borderRadius: 36, 
              background: darkMode 
                ? 'linear-gradient(145deg, #1e293b, #0f172a)' 
                : 'linear-gradient(145deg, #0a2357, #07193f)', 
              color: 'white', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              padding: '40px'
            }}
          >
            {/* Gloss Overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)', pointerEvents: 'none' }} />
            
            <div style={{ position: 'absolute', top: 32, left: 32, background: 'rgba(59,130,246,0.25)', color: '#fff', padding: '8px 16px', borderRadius: 20, fontSize: 11, fontWeight: 800, border: '1px solid rgba(255,255,255,0.1)', letterSpacing: 1 }}>
              QUICK ACTION
            </div>

            <div style={{
              width: 120, height: 120, borderRadius: 32, background: 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.15)',
              marginBottom: 24,
              transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              <Plus size={64} strokeWidth={2} />
            </div>

            <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, margin: 0, letterSpacing: '-1.5px', textTransform: 'uppercase' }}>
              Start Sale
            </h2>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginTop: 8, letterSpacing: 0.5 }}>
              Tap to begin session
            </div>
          </button>
        </div>

        {/* RIGHT PANEL: CORE OPERATIONS (Balanced layout) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', animation: 'slide-up 0.6s ease-out' }}>
          
          <div style={{ fontSize: 12, fontWeight: 800, color: t.text4, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20, paddingLeft: 4 }}>
            Core Operations
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto', gap: 20, flex: 1 }}>
            
            {/* ONLINE ORDERS: PRIMARY PRIORITY */}
            <button 
              className="pos-secondary-btn"
              onClick={() => navigate('/app/orders')}
              style={{
                gridColumn: '1 / span 2',
                height: 140,
                background: t.bg2,
                borderRadius: 28,
                display: 'flex',
                alignItems: 'center',
                padding: '0 32px',
                gap: 24,
                cursor: 'pointer',
                color: t.text,
                '--hover-bg': t.bg3,
                '--border-color': t.border,
                '--accent-color': t.blue
              }}
            >
              <div style={{ 
                width: 64, height: 64, borderRadius: 20, background: `${t.blue}10`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.blue,
                boxShadow: `0 8px 16px ${t.blue}15`, border: `1px solid ${t.blue}20`
              }}>
                <ShoppingBag size={28} strokeWidth={2} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 2 }}>Online Orders</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: t.text3, opacity: 0.8 }}>
                  Fulfillment & pickup management
                </div>
              </div>
              <div style={{ 
                background: t.blue, color: '#fff', padding: '8px 16px', 
                borderRadius: 14, fontSize: 13, fontWeight: 800, letterSpacing: 0.5,
                boxShadow: `0 4px 12px ${t.blue}40`,
                animation: 'badge-float 3s infinite ease-in-out'
              }}>
                12 ACTIVE
              </div>
            </button>

            {/* RETURNS: Secondary Priority (Purple) */}
            <button 
              className="pos-secondary-btn"
              onClick={() => navigate('/app/returns')}
              style={{
                background: t.bg2,
                borderRadius: 28,
                display: 'flex',
                alignItems: 'flex-start',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '24px 32px',
                gap: 12,
                cursor: 'pointer',
                color: t.text,
                height: 140,
                '--hover-bg': t.bg3,
                '--border-color': t.border,
                '--accent-color': t.purple
              }}
            >
              <div style={{ 
                width: 48, height: 48, borderRadius: 14, background: `${t.purple}10`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.purple,
                border: `1px solid ${t.purple}20`
              }}>
                <RotateCcw size={22} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Returns</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: t.text3, marginTop: 2 }}>Refund management</div>
              </div>
            </button>

            {/* EXCHANGE: Secondary Priority (Purple) */}
            <button 
              className="pos-secondary-btn"
              onClick={() => navigate('/app/returns')}
              style={{
                background: t.bg2,
                borderRadius: 28,
                display: 'flex',
                alignItems: 'flex-start',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '24px 32px',
                gap: 12,
                cursor: 'pointer',
                color: t.text,
                height: 140,
                '--hover-bg': t.bg3,
                '--border-color': t.border,
                '--accent-color': t.purple
              }}
            >
              <div style={{ 
                width: 48, height: 48, borderRadius: 14, background: `${t.purple}10`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.purple,
                border: `1px solid ${t.purple}20`
              }}>
                <ArrowLeftRight size={22} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Exchange</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: t.text3, marginTop: 2 }}>Item replacements</div>
              </div>
            </button>

          </div>
        </div>
      </div>

      {/* UTILITY ACTIONS STRIP - Soft Card Grid */}
      <div style={{ padding: '40px', flexShrink: 0, animation: 'slide-up 0.7s ease-out' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: t.text4, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20, paddingLeft: 4 }}>
          Terminal Utilities
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { label: 'Pickup Orders', icon: Truck, route: '/app/pickup', color: t.blue },
            { label: 'History', icon: Receipt, route: '/app/orders', color: t.green },
            { label: 'Cash Drawer', icon: Banknote, route: '/app/cash', color: t.orange },
            { label: 'Hardware Settings', icon: Printer, route: '/app/hardware', color: t.blue },
          ].map((item, i) => (
            <button
              key={i}
              className="pos-utility-btn"
              onClick={() => navigate(item.route)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '0 24px',
                height: 72,
                borderRadius: 20,
                color: t.text,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                '--btn-bg': t.bg2,
                '--hover-bg': t.bg3,
                '--border-color': t.border,
                '--accent-color': item.color
              }}
            >
              <div style={{ 
                width: 40, height: 40, borderRadius: 10, background: `${item.color}10`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color,
                border: `1px solid ${item.color}20`
              }}>
                <item.icon size={18} strokeWidth={2} />
              </div>
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
              borderRadius: 24,
              boxShadow: '0 25px 80px rgba(0,0,0,0.35)',
              padding: 24
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 900, color: t.text4, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>
              Manager Actions
            </div>
            <button
              onClick={() => {
                setShowOverflowMenu(false)
                navigate('/app/dashboard')
              }}
              style={{
                width: '100%',
                padding: '16px 20px',
                background: t.bg,
                border: `1px solid ${t.border}`,
                borderRadius: 16,
                color: t.text,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 12
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <KeyRound size={20} strokeWidth={2.5} />
                Admin Override
              </span>
              <span style={{ color: t.text3, fontWeight: 900 }}>→</span>
            </button>
            <button
              onClick={() => setShowOverflowMenu(false)}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: 'transparent',
                border: `1px solid ${t.border}`,
                borderRadius: 16,
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
