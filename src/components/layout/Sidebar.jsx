import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useAppStore } from '@/stores/appStore'

const navByRole = {
  admin: [
    { type: 'group', l: 'Management' },
    { key: 'dashboard', l: 'Dashboard', i: '📊' },
    { key: 'sales', l: 'Sales Hub', i: '💰' },
    { key: 'inventory', l: 'Inventory', i: '📦' },
    { key: 'users', l: 'User RBAC', i: '👥' },
    { key: 'customers', l: 'Customers', i: '🧑‍🤝‍🧑' },
    { key: 'reports', l: 'Reports', i: '📈' },
    { type: 'group', l: 'Marketing' },
    { key: 'banners', l: 'Banners', i: '🖼️' },
    { key: 'coupons', l: 'Coupon Codes', i: '🎟️' },
    { type: 'group', l: 'System' },
    { key: 'audit', l: 'Audit Logs', i: '🛡️' },
    { key: 'venues', l: 'Venues', i: '🏟️' },
    { key: 'settings', l: 'Settings', i: '⚙️' },
  ],
  manager: [
    { type: 'group', l: 'Operations' },
    { key: 'dashboard', l: 'Dashboard', i: '📊' },
    { key: 'reports', l: 'Reports', i: '📈' },
    { type: 'group', l: 'Team' },
    { key: 'team', l: 'Team Management', i: '👥' },
    { type: 'group', l: 'Inventory' },
    { key: 'categories', l: 'Categories', i: '🗂️' },
    { key: 'products', l: 'Products', i: '🏷️' },
    { key: 'inventory', l: 'Stock Levels', i: '📦' },
    { key: 'damage-lost', l: 'Damaged/Lost', i: '⚠️' },
    { key: 'stock-transfer', l: 'Stock Transfer', i: '🚛' },
    { key: 'stocktake', l: 'Stocktake', i: '📝' },
    { type: 'group', l: 'Sales' },
    { key: 'pos', l: 'POS Terminal', i: '🛒' },
    { key: 'returns', l: 'Returns', i: '↩️' },
    { key: 'pickup', l: 'Pickup Orders', i: '📦' },
  ],
  cashier: [
    { type: 'group', l: 'Overview' },
    { key: 'home', l: 'Home', i: '🏠' },
    { type: 'group', l: 'Selling' },
    { key: 'pos', l: 'POS Terminal', i: '🛒' },
    { key: 'cash', l: 'Cash Management', i: '💰' },
    { type: 'group', l: 'Order Info' },
    { key: 'orders', l: 'My Orders', i: '🧾' },
    { key: 'returns', l: 'Returns', i: '↩️' },
    { key: 'pickup', l: 'Pickup Orders', i: '📦' },
    { key: 'hardware', l: 'Hardware', i: '🖨️' },
  ],
  staff: [
    { type: 'group', l: 'Fulfillment' },
    { key: 'staffdash', l: 'Order Queue', i: '📋' },
    { key: 'pickup', l: 'Pickup Verify', i: '📦' },
  ],
  customer: [
    { type: 'group', l: 'Shop' },
    { key: 'shop', l: 'Start Shopping', i: '🛍️' },
    { type: 'group', l: 'My Account' },
    { key: 'history', l: 'Order History', i: '📜' },
    { key: 'tracking', l: 'Track Orders', i: '📍' },
    { key: 'returns', l: 'Returns', i: '↩️' },
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
      <div style={{ padding: '24px 16px 16px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: `linear-gradient(135deg,${theme.accent},${theme.accent2})`,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 900,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            S
          </div>
          <div className="sidebar-label">
            <div style={{ fontSize: 16, fontWeight: 900, color: theme.text, letterSpacing: -0.3 }}>SCSTix</div>
            <div style={{ fontSize: 11, color: theme.text4, fontWeight: 700 }}>EPOS v1.0</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 16px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: col + '20',
              border: `2px solid ${col}50`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
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
                fontSize: 14,
                fontWeight: 800,
                color: theme.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentUser.name}
            </div>
            <div style={{ fontSize: 11, color: col, textTransform: 'capitalize', fontWeight: 700 }}>
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
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        {nav.map((item, idx) => {
          if (item.type === 'group') {
            return (
              <div
                key={`grp-${idx}`}
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: theme.text4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '20px 16px 8px',
                  marginTop: idx === 0 ? 0 : 4,
                }}
              >
                {item.l}
              </div>
            )
          }

          const active = isActive(item)
          return (
            <button
              key={item.key}
              onClick={() => handleNav(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 12,
                border: active ? `1px solid ${col}35` : '1px solid transparent',
                background: active ? col + '12' : 'transparent',
                color: active ? col : theme.text3,
                cursor: 'pointer',
                marginBottom: 4,
                textAlign: 'left',
                fontWeight: active ? 800 : 500,
                fontSize: 14,
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: 16, minWidth: 24, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.i}</span>
              <span className="sidebar-label">{item.l}</span>
            </button>
          )
        })}
      </nav>
      <div style={{ padding: '12px 12px', borderTop: `1px solid ${theme.border}`, background: theme.bg2 }}>
        <button
          onClick={() => handleNav({ key: 'profile' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            padding: '10px 12px',
            borderRadius: 12,
            border: 'none',
            background: 'transparent',
            color: theme.text3,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'inherit',
            marginBottom: 4,
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 16, minWidth: 24, textAlign: 'center' }}>👤</span>
          <span className="sidebar-label">My Profile</span>
        </button>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            padding: '10px 12px',
            borderRadius: 12,
            border: 'none',
            background: 'transparent',
            color: theme.red,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 16, minWidth: 24, textAlign: 'center' }}>🚪</span>
          <span className="sidebar-label">Sign Out</span>
        </button>
      </div>
    </div>
  )
}
