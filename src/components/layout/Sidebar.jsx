import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useAppStore } from '@/stores/appStore'

const navByRole = {
  admin: [
    { key: 'dashboard', l: 'Dashboard', i: '📊' },
    { key: 'pos', l: 'POS Terminal', i: '🛒' },
    { key: 'analytics', l: 'Analytics', i: '📈' },
    { key: 'customers', l: 'Customers', i: '👥' },
    { key: 'users', l: 'All Users', i: '🔑' },
    { key: 'staff', l: 'Staff Mgmt', i: '👥' },
    { key: 'venues', l: 'Venues & Sites', i: '🏟️' },
    { key: 'audit', l: 'Audit Logs', i: '📋' },
    { key: 'banners', l: 'Banners', i: '🖼️' },
    { key: 'coupons', l: 'Coupons', i: '🎟️' },
    { key: 'zreport', l: 'Z-Report', i: '📑' },
    { key: 'settings', l: 'Settings', i: '⚙️' },
  ],
  manager: [
    { key: 'dashboard', l: 'Dashboard', i: '📊' },
    { key: 'pos', l: 'POS Terminal', i: '🛒' },
    { key: 'staffdash', l: 'Staff Dashboard', i: '🖥️' },
    { key: 'pickup', l: 'Pickup Orders', i: '📦' },
    { key: 'products', l: 'Products', i: '🏷️' },
    { key: 'categories', l: 'Categories', i: '🗂️' },
    { key: 'inventory', l: 'Inventory', i: '📦' },
    { key: 'staff', l: 'Staff Mgmt', i: '👥' },
    { key: 'cashiers', l: 'Cashier Mgmt', i: '🛒' },
    { key: 'counters', l: 'Counters', i: '🏪' },
    { key: 'returns', l: 'Returns', i: '↩️' },
    { key: 'reports', l: 'Reports', i: '📈' },
  ],
  cashier: [
    { key: 'pos', l: 'POS Terminal', i: '🛒' },
    { key: 'cash', l: 'Cash Mgmt', i: '💰' },
    { key: 'orders', l: 'My Orders', i: '🧾' },
    { key: 'pickup', l: 'Pickup Orders', i: '📦' },
    { key: 'hardware', l: 'Hardware', i: '🖨️' },
    { key: 'profile', l: 'Profile', i: '👤' },
  ],
  staff: [
    { key: 'staffdash', l: 'Order Queue', i: '📋' },
    { key: 'pickup', l: 'Pickup Verify', i: '📦' },
    { key: 'profile', l: 'Profile', i: '👤' },
  ],
  customer: [
    { key: 'shop', l: 'Shop', i: '🛍️' },
    { key: 'history', l: 'My Orders', i: '📜' },
    { key: 'tracking', l: 'Track Orders', i: '📍' },
    { key: 'returns', l: 'Returns', i: '↩️' },
    { key: 'profile', l: 'Profile', i: '👤' },
  ],
}

function getPath(key) {
  if (key === 'zreport') return 'z-report'
  if (key === 'staffdash') return 'staff-dashboard'
  if (key === 'history') return 'my-orders'
  return key
}

