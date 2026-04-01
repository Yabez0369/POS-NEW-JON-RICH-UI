import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useCashStore } from '@/stores/cashStore'
import { Btn, Input, Badge, Modal } from '@/components/ui'
import { notify } from '@/components/shared'
import { fmt, ts } from '@/lib/utils'
import './CashierOrders.css'

export const CashierOrders = ({ orders = [], setOrders, addAudit, settings, t: tProp }) => {
  const { t: tCtx, darkMode } = useTheme()
  const { currentUser: user } = useAuth()
  const { session } = useCashStore()
  const navigate = useNavigate()
  const t = tProp || tCtx

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewedOrder, setViewedOrder] = useState(null)
  
  // Set terminal mode
  useEffect(() => {
    document.body.classList.add('is-pos')
    return () => document.body.classList.remove('is-pos')
  }, [])

  // Online orders filtering
  const onlineOrders = useMemo(() => {
    return orders.filter(o => o.orderType === 'delivery' || o.orderType === 'pickup') || []
  }, [orders])

  const filtered = useMemo(() => {
    let list = onlineOrders
    if (filter !== 'all') {
      list = list.filter(o => o.status === filter)
    }
    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter(o => 
        o.id.toLowerCase().includes(s) || 
        o.customerName?.toLowerCase().includes(s) ||
        o.order_number?.toLowerCase().includes(s)
      )
    }
    return list
  }, [onlineOrders, filter, search])

  // Stats
  const stats = {
    pending: onlineOrders.filter(o => o.status === 'pending').length,
    processing: onlineOrders.filter(o => o.status === 'processing').length,
    ready: onlineOrders.filter(o => o.status === 'ready' || o.status === 'completed').length,
    delivered: onlineOrders.filter(o => o.status === 'delivered' || o.status === 'picked-up').length,
    total: onlineOrders.length
  }

  const updateStatus = (id, newStatus) => {
    setOrders(os => os.map(o => o.id === id ? { ...o, status: newStatus, updatedAt: ts() } : o))
    notify(`Order ${id} updated to ${newStatus}`, 'success')
    if (addAudit) addAudit(user, 'Order Status Updated', 'Online Orders', `${id} -> ${newStatus}`)
    if (viewedOrder?.id === id) setViewedOrder(null)
  }

  const getInitials = (n) => n ? n.split(' ').map(x => x[0]).join('').substring(0,2).toUpperCase() : '??'
  
  const sessionId = session?.session_number || session?.id?.slice(0, 8) || 'V-8829'

  return (
    <div className={`orders-terminal ${darkMode ? 'dark' : ''}`}>
      {/* ── UNIVERSAL TOP BAR ── */}
      <div className="orders-topbar">
        <div className="topbar-left">
          <button className="back-home-btn" onClick={() => navigate('/app/home')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="terminal-badge">
            <span className="badge-dot"></span>
            TERMINAL 01
          </div>
          <div className="brand-name">SCSTIX POS</div>
        </div>

        <div className="topbar-right">
          <div className="cashier-profile">
            <div className="cashier-avatar">{getInitials(user?.name)}</div>
            <div>
              <div className="cashier-name">{user?.name || 'Cashier User'}</div>
              <div className="session-id">SESSION {sessionId}</div>
            </div>
          </div>
          
          <button className="topbar-action-btn">···</button>
          
          <button className="exit-btn" onClick={() => navigate('/app/home')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            EXIT
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="orders-main">
        <div className="orders-header">
          <div className="header-left">
            <h1>Online Orders</h1>
            <p>{onlineOrders.length} total orders active at this terminal</p>
          </div>
          <div style={{ width: 340 }}>
            <Input 
              t={t} 
              placeholder="🔍 Search Order ID or Customer..." 
              value={search} 
              onChange={setSearch} 
              style={{ borderRadius: 16, height: 54, fontSize: 15, background: 'var(--terminal-card)' }}
            />
          </div>
        </div>

        {/* STAT TILES / FILTERS */}
        <div className="stats-grid">
          {[
            { id: 'pending', label: 'Incoming', icon: '📥', color: '#f59e0b', count: stats.pending },
            { id: 'processing', label: 'Preparing', icon: '🔥', color: '#3b82f6', count: stats.processing },
            { id: 'ready', label: 'Ready for Collection', icon: '📦', color: '#10b981', count: stats.ready },
            { id: 'all', label: 'All Orders', icon: '🧾', color: '#8b5cf6', count: stats.total }
          ].map(s => (
            <div 
              key={s.id} 
              className={`stat-terminal-card ${filter === s.id ? 'active' : ''}`}
              onClick={() => setFilter(s.id)}
            >
              <div className="stat-icon-wrap" style={{ background: `${s.color}15`, color: s.color }}>
                {s.icon}
              </div>
              <div className="stat-info">
                <div className="stat-val">{s.count}</div>
                <div className="stat-lbl">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ORDERS LIST */}
        {filtered.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📪</div>
            <h3>No {filter === 'all' ? '' : filter} orders</h3>
            <p>Ready to process incoming requests as they arrive.</p>
          </div>
        ) : (
          <div className="orders-terminal-grid">
            {filtered.map(o => (
              <div key={o.id} className={`order-terminal-card status-${o.status}`}>
                <div className="order-card-top">
                  <div className="order-id-block">
                    <div className="id">#{o.order_number || o.id}</div>
                    <div className="time">{o.date || 'Today'} · {o.orderType || 'Delivery'}</div>
                  </div>
                  <div className={`status-tag ${o.status}`}>
                    {o.status}
                  </div>
                </div>

                <div className="customer-row">
                  <div className="cust-char">{getInitials(o.customerName)}</div>
                  <div className="cust-info">
                    <div className="name">{o.customerName || 'Anonymous Guest'}</div>
                    <div className="type">{o.payment || 'Card Payment'}</div>
                  </div>
                </div>

                <div className="order-preview">
                  {o.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="preview-item">
                      <span><span className="qty">{item.qty}×</span> {item.name}</span>
                    </div>
                  ))}
                  {o.items?.length > 3 && (
                    <div className="more-items">+ {o.items.length - 3} more items</div>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-total">{fmt(o.total, settings?.sym)}</div>
                  <div className="order-actions">
                    <button className="action-btn secondary" onClick={() => setViewedOrder(o)}>Details</button>
                    {o.status === 'pending' && (
                      <>
                        <button className="action-btn primary" onClick={() => updateStatus(o.id, 'processing')}>Accept</button>
                        <button className="action-btn" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid rgba(220, 38, 38, 0.1)', fontWeight: 800 }} onClick={() => updateStatus(o.id, 'cancelled')}>Reject</button>
                      </>
                    )}
                    {o.status === 'processing' && (
                      <button className="action-btn primary" onClick={() => updateStatus(o.id, 'ready')}>Finish</button>
                    )}
                    {o.status === 'ready' && (
                      <button className="action-btn primary" onClick={() => updateStatus(o.id, o.orderType === 'delivery' ? 'dispatched' : 'picked-up')}>
                        {o.orderType === 'delivery' ? 'Dispatch' : 'Handover'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {viewedOrder && (
        <Modal 
          t={t} 
          title={`Order #${viewedOrder.order_number || viewedOrder.id}`} 
          subtitle={viewedOrder.customerName} 
          onClose={() => setViewedOrder(null)}
          width={500}
        >
          <div className="modal-receipt-wrap">
             <div className="receipt-info-box">
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <div className={`status-tag ${viewedOrder.status}`}>{viewedOrder.status}</div>
                  <div className="status-tag" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>{viewedOrder.orderType}</div>
                </div>
                {viewedOrder.items?.map((item, i) => (
                  <div key={i} className="receipt-detail-row">
                    <span>{item.qty}× {item.name}</span>
                    <span style={{ fontWeight: 700 }}>{fmt(item.price * item.qty, settings?.sym)}</span>
                  </div>
                ))}
                <div className="receipt-stat">
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Total Amount</div>
                  {fmt(viewedOrder.total, settings?.sym)}
                </div>
             </div>

             <div style={{ display: 'flex', gap: 12 }}>
                <Btn t={t} variant="ghost" fullWidth onClick={() => { notify('Printing receipt...', 'success'); setViewedOrder(null) }}>Print Ticket</Btn>
                <Btn t={t} variant="primary" fullWidth onClick={() => setViewedOrder(null)}>Close View</Btn>
             </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

