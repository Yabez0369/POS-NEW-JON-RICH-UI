import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useAppStore } from '@/stores/appStore'
import { 
  LayoutDashboard, Wallet, Package, Users, UserSquare, BarChart3, 
  Image as ImageIcon, Ticket, ShieldCheck, Building2, Settings,
  FolderTree, Tags, AlertTriangle, Truck, ClipboardCheck,
  MonitorSmartphone, Undo2, Box, Home, Banknote, Receipt,
  Printer, ListTodo, Store, ScrollText, MapPin, User, LogOut,
  ChevronDown, ChevronRight
} from 'lucide-react'

const navByRole = {
  admin: [
    { type: 'group', l: 'MANAGEMENT' },
    { key: 'dashboard', l: 'Dashboard', i: LayoutDashboard },
    { key: 'products', l: 'Product', i: Package },
    { key: 'categories', l: 'Categories', i: FolderTree },
    { key: 'users', l: 'User RBAC', i: Users },
    { key: 'customers', l: 'Customers', i: UserSquare },
    { key: 'reports', l: 'Reports', i: BarChart3 },
    { 
      key: 'venues', 
      l: 'Outlet Management', 
      i: Building2
    },
    { type: 'group', l: 'MARKETING' },
    { key: 'banners', l: 'Banners', i: ImageIcon },
    { key: 'coupons', l: 'Coupon Codes', i: Ticket },
    { type: 'group', l: 'SYSTEM' },
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
  const [expanded, setExpanded] = useState({})

  if (!currentUser) return null

  const theme = t
  const role = currentUser.role || 'customer'
  const nav = navByRole[role] || []
  const isAdmin = role === 'admin'

  // Premium Light Theme for all Dashboards
  const sbBg = '#FFFFFF'
  const sbTextActive = '#4F46E5' 
  const sbText = '#64748B'
  const sbTextHover = '#1E293B'
  const sbBorder = '#F1F5F9'
  const sbGroupText = '#94A3B8'
  const sbActiveBg = '#EEF2FF'
  const sbHoverBg = '#F8FAFC'

  const handleNav = (item) => {
    if (item.sub) {
      setExpanded(prev => ({ ...prev, [item.key]: !prev[item.key] }))
      return
    }
    const path = '/app/' + getPath(item.key)
    navigate(path)
    closeSidebar()
  }

  const isActive = (key) => {
    // Note: handles query params in key like 'venues?action=new'
    const cleanKey = key.split('?')[0]
    const path = '/app/' + getPath(cleanKey)
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: sbBg,
        borderRight: `1px solid ${sbBorder}`,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 20px rgba(0,0,0,0.02)',
      }}
    >
      <style>{`
        .sidebar-item {
          transition: all 0.2s ease;
        }
        .sidebar-item:hover {
          background: ${sbHoverBg} !important;
          color: ${sbTextHover} !important;
        }
      `}</style>
      <div style={{ padding: '24px 16px', borderBottom: `1px solid ${sbBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              background: 'linear-gradient(135deg, #6366F1, #3B82F6)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 900,
              color: '#fff',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            S
          </div>
          <div className="sidebar-label">
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', letterSpacing: -0.3 }}>SCSTIX</div>
            <div style={{ fontSize: 11, color: sbGroupText, fontWeight: 600, marginTop: 2 }}>EPOS v1.0</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {nav.map((item, idx) => {
          if (item.type === 'group') {
            return (
              <div
                key={`grp-${idx}`}
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: sbGroupText,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '24px 12px 8px',
                  marginTop: idx === 0 ? -12 : 0,
                }}
              >
                {item.l}
              </div>
            )
          }

          const hasSub = item.sub && item.sub.length > 0;
          const isExpanded = expanded[item.key]
          const isGroupActive = hasSub ? item.sub.some(s => isActive(s.key)) : false
          const active = hasSub ? false : isActive(item.key)
          
          return (
            <div key={item.key} style={{ marginBottom: 4 }}>
              <button
                className="sidebar-item"
                onClick={() => handleNav(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: active || isGroupActive ? sbActiveBg : 'transparent',
                  color: active || isGroupActive ? sbTextActive : sbText,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: active || isGroupActive ? 700 : 500,
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              >
                {item.i && (
                  <span style={{ minWidth: 24, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <item.i size={18} strokeWidth={1.8} />
                  </span>
                )}
                <span className="sidebar-label" style={{ flex: 1 }}>{item.l}</span>
                {hasSub && (
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                )}
              </button>
              
              {/* Expandable Sub-Menu */}
              {hasSub && isExpanded && (
                <div style={{ paddingLeft: 34, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {item.sub.map(subItem => {
                    const subActive = isActive(subItem.key)
                    return (
                      <button
                        key={subItem.key}
                        className="sidebar-item"
                        onClick={() => handleNav(subItem)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 6,
                          border: 'none',
                          background: subActive ? sbActiveBg : 'transparent',
                          color: subActive ? sbTextActive : sbGroupText,
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: subActive ? 700 : 500,
                          fontSize: 12,
                          fontFamily: 'inherit',
                        }}
                      >
                        {subItem.l}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      <div style={{ padding: '16px', borderTop: `1px solid ${sbBorder}` }}>
        <button
          className="sidebar-item"
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: '#EF4444',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'inherit',
          }}
        >
          <span style={{ minWidth: 24, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={18} strokeWidth={2} />
          </span>
          <span className="sidebar-label">Sign Out</span>
        </button>
      </div>
    </div>
  )
}