export function Sidebar() {
  const { currentUser, logout } = useAuth()
  const { t } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const closeSidebar = useAppStore((s) => s.closeSidebar)

  if (!currentUser) return null

  const theme = t
  const role = currentUser.role || 'customer'
  const nav = navByRole[role] || []
  const rc = { admin: theme.red, manager: theme.yellow, cashier: theme.green, customer: theme.blue, staff: theme.teal }
  const col = rc[role] || theme.accent
  const tierC = { Bronze: '#cd7f32', Silver: '#9ca3af', Gold: '#f59e0b' }

  const handleNav = (item) => {
    const path = '/app/' + getPath(item.key)
    navigate(path)
    closeSidebar()
  }

  const isActive = (item) => {
    const path = '/app/' + getPath(item.key)
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: theme.sidebar,
        borderRight: `1px solid ${theme.border}`,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: theme.shadowMd,
      }}
    >
      <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              background: `linear-gradient(135deg,${theme.accent},${theme.accent2})`,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 900,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            S
          </div>
          <div className="sidebar-label">
            <div style={{ fontSize: 13, fontWeight: 900, color: theme.text, letterSpacing: -0.3 }}>SCSTix</div>
            <div style={{ fontSize: 10, color: theme.text4, fontWeight: 600 }}>EPOS v1.0</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div
            style={{
              width: 38,
              height: 38,
              background: col + '20',
              border: `2px solid ${col}50`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 900,
              color: col,
              flexShrink: 0,
            }}
          >
            {currentUser.avatar}
          </div>
          <div className="sidebar-label" style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: theme.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentUser.name}
            </div>
            <div style={{ fontSize: 10, color: col, textTransform: 'capitalize', fontWeight: 700 }}>
              {currentUser.role}
            </div>
          </div>
        </div>
        {currentUser.role === 'customer' && (
          <div className="sidebar-label" style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            <div
              style={{
                flex: 1,
                background: tierC[currentUser.tier] + '20',
                border: `1px solid ${tierC[currentUser.tier]}40`,
                borderRadius: 7,
                padding: '4px 8px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 9, color: theme.text3, fontWeight: 700 }}>TIER</div>
              <div style={{ fontSize: 11, fontWeight: 900, color: tierC[currentUser.tier] }}>
                {currentUser.tier === 'Gold' ? '🥇' : currentUser.tier === 'Silver' ? '🥈' : '🥉'} {currentUser.tier}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: theme.yellowBg,
                border: `1px solid ${theme.yellowBorder}`,
                borderRadius: 7,
                padding: '4px 8px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 9, color: theme.text3, fontWeight: 700 }}>POINTS</div>
              <div style={{ fontSize: 11, fontWeight: 900, color: theme.yellow }}>
                ⭐{currentUser.loyaltyPoints || 0}
              </div>
            </div>
          </div>
        )}
        {currentUser.counter && (
          <div
            className="sidebar-label"
            style={{
              marginTop: 6,
              fontSize: 10,
              color: theme.text3,
              background: theme.bg3,
              padding: '3px 8px',
              borderRadius: 6,
              display: 'inline-block',
            }}
          >
            📍{currentUser.counter}
          </div>
        )}
      </div>
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        {nav.map((item) => {
          const active = isActive(item)
          return (
            <button
              key={item.key}
              onClick={() => handleNav(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 10px',
                borderRadius: 9,
                border: active ? `1px solid ${col}35` : '1px solid transparent',
                background: active ? col + '15' : 'transparent',
                color: active ? col : theme.text3,
                cursor: 'pointer',
                marginBottom: 2,
                textAlign: 'left',
                fontWeight: active ? 800 : 500,
                fontSize: 12,
                transition: 'all 0.12s',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: 14, minWidth: 20, textAlign: 'center' }}>{item.i}</span>
              <span className="sidebar-label">{item.l}</span>
            </button>
          )
        })}
      </nav>
      <div style={{ padding: '8px 8px', borderTop: `1px solid ${theme.border}` }}>
        <button
          onClick={() => handleNav({ key: 'profile' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '8px 10px',
            borderRadius: 9,
            border: 'none',
            background: 'transparent',
            color: theme.text3,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
            fontFamily: 'inherit',
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 14, minWidth: 20, textAlign: 'center' }}>👤</span>
          <span className="sidebar-label">My Profile</span>
        </button>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '8px 10px',
            borderRadius: 9,
            border: 'none',
            background: 'transparent',
            color: theme.red,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 700,
            fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: 14, minWidth: 20, textAlign: 'center' }}>🚪</span>
          <span className="sidebar-label">Sign Out</span>
        </button>
      </div>
    </div>
  )
}
