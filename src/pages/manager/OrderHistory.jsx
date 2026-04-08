import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Badge, Modal, Btn } from '@/components/ui'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { fmt } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const statusColor = (s) => {
  if (!s) return 'blue'
  const l = s.toLowerCase()
  if (l === 'completed' || l === 'delivered') return 'green'
  if (l === 'preparing' || l === 'processing' || l === 'pending') return 'yellow'
  if (l === 'cancelled' || l === 'refunded') return 'red'
  return 'blue'
}

const typeColor = (t) => {
  if (!t) return 'blue'
  const l = t.toLowerCase()
  if (l === 'delivery') return 'teal'
  if (l === 'pickup') return 'blue'
  return 'green'
}

const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const short = (id) => {
  if (!id) return '—'
  return String(id).slice(-8).toUpperCase()
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusPill({ status, t }) {
  return <Badge t={t} text={status || 'unknown'} color={statusColor(status)} />
}

function TypePill({ type, t }) {
  return <Badge t={t} text={type || 'in-store'} color={typeColor(type)} />
}

function OrderDetailModal({ order, onClose, settings }) {
  const { t } = useTheme()
  if (!order) return null

  const items = order.order_items || []
  const subtotal = Number(order.subtotal || 0)
  const tax = Number(order.tax_amount || 0)
  const discount = Number(order.discount_amount || 0)
  const loyaltyDiscount = Number(order.loyalty_discount || 0)
  const total = Number(order.total || 0)
  const sym = settings?.sym || '£'

  return (
    <Modal
      t={t}
      title={`Order #${order.order_number || short(order.id)}`}
      subtitle={fmtDate(order.created_at)}
      onClose={onClose}
      width={560}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Badges Row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <TypePill t={t} type={order.order_type} />
          <StatusPill t={t} status={order.status} />
          {order.payment_method && (
            <Badge t={t} text={order.payment_method} color="blue" />
          )}
        </div>

        {/* Customer */}
        {order.customer_name && (
          <div style={{
            background: t.bg3,
            border: `1px solid ${t.border}`,
            borderRadius: 10, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg,#22D3EE,#14B8A6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 15, color: '#fff', flexShrink: 0,
            }}>
              {order.customer_name[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{order.customer_name}</div>
              <div style={{ fontSize: 13, color: t.text3 }}>Customer</div>
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ background: t.bg3, borderRadius: 12, overflow: 'hidden', border: `1px solid ${t.border}` }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${t.border}`, fontSize: 13, fontWeight: 700, color: t.text3, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Items ({items.length})
          </div>
          {items.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: t.text4, fontSize: 15 }}>No item details available</div>
          ) : (
            items.map((item, i) => (
              <div key={item.id || i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', fontSize: 15, color: t.text2,
                borderBottom: i < items.length - 1 ? `1px solid ${t.border}` : 'none',
              }}>
                <div>
                  <span style={{ fontWeight: 600, color: t.text }}>{item.product_name || 'Product'}</span>
                  <span style={{ color: t.text3, marginLeft: 6 }}>×{item.quantity}</span>
                  {item.discount_pct > 0 && (
                    <span style={{ fontSize: 13, color: '#F59E0B', marginLeft: 6 }}>-{item.discount_pct}%</span>
                  )}
                </div>
                <span style={{ fontWeight: 700, color: t.accent }}>
                  {fmt(item.line_total ?? (item.unit_price * item.quantity), sym)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div style={{ background: t.bg3, borderRadius: 12, padding: '14px', border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['Subtotal', fmt(subtotal, sym)],
            tax > 0 ? ['Tax', fmt(tax, sym)] : null,
            discount > 0 ? ['Discount', `-${fmt(discount, sym)}`] : null,
            loyaltyDiscount > 0 ? ['Loyalty Discount', `-${fmt(loyaltyDiscount, sym)}`] : null,
          ].filter(Boolean).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: t.text3 }}>
              <span>{k}</span>
              <span style={{ fontWeight: 600, color: t.text2 }}>{v}</span>
            </div>
          ))}
          <div style={{ height: 1, background: t.border, margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 900 }}>
            <span style={{ color: t.text }}>Total</span>
            <span style={{ color: t.accent }}>{fmt(total, sym)}</span>
          </div>
        </div>

        <Btn t={t} onClick={onClose} fullWidth variant="secondary">Close</Btn>
      </div>
    </Modal>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function OrderHistory({ settings }) {
  const { t } = useTheme()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewOrder, setViewOrder] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const PER_PAGE = 20

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!isSupabaseConfigured()) {
        setOrders([])
        setLoading(false)
        return
      }

      // Step 1: Fetch orders with their items (no profiles join to avoid RLS recursion)
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
        .limit(500)

      if (ordersErr) throw ordersErr

      // Step 2: Collect unique customer IDs and fetch profiles separately
      const customerIds = [...new Set(
        (ordersData || []).map(o => o.customer_id).filter(Boolean)
      )]

      let profileMap = {}
      if (customerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', customerIds)
          ; (profiles || []).forEach(p => { profileMap[p.id] = p.display_name })
      }

      // Step 3: Merge customer names into orders
      const enriched = (ordersData || []).map(o => ({
        ...o,
        customer_name: profileMap[o.customer_id] || null,
      }))
      setOrders(enriched)
    } catch (e) {
      setError(e.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Filter
  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || (o.order_number || '').toLowerCase().includes(q)
      || (o.id || '').toLowerCase().includes(q)
      || (o.customer_name || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Status filter options
  const statuses = ['all', ...Array.from(new Set(orders.map(o => o.status).filter(Boolean)))]

  return (
    <div style={{ 
      background: 'transparent',
      minHeight: '100%', padding: '32px', borderRadius: 24,
      display: 'flex', flexDirection: 'column', gap: 20 
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: t.text, letterSpacing: -0.5 }}>Order History</h1>
          <p style={{ margin: '4px 0 0', fontSize: 15, color: t.text3 }}>
            {loading ? 'Loading…' : `${filtered.length.toLocaleString()} order${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px',
            background: 'rgba(15, 23, 42, 0.06)', border: '1px solid rgba(15, 23, 42, 0.15)',
            borderRadius: 10, color: '#0F172A', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 340 }}>
          <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: t.text4 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by order no or customer…"
            style={{
              width: '100%', boxSizing: 'border-box',
              paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
              background: t.input || 'rgba(255,255,255,0.05)',
              border: `1px solid ${t.border}`, borderRadius: 10,
              color: t.text, fontSize: 15, outline: 'none',
            }}
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          style={{
            padding: '9px 14px', background: t.input || 'rgba(255,255,255,0.05)',
            border: `1px solid ${t.border}`, borderRadius: 10, color: t.text,
            fontSize: 15, cursor: 'pointer', outline: 'none',
          }}
        >
          {statuses.map(s => (
            <option key={s} value={s} style={{ background: t.bg2 || '#fff', color: t.text }}>
              {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(15, 23, 42, 0.1)', borderTopColor: '#0F172A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <div style={{ fontSize: 16, color: '#64748B', fontWeight: 600 }}>Fetching orders…</div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#F87171', marginBottom: 6 }}>Failed to load orders</div>
          <div style={{ fontSize: 15, color: t.text3, marginBottom: 16 }}>{error}</div>
          <button onClick={fetchOrders} style={{ padding: '8px 20px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#F87171', cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>Retry</button>
        </div>
      ) : (
        <div style={{ background: t.card || 'rgba(255,255,255,0.03)', borderRadius: 16, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr style={{ background: t.tableHead || 'rgba(255,255,255,0.04)' }}>
                  {['Order No', 'Type', 'Customer', 'Date', 'Status', 'Total', 'Actions'].map(col => (
                    <th key={col} style={{
                      textAlign: 'left', padding: '12px 16px', fontSize: 12,
                      color: t.text3, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.8,
                      borderBottom: `2px solid ${t.border}`, whiteSpace: 'nowrap',
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '60px 20px', color: t.text4 }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>No orders found</div>
                      <div style={{ fontSize: 14, marginTop: 4, color: t.text3 }}>Try adjusting your filters</div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((order, i) => (
                    <tr
                      key={order.id}
                      style={{
                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                        transition: 'background 0.15s',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,211,238,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}
                    >
                      {/* Order No */}
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace', fontSize: 15 }}>
                          {order.order_number || `#${short(order.id)}`}
                        </div>
                      </td>
                      {/* Type */}
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, verticalAlign: 'middle' }}>
                        <TypePill t={t} type={order.order_type} />
                      </td>
                      {/* Customer */}
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, verticalAlign: 'middle' }}>
                        {order.customer_name ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 26, height: 26, borderRadius: '50%',
                              background: 'linear-gradient(135deg,#22D3EE,#14B8A6)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0,
                            }}>{order.customer_name[0]?.toUpperCase()}</div>
                            <span style={{ color: t.text2, fontWeight: 500 }}>{order.customer_name}</span>
                          </div>
                        ) : (
                          <span style={{ color: t.text4, fontSize: 14 }}>Walk-in</span>
                        )}
                      </td>
                      {/* Date */}
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, verticalAlign: 'middle', color: t.text3, whiteSpace: 'nowrap', fontSize: 14 }}>
                        {fmtDate(order.created_at)}
                      </td>
                      {/* Status */}
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, verticalAlign: 'middle' }}>
                        <StatusPill t={t} status={order.status} />
                      </td>
                      {/* Total */}
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, verticalAlign: 'middle' }}>
                        <span style={{ fontWeight: 700, color: t.text, fontSize: 16 }}>
                          {fmt(order.total, settings?.sym)}
                        </span>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, verticalAlign: 'middle' }}>
                          <button
                            onClick={() => setViewOrder(order)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '6px 14px', background: 'rgba(30, 41, 59, 0.05)',
                              border: '1px solid rgba(30, 41, 59, 0.12)', borderRadius: 8,
                              color: '#1E293B', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.1)'; e.currentTarget.style.transform = 'scale(1.03)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.05)'; e.currentTarget.style.transform = 'scale(1)' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            View
                          </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '14px 20px', borderTop: `1px solid ${t.border}` }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: `1px solid ${t.border}`,
                  background: 'transparent', color: page === 1 ? t.text4 : t.text2,
                  cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 600,
                }}
              >← Prev</button>
              <span style={{ fontSize: 15, color: t.text3, padding: '0 8px' }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: `1px solid ${t.border}`,
                  background: 'transparent', color: page === totalPages ? t.text4 : t.text2,
                  cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 600,
                }}
              >Next →</button>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} settings={settings} />

      {/* spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default OrderHistory
