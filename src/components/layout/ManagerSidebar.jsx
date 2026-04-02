import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useAppStore } from '@/stores/appStore'

const managerNav = [
  { type: 'group', l: 'Overview' },
  { key: 'dashboard', l: 'Dashboard', i: 'Home' },
  { key: 'reports', l: 'Analytics', i: 'BarChart2' },
  { type: 'group', l: 'Commerce' },
  { key: 'products', l: 'Products', i: 'Tag' },
  { key: 'inventory', l: 'Inventory', i: 'Box' },
  { key: 'categories', l: 'Categories', i: 'Folder' },
  { type: 'group', l: 'Operations' },
  { key: 'team', l: 'Team', i: 'Users' },
  { key: 'damage-lost', l: 'Damage/Lost', i: 'AlertTriangle' },
  { key: 'stock-transfer', l: 'Transfers', i: 'ArrowsRightLeft' },
  { key: 'stocktake', l: 'Stocktake', i: 'ClipboardList' },
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
    ClipboardList: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><line x1="12" y1="11" x2="16" y2="11"></line><line x1="12" y1="16" x2="16" y2="16"></line><line x1="8" y1="11" x2="8.01" y2="11"></line><line x1="8" y1="16" x2="8.01" y2="16"></line></>
  }
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[name] || icons.Home}</svg>
}

export function ManagerSidebar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const closeSidebar = useAppStore((s) => s.closeSidebar)

  const handleNav = (item) => {
    navigate('/app/' + item.key)
    closeSidebar()
  }

  const isActive = (key) => location.pathname.includes('/app/' + key)

  return (
    <div style={{
      width: '100%', height: '100%', 
      background: 'linear-gradient(180deg, #0F172A, #1E293B)', 
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column', 
      color: '#fff',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #22D3EE, #14B8A6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            M
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.3 }}>Manager Pro</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>{currentUser?.name || 'Administrator'}</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 14px' }}>
        {managerNav.map((item, i) => {
          if (item.type === 'group') {
            return <div key={i} style={{ fontSize: 11, fontWeight: 600, color: '#64748B', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: i === 0 ? 0 : 24, marginBottom: 8, paddingLeft: 10 }}>{item.l}</div>
          }
          const active = isActive(item.key)
          return (
            <button key={item.key} onClick={() => handleNav(item)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px',
              borderRadius: 12, background: active ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
              color: active ? '#22D3EE' : '#94A3B8',
              border: active ? '1px solid rgba(34, 211, 238, 0.2)' : '1px solid transparent',
              cursor: 'pointer', textAlign: 'left', fontWeight: active ? 600 : 500, fontSize: 13,
              transition: 'all 0.2s', marginBottom: 4, transform: active ? 'scale(1.02)' : 'none',
              boxShadow: active ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: active ? 1 : 0.7 }}>
                <Icon name={item.i} />
              </span>
              {item.l}
            </button>
          )
        })}
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 14, border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
          <div style={{ position: 'relative', width: 44, height: 44 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22D3EE" strokeWidth="3" strokeDasharray="75, 100" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>75%</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>Storage</div>
            <div style={{ fontSize: 10, color: '#64748B' }}>1.2 GB / 2 GB</div>
          </div>
        </div>

        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 14px',
          background: 'transparent', border: 'none', color: '#F87171', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', marginTop: 16, borderRadius: 12, transition: 'all 0.2s',
        }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Sign Out
        </button>
      </div>
    </div>
  )
}
