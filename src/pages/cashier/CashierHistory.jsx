// ═══════════════════════════════════════════════════════════════
// CASHIER HISTORY — Full-screen Sales History Terminal Page
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { fmt } from '@/lib/utils'
import dayjs from 'dayjs'
import { notify } from '@/components/shared/NotificationCenter'
import './CashierHistory.css'

const STATUS_COLORS = {
  completed: { bg: '#ecfdf5', color: '#059669', label: 'Completed' },
  pending: { bg: '#fffbeb', color: '#d97706', label: 'Pending' },
  processing: { bg: '#eff6ff', color: '#2563eb', label: 'Processing' },
  cancelled: { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled' },
  refunded: { bg: '#f5f3ff', color: '#7c3aed', label: 'Refunded' },
  'in-store': { bg: '#f0f9ff', color: '#0369a1', label: 'In-Store' },
}

const PAY_ICONS = {
  Card: '💳',
  Cash: '💵',
  Split: '✂️',
  Exchange: '🔄',
}

function getInitials(name) {
  if (!name) return '??'
  return name.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase()
}

function formatTime(val) {
  if (!val) return '—'
  const d = dayjs(val)
  return d.isValid() ? d.format('MMM D, YYYY · h:mm A') : val
}

export function CashierHistory({ orders = [], settings }) {
  const { darkMode } = useTheme()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState('all') // 'all' | 'today' | 'week'
  const [filterPay, setFilterPay] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Filter to only in-store / pos orders (not online delivery/pickup)
  const posOrders = useMemo(() => {
    return orders.filter(o =>
      o.orderType === 'in-store' ||
      o.orderType === 'instore' ||
      !o.orderType ||
      o.orderType === 'pos'
    )
  }, [orders])

  const allFiltered = useMemo(() => {
    let list = [...posOrders].sort(
      (a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0)
    )

    if (filterDate === 'today') {
      list = list.filter(o => dayjs(o.created_at || o.date).isSame(dayjs(), 'day'))
    } else if (filterDate === 'week') {
      list = list.filter(o => dayjs(o.created_at || o.date).isAfter(dayjs().subtract(7, 'day')))
    }

    // if (filterPay !== 'all') {
    //   list = list.filter(o => (o.payment || o.payment_method || '').toLowerCase() === filterPay.toLowerCase())
    // }

    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter(o =>
        String(o.order_number || o.id || '').toLowerCase().includes(s) ||
        (o.customerName || o.customer_name || '').toLowerCase().includes(s) ||
        (o.cashierName || '').toLowerCase().includes(s)
      )
    }

    return list
  }, [posOrders, filterDate, filterPay, search])

  // Limit display to 10 orders
  const filtered = allFiltered.slice(0, 10)
  const hasMore = allFiltered.length > 10

  const stats = useMemo(() => {
    const today = posOrders.filter(o => dayjs(o.created_at || o.date).isSame(dayjs(), 'day'))
    const todayTotal = today.reduce((s, o) => s + (Number(o.total) || 0), 0)
    const avgValue = allFiltered.length > 0
      ? allFiltered.reduce((s, o) => s + (Number(o.total) || 0), 0) / allFiltered.length
      : 0
    return {
      todayCount: today.length,
      todayTotal,
      filteredCount: allFiltered.length,
      avgValue,
    }
  }, [posOrders, allFiltered])

  const payMethod = selectedOrder?.payment || selectedOrder?.payment_method
  const selectedItems = selectedOrder?.items || selectedOrder?.order_items || []

  return (
    <div className={`ch-root ${darkMode ? 'dark' : ''}`}>
      {/* ── TOP BAR ── */}
      <div className="ch-topbar">
        <div className="ch-topbar-left">
          <button className="ch-back-btn" onClick={() => navigate('/app/home')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="ch-title">Recent history</div>
        </div>

        <div className="ch-topbar-right">
          <div className="ch-user-tag">
            <div className="ch-avatar">{getInitials(currentUser?.name)}</div>
            <span className="ch-user-name">{currentUser?.name || 'Cashier User'}</span>
          </div>
        </div>
      </div>

      {/* ── FILTERS & SEARCH ── */}
      <div className="ch-filter-bar">
        <div className="ch-search-container">
          <svg className="ch-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="ch-search-input-alt"
            placeholder="Search Order ID"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="ch-time-filter">
          <span className="ch-filter-lbl">Filter by time</span>
          <select
            className="ch-select-alt"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* ── BODY: LIST + DETAIL ── */}
      <div className={`ch-body ${selectedOrder ? 'has-detail' : ''}`}>
        {/* ORDER LIST */}
        <div className="ch-list">
          {filtered.length === 0 ? (
            <div className="ch-empty">
              <div className="ch-empty-icon">🧾</div>
              <h3>No orders found</h3>
              <p>Try adjusting filters or search terms.</p>
            </div>
          ) : (
            filtered.map(order => {
              const isSelected = selectedOrder?.id === order.id
              const payLabel = order.payment || order.payment_method || 'Card'
              const statusKey = order.status || 'completed'
              const statusStyle = STATUS_COLORS[statusKey] || STATUS_COLORS.completed
              const orderTime = formatTime(order.created_at || order.date)
              const itemCount = (order.items || order.order_items || []).length
              return (
                <div
                  key={order.id}
                  className={`ch-order-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedOrder(isSelected ? null : order)}
                >
                  {/* Left accent */}
                  <div className="ch-order-row-accent" style={{ background: statusStyle.color }} />

                  {/* Avatar */}
                  <div className="ch-order-avatar">
                    {getInitials(order.customerName || order.customer_name)}
                  </div>

                  {/* Main info */}
                  <div className="ch-order-info">
                    <div className="ch-order-num">#{order.order_number || order.id?.slice(0, 8)}</div>
                    <div className="ch-order-meta">
                      <span>{order.customerName || order.customer_name || 'Walk-in'}</span>
                      <span className="ch-order-dot">·</span>
                      <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                      <span className="ch-order-dot">·</span>
                      <span>{orderTime}</span>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="ch-order-right">
                    <div className="ch-order-total">{fmt(order.total, settings?.sym)}</div>
                    <div className="ch-order-tags">
                      <span className="ch-tag" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                        {statusStyle.label}
                      </span>
                      <span className="ch-tag" style={{ background: '#f1f5f9', color: '#475569' }}>
                        {PAY_ICONS[payLabel] || '💳'} {payLabel}
                      </span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <div className={`ch-chevron ${isSelected ? 'open' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ── DETAIL PANEL ── */}
        {selectedOrder && (
          <div className="ch-detail-panel">
            {/* Panel Header */}
            <div className="ch-detail-header">
              <div>
                <div className="ch-detail-order-num">
                  #{selectedOrder.order_number || selectedOrder.id?.slice(0, 8)}
                </div>
                <div className="ch-detail-date">
                  {formatTime(selectedOrder.created_at || selectedOrder.date)}
                </div>
              </div>
              <button className="ch-detail-close" onClick={() => setSelectedOrder(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

          <div className="ch-detail-scroll">
            {/* Customer card */}
            <div className="ch-detail-section">
              <div className="ch-section-label">Customer</div>
              <div className="ch-customer-card">
                <div className="ch-customer-avatar">
                  {getInitials(selectedOrder.customerName || selectedOrder.customer_name)}
                </div>
                <div>
                  <div className="ch-customer-name">
                    {selectedOrder.customerName || selectedOrder.customer_name || 'Walk-in Customer'}
                  </div>
                  <div className="ch-customer-role">
                    Served by {selectedOrder.cashierName || currentUser?.name || 'Cashier'}
                  </div>
                </div>
              </div>
            </div>

            {/* Status + Pay badges */}
            <div className="ch-detail-section">
              <div className="ch-badge-row">
                {(() => {
                  const s = STATUS_COLORS[selectedOrder.status || 'completed'] || STATUS_COLORS.completed
                  return (
                    <span className="ch-detail-badge" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  )
                })()}
                <span className="ch-detail-badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                  {PAY_ICONS[payMethod] || '💳'} {payMethod || 'Card'}
                </span>
                <span className="ch-detail-badge" style={{ background: '#f0f9ff', color: '#0369a1' }}>
                  {selectedOrder.orderType || 'In-Store'}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="ch-detail-section">
              <div className="ch-section-label">Order Items ({selectedItems.length})</div>
              <div className="ch-items-list">
                {selectedItems.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    No items recorded
                  </div>
                ) : (
                  selectedItems.map((item, i) => {
                    const qty = item.qty || item.quantity || 1
                    const price = item.price ?? item.unit_price ?? 0
                    const disc = item.discount || item.discount_pct || 0
                    const lineTotal = price * (1 - disc / 100) * qty
                    return (
                      <div key={i} className="ch-item-row">
                        <div className="ch-item-qty">{qty}×</div>
                        <div className="ch-item-name">
                          {item.name || item.product_name || 'Item'}
                          {disc > 0 && (
                            <span className="ch-item-disc">−{disc}%</span>
                          )}
                        </div>
                        <div className="ch-item-total">{fmt(lineTotal, settings?.sym)}</div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Totals breakdown */}
            <div className="ch-detail-section">
              <div className="ch-section-label">Payment Breakdown</div>
              <div className="ch-breakdown">
                {selectedOrder.subtotal != null && (
                  <div className="ch-breakdown-row">
                    <span>Subtotal</span>
                    <span>{fmt(selectedOrder.subtotal, settings?.sym)}</span>
                  </div>
                )}
                {(selectedOrder.tax ?? selectedOrder.taxAmount) != null && (
                  <div className="ch-breakdown-row">
                    <span>Tax</span>
                    <span>{fmt(selectedOrder.tax ?? selectedOrder.taxAmount, settings?.sym)}</span>
                  </div>
                )}
                {Number(selectedOrder.couponDiscount || selectedOrder.discount_amount) > 0 && (
                  <div className="ch-breakdown-row discount">
                    <span>Discount {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ''}</span>
                    <span>−{fmt(selectedOrder.couponDiscount || selectedOrder.discount_amount, settings?.sym)}</span>
                  </div>
                )}
                {Number(selectedOrder.loyaltyDiscount) > 0 && (
                  <div className="ch-breakdown-row discount">
                    <span>Loyalty Discount</span>
                    <span>−{fmt(selectedOrder.loyaltyDiscount, settings?.sym)}</span>
                  </div>
                )}
                <div className="ch-breakdown-total">
                  <span>Total Paid</span>
                  <span>{fmt(selectedOrder.total, settings?.sym)}</span>
                </div>
                {payMethod === 'Cash' && selectedOrder.cashGiven != null && (
                  <>
                    <div className="ch-breakdown-row">
                      <span>Cash Given</span>
                      <span>{fmt(selectedOrder.cashGiven, settings?.sym)}</span>
                    </div>
                    <div className="ch-breakdown-row">
                      <span>Change</span>
                      <span>{fmt(selectedOrder.cashChange ?? 0, settings?.sym)}</span>
                    </div>
                  </>
                )}
                {payMethod === 'Split' && (
                  <>
                    {selectedOrder.splitCash != null && (
                      <div className="ch-breakdown-row">
                        <span>Cash Portion</span>
                        <span>{fmt(selectedOrder.splitCash, settings?.sym)}</span>
                      </div>
                    )}
                    {selectedOrder.splitCard != null && (
                      <div className="ch-breakdown-row">
                        <span>Card Portion</span>
                        <span>{fmt(selectedOrder.splitCard, settings?.sym)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons — pinned to bottom */}
            <div className="ch-detail-actions">
              <button className="ch-action-btn secondary" onClick={() => notify('Bill Reprinted ✅', 'success')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
                </svg>
                Print Receipt
              </button>
              <button className="ch-action-btn primary" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CashierHistory
