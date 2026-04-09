import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useAppStore } from '@/stores/appStore'

const managerNav = [
  { type: 'group', l: 'Overview' },
  { key: 'dashboard', l: 'Dashboard', i: 'Home' },
  { key: 'reports', l: 'Analytics', i: 'BarChart2' },
  { type: 'group', l: 'Catalog' },
  { key: 'products', l: 'Products', i: 'Tag' },

  { key: 'order-history', l: 'Order History', i: 'ListOrders' },
  { type: 'group', l: 'Stocks' },
  { key: 'inventory', l: 'Stock Receiving', i: 'Box' },
  { key: 'purchase-orders', l: 'Purchase Orders', i: 'ShoppingCart' },
  { key: 'damage-lost', l: 'Damage/Lost', i: 'AlertTriangle' },
  { key: 'stocktake', l: 'Stocktake', i: 'ClipboardList' },
  { key: 'return-to-supplier', l: 'Supplier Return', i: 'Truck' },
  { type: 'group', l: 'Operations' },
  { key: 'team', l: 'Team', i: 'Users' },
  { key: 'till-management', l: 'Till Management', i: 'Wallet' },
  { key: 'returns', l: 'Returns', i: 'RotateCcw' },
]

// Note using inline SVG for Feathers/Lucide looking icons
const Icon = ({ name }) => {
  const icons = {
    Home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>,
    BarChart2: <><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></>,
    Tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></>,
    Box: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></>,
    Folder: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></>,
    Users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></>,
    AlertTriangle: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></>,
    ArrowsRightLeft: <><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></>,
    ClipboardList: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><line x1="12" y1="11" x2="16" y2="11"></line><line x1="12" y1="16" x2="16" y2="16"></line><line x1="8" y1="11" x2="8.01" y2="11"></line><line x1="8" y1="16" x2="8.01" y2="16"></line></>,
    ListOrders: <><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></>,
    RotateCcw: <><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></>,
    ShoppingCart: <><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></>,
    Wallet: <><path d="M20 12V8H6a2 2 0 0 1 2-2h12V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4h-4a2 2 0 0 1 0-4h4z"></path><circle cx="18" cy="14" r="2"></circle></>,
    Truck: <><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></>
  }
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[name] || icons.Home}</svg>
}

export function ManagerSidebar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [hovered, setHovered] = useState(null)
  const closeSidebar = useAppStore((s) => s.closeSidebar)

  const handleNav = (item) => {
    navigate('/app/' + item.key)
    closeSidebar()
  }

  const isActive = (key) => location.pathname.includes('/app/' + key)

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--theme-sidebar)',
      borderRight: '1px solid var(--theme-border)',
      display: 'flex', flexDirection: 'column',
      color: 'var(--theme-sidebar-text)',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{ padding: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #22D3EE, #14B8A6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            M
          </div>
          <div className="sidebar-label">
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.3 }}>Manager Pro</div>
            <div style={{ fontSize: 11, color: 'var(--theme-sidebar-text-muted)' }}>{currentUser?.name || 'Administrator'}</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 14px' }}>
        {managerNav.map((item, i) => {
          if (item.type === 'group') {
            return <div key={i} className="sidebar-label" style={{ fontSize: 11, fontWeight: 600, color: 'var(--theme-sidebar-text-muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: i === 0 ? 0 : 24, marginBottom: 8, paddingLeft: 10 }}>{item.l}</div>
          }
          const active = isActive(item.key)
          const isHovered = hovered === item.key
          return (
            <button 
              key={item.key} 
              onClick={() => handleNav(item)}
              onMouseEnter={() => setHovered(item.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px',
                borderRadius: 12, background: (active || isHovered) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: (active || isHovered) ? 'var(--theme-primary)' : 'var(--theme-sidebar-text-muted)',
                border: '1px solid transparent',
                cursor: 'pointer', textAlign: 'left', fontWeight: (active || isHovered) ? 600 : 500, fontSize: 13,
                transition: 'all 0.2s', marginBottom: 4, transform: (active || isHovered) ? 'scale(1.02)' : 'none',
                boxShadow: (active || isHovered) ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (active || isHovered) ? 1 : 0.7 }}>
                <Icon name={item.i} />
              </span>
              <span className="sidebar-label">{item.l}</span>
            </button>
          )
        })}
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid var(--theme-border)' }}>
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 14px',
          background: 'transparent', border: 'none', color: 'var(--theme-error)', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', marginTop: 16, borderRadius: 12, transition: 'all 0.2s',
        }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span className="sidebar-label">Sign Out</span>
        </button>
      </div>
    </div>
  )
}
