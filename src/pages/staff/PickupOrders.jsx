import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useCashStore } from '@/stores/cashStore'
import { Btn, Input, Badge, Card, Modal } from '@/components/ui'
import { notify } from '@/components/shared'
import { fmt, ts } from '@/lib/utils'
import './PickupOrders.css'

export const PickupOrders = ({ orders = [], setOrders, addAudit, currentUser: cuProp, t: tProp, settings }) => {
  const { t: tCtx, darkMode } = useTheme()
  const { currentUser: cuCtx } = useAuth()
  const { session } = useCashStore()
  const navigate = useNavigate()
  const t = tProp || tCtx
  const currentUser = cuProp || cuCtx

  const [filter, setFilter] = useState('ready')
  const [verifyModal, setVerifyModal] = useState(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [viewOrder, setViewOrder] = useState(null)

  // Add terminal mode side effect to hide sidebar/topbar if needed
  useEffect(() => {
    document.body.classList.add('is-pos')
    return () => document.body.classList.remove('is-pos')
  }, [])

  const pickups = orders.filter(o => o.orderType === 'pickup') || []
  const readyPickups = pickups.filter(o => o.status === 'ready' || o.status === 'completed')
  const pendingPickups = pickups.filter(o => o.status === 'pending' || o.status === 'preparing')
  const pickedUp = pickups.filter(o => o.status === 'picked-up')
  
  const displayed = filter === 'ready' ? readyPickups : 
                    filter === 'pending' ? pendingPickups : 
                    filter === 'picked-up' ? pickedUp : 
                    pickups

  const confirmPickup = (order) => {
    setOrders(os => os.map(o => o.id === order.id ? { 
      ...o, 
      status: 'picked-up', 
      pickedUpAt: ts(), 
      pickedUpBy: currentUser?.name || 'Staff' 
    } : o))
    
    if (addAudit) addAudit(currentUser, 'Pickup Confirmed', 'Staff', `${order.id} collected by ${order.customerName}`)
    notify(`Order ${order.id} claimed successfully`, 'success')
    setVerifyModal(null)
    setVerifyCode('')
  }

  const getStatusClass = (s) => {
    if (s === 'picked-up') return 'status-picked-up'
    if (s === 'ready' || s === 'completed') return 'status-ready'
    if (s === 'preparing' || s === 'pending') return 'status-pending'
    return ''
  }

  const getInitials = (name) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  const StatCardTerminal = ({ title, count, icon, color, active, onClick }) => (
    <div 
      className={`stat-terminal-card ${active ? 'active' : ''}`} 
      onClick={onClick}
    >
      <div className="stat-icon-wrap" style={{ background: `${color}15`, color: color }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-val">{count}</div>
        <div className="stat-lbl">{title}</div>
      </div>
    </div>
  )

  const sessionId = session?.session_number || session?.id?.slice(0, 8) || 'V-8829'

  return (
    <div className={`pickup-terminal ${darkMode ? 'dark' : ''}`}>
      {/* Premium POS Topbar */}
      <div className="pickup-terminal-topbar">
        <div className="topbar-left">
          <div className="terminal-badge">
            <span className="badge-dot"></span>
            TERMINAL 01
          </div>
          <div className="brand-name">SCSTIX POS</div>
        </div>

        <div className="topbar-right">
          <div className="cashier-profile">
            <div className="cashier-avatar">{getInitials(currentUser?.name)}</div>
            <div>
              <div className="cashier-name">{currentUser?.name || 'Cashier User'}</div>
              <div className="session-id">SESSION {sessionId}</div>
            </div>
          </div>
          
          <button className="topbar-action-btn">···</button>
          
          <button className="exit-btn" onClick={() => navigate('/app')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            EXIT
          </button>
        </div>
      </div>

      {/* Premium Header */}
      <div className="terminal-header">
        <div className="header-left">
          <h1>Pickup Terminal</h1>
          <p>{pickups.length} Orders awaiting processing</p>
        </div>
        <div className="filter-bar">
          {[
            { id: 'ready', label: 'Ready', icon: '📦' },
            { id: 'pending', label: 'Pending', icon: '⏳' },
            { id: 'picked-up', label: 'History', icon: '✅' },
            { id: 'all', label: 'All', icon: '📋' }
          ].map(f => (
            <button 
              key={f.id}
              className={`filter-btn ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              <span>{f.icon}</span> {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Stats */}
      <div className="stats-grid">
        <StatCardTerminal 
          title="Ready For Collection" 
          count={readyPickups.length} 
          icon="📦" 
          color="#6366f1"
          active={filter === 'ready'}
          onClick={() => setFilter('ready')}
        />
        <StatCardTerminal 
          title="In Preparation" 
          count={pendingPickups.length} 
          icon="⏳" 
          color="#f59e0b"
          active={filter === 'pending'}
          onClick={() => setFilter('pending')}
        />
        <StatCardTerminal 
          title="Claimed Today" 
          count={pickedUp.length} 
          icon="✅" 
          color="#10b981"
          active={filter === 'picked-up'}
          onClick={() => setFilter('picked-up')}
        />
        <StatCardTerminal 
          title="Grand Total" 
          count={pickups.length} 
          icon="🧾" 
          color="#8b5cf6"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
      </div>

      {/* Main Grid */}
      {displayed.length === 0 ? (
        <div className="empty-terminal">
          <div className="empty-icon">
            <span role="img" aria-label="package">📦</span>
          </div>
          <div className="empty-title">Queue is clear!</div>
          <div className="empty-sub">No {filter} orders found at the moment</div>
        </div>
      ) : (
        <div className="orders-terminal-grid">
          {displayed.map(order => (
            <div className="pickup-order-card" key={order.id}>
              <div className="order-card-header">
                <div className="order-id-block">
                  <div className="order-no">{order.id}</div>
                  <div className="order-time">{order.date}</div>
                </div>
                <div className={`status-badge-terminal ${getStatusClass(order.status)}`}>
                  {order.status}
                </div>
              </div>

              <div className="customer-info">
                <div className="cust-avatar">
                  {getInitials(order.customerName)}
                </div>
                <div className="cust-details">
                  <div className="cust-name">{order.customerName || 'Anonymous Guest'}</div>
                  <div className="cust-type">Premium Customer</div>
                </div>
              </div>

              <div className="order-items-list">
                {order.items?.slice(0, 3).map((item, i) => (
                  <div key={i} className="order-item-row">
                    <span><span className="qty">{item.qty}×</span> {item.name}</span>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                    + {order.items.length - 3} more items
                  </div>
                )}
              </div>

              <div className="card-footer-terminal">
                <div className="total-amount">{fmt(order.total, settings?.sym)}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="details-btn" onClick={() => setViewOrder(order)}>Details</button>
                  {(order.status === 'ready' || order.status === 'completed') && (
                    <button 
                      className="confirm-action-btn" 
                      onClick={() => setVerifyModal(order)}
                    >
                      Process Pickup
                    </button>
                  )}
                </div>
              </div>

              {order.pickedUpAt && (
                <div style={{ 
                  marginTop: 4, 
                  fontSize: 11, 
                  color: 'var(--success)', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <span role="img" aria-label="done">✅</span> Collected by {order.pickedUpBy} at {order.pickedUpAt}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals - Standard from UI system but could be styled further if needed */}
      {verifyModal && (
        <Modal t={t} title="📦 Confirm Pickup" subtitle={`Order ID: ${verifyModal.id}`} onClose={() => { setVerifyModal(null); setVerifyCode('') }} width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '10px 0' }}>
            <div className="customer-info" style={{ background: 'var(--terminal-bg)' }}>
              <div className="cust-avatar">{getInitials(verifyModal.customerName)}</div>
              <div className="cust-details">
                <div className="cust-name">{verifyModal.customerName}</div>
                <div className="cust-type">Awaiting collection</div>
              </div>
            </div>

            <div style={{ background: 'var(--terminal-bg)', borderRadius: 16, padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Items Verification</div>
              {verifyModal.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-main)', padding: '6px 0', borderBottom: i < verifyModal.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span>{item.name} <strong style={{ color: 'var(--text-muted)' }}>×{item.qty}</strong></span>
                  <span style={{ fontWeight: 700 }}>{fmt(item.price * item.qty, settings?.sym)}</span>
                </div>
              ))}
            </div>

            <Input t={t} label="Verification Code" value={verifyCode} onChange={setVerifyCode} placeholder="Scan or enter 6-digit code" />

            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <Btn t={t} variant="secondary" fullWidth size="lg" style={{ borderRadius: 12, height: 50 }} onClick={() => { setVerifyModal(null); setVerifyCode('') }}>Cancel</Btn>
              <Btn t={t} variant="primary" fullWidth size="lg" style={{ borderRadius: 12, height: 50, background: 'var(--success)', border: 'none' }} onClick={() => confirmPickup(verifyModal)}>✓ Complete Handover</Btn>
            </div>
          </div>
        </Modal>
      )}

      {viewOrder && (
        <Modal t={t} title={`Order Receipt`} subtitle={viewOrder.id} onClose={() => setViewOrder(null)} width={460}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div className={`status-badge-terminal ${getStatusClass(viewOrder.status)}`}>{viewOrder.status}</div>
              <div className="status-badge-terminal" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>{viewOrder.payment || 'POS Payment'}</div>
            </div>
            
            <div className="customer-info" style={{ background: 'var(--terminal-bg)' }}>
              <div className="cust-avatar">{getInitials(viewOrder.customerName)}</div>
              <div className="cust-details">
                <div className="cust-name">{viewOrder.customerName || 'Walk-in'}</div>
                <div className="cust-type">Reference: {viewOrder.date}</div>
              </div>
            </div>

            <div style={{ background: 'var(--terminal-bg)', borderRadius: 16, padding: '20px' }}>
              {viewOrder.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-main)', padding: '8px 0', borderBottom: i < viewOrder.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span>{item.name} ×{item.qty}</span>
                  <span style={{ fontWeight: 700 }}>{fmt(item.price * item.qty, settings?.sym)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 900, color: 'var(--text-main)', paddingTop: 16, borderTop: '2px dashed var(--border)', marginTop: 8 }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>{fmt(viewOrder.total, settings?.sym)}</span>
              </div>
            </div>

            <Btn t={t} variant="secondary" fullWidth style={{ borderRadius: 12, height: 50 }} onClick={() => setViewOrder(null)}>Close View</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

