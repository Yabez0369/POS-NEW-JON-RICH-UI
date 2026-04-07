import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useAppStore } from '@/stores/appStore'
import { 
  LayoutDashboard, Wallet, Package, Users, UserSquare, BarChart3, 
  Image as ImageIcon, Ticket, ShieldCheck, Building2, Settings,
  FolderTree, Tags, AlertTriangle, Truck, ClipboardCheck,
  MonitorSmartphone, Undo2, Box, Home, Banknote, Receipt,
  Printer, ListTodo, Store, ScrollText, MapPin, User, LogOut
} from 'lucide-react'

const navByRole = {
  admin: [
    { type: 'group', l: 'Management' },
    { key: 'dashboard', l: 'Dashboard', i: LayoutDashboard },
    { key: 'inventory', l: 'Inventory', i: Package },
    { key: 'users', l: 'User RBAC', i: Users },
    { key: 'customers', l: 'Customers', i: UserSquare },
    { key: 'reports', l: 'Reports', i: BarChart3 },
    { type: 'group', l: 'Marketing' },
    { key: 'banners', l: 'Banners', i: ImageIcon },
    { key: 'coupons', l: 'Coupon Codes', i: Ticket },
    { type: 'group', l: 'System' },
    { key: 'audit', l: 'Audit Logs', i: ShieldCheck },
    { key: 'settings', l: 'Settings', i: Settings },
  ],
  manager: [
    { type: 'group', l: 'Operations' },
    { key: 'dashboard', l: 'Dashboard', i: LayoutDashboard },
    { key: 'reports', l: 'Reports', i: BarChart3 },
    { type: 'group', l: 'Team' },
    { key: 'team', l: 'Team Management', i: Users },
    { type: 'group', l: 'Inventory' },
    { key: 'categories', l: 'Categories', i: FolderTree },
    { key: 'products', l: 'Products', i: Tags },
    { key: 'inventory', l: 'Stock Levels', i: Package },
    { key: 'damage-lost', l: 'Damaged/Lost', i: AlertTriangle },
    { key: 'stock-transfer', l: 'Stock Transfer', i: Truck },
    { key: 'stocktake', l: 'Stocktake', i: ClipboardCheck },
    { type: 'group', l: 'Sales' },
    { key: 'pos', l: 'POS Terminal', i: MonitorSmartphone },
    { key: 'returns', l: 'Returns', i: Undo2 },
    { key: 'pickup', l: 'Pickup Orders', i: Box },
  ],
  cashier: [
    { type: 'group', l: 'Overview' },
    { key: 'home', l: 'Home', i: Home },
    { type: 'group', l: 'Selling' },
    { key: 'pos', l: 'POS Terminal', i: MonitorSmartphone },
    { key: 'cash', l: 'Cash Management', i: Banknote },
    { type: 'group', l: 'Order Info' },
    { key: 'orders', l: 'My Orders', i: Receipt },
    { key: 'returns', l: 'Returns', i: Undo2 },
    { key: 'pickup', l: 'Pickup Orders', i: Box },
    { key: 'hardware', l: 'Hardware', i: Printer },
  ],
  staff: [
    { type: 'group', l: 'Fulfillment' },
    { key: 'staffdash', l: 'Order Queue', i: ListTodo },
    { key: 'pickup', l: 'Pickup Verify', i: Box },
  ],
  customer: [
    { type: 'group', l: 'Shop' },
    { key: 'shop', l: 'Start Shopping', i: Store },
    { type: 'group', l: 'My Account' },
    { key: 'history', l: 'Order History', i: ScrollText },
    { key: 'tracking', l: 'Track Orders', i: MapPin },
    { key: 'returns', l: 'Returns', i: Undo2 },
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
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        {nav.map((item, idx) => {
          if (item.type === 'group') {
            return (
              <div
                key={`grp-${idx}`}
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: theme.text4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '16px 12px 6px',
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
              {item.i && (
                <span style={{ minWidth: 24, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.i size={18} strokeWidth={1.8} />
                </span>
              )}
              <span className="sidebar-label">{item.l}</span>
            </button>
          )
        })}
      </nav>
      <div style={{ padding: '8px 8px', borderTop: `1px solid ${theme.border}` }}>
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
          <span style={{ minWidth: 24, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={18} strokeWidth={1.8} />
          </span>
          <span className="sidebar-label">Sign Out</span>
        </button>
      </div>
    </div>
  )
}
