import { useState, useMemo } from 'react'
import { Btn, Badge, Card, StatCard, Modal, Table } from '@/components/ui'
import { fmt } from '@/lib/utils'
import {
  Users, Search, Star, ShoppingBag, Wifi, Store,
  Truck, Filter, Eye, TrendingUp, Award, Phone, Mail
} from 'lucide-react'

const TIER_COLORS = { Gold: '#f59e0b', Silver: '#9ca3af', Bronze: '#cd7f32' }
const TIER_ICONS = { Gold: '🥇', Silver: '🥈', Bronze: '🥉' }

function getCustomerType(orders = []) {
  const hasDelivery = orders.some(o => {
    const type = (o.orderType || o.order_type || '').toLowerCase()
    const addr = o.deliveryAddress || o.delivery_address || o.address
    const fee = o.deliveryCharge || o.delivery_charge || 0
    const status = (o.deliveryStatus || o.delivery_status || '').toLowerCase()
    return type === 'delivery' || !!addr || fee > 0 || !!status
  })

  const hasOnline = orders.some(o => {
    const type = (o.orderType || o.order_type || '').toLowerCase()
    const pay = (o.payment || o.payment_method || '').toLowerCase()
    const ctr = (o.counter || o.counter_name || '').toLowerCase()
    const cash = (o.cashierName || o.cashier_name || '').toLowerCase()
    return type === 'online' || type === 'pickup' || pay === 'online' || ctr === 'online' || cash === 'online'
  })

  const hasInStore = orders.some(o => {
    const type = (o.orderType || o.order_type || '').toLowerCase()
    return type === 'in-store' || type === 'walk-in' || type === 'pos'
  })

  if (hasDelivery) return 'delivery'
  if (hasOnline) return 'online'
  if (hasInStore) return 'walk-in'
  return 'unknown'
}

function CustomerTypeBadge({ type, t }) {
  const config = {
    online: { label: 'Online', color: t.blue, icon: <Wifi size={11} /> },
    delivery: { label: 'Delivery', color: t.accent, icon: <Truck size={11} /> },
    'walk-in': { label: 'Walk-in', color: t.green, icon: <Store size={11} /> },
    unknown: { label: 'New', color: t.text4, icon: <Star size={11} /> },
  }
  const { label, color, icon } = config[type] || config.unknown
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: `${color}15`, color, border: `1px solid ${color}30`
    }}>
      {icon} {label}
    </span>
  )
}

export const AdminCustomers = ({ users = [], orders = [], t, settings }) => {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterTier, setFilterTier] = useState('all')
  const [sortBy, setSortBy] = useState('spent')

  const enriched = useMemo(() => {
    return (users || []).filter(u => u.role === 'customer').map(u => {
      const myOrders = (orders || []).filter(o => o.customerId === u.id || o.customer_id === u.id)
      const dynSpent = myOrders.reduce((s, o) => s + (o.total || 0), 0)
      const spent = Math.max(u.totalSpent || u.total_spent || 0, dynSpent)
      const tier = spent >= 1500 ? 'Gold' : spent >= 500 ? 'Silver' : 'Bronze'
      const pts = u.loyaltyPoints || u.loyalty_points || 0
      const custType = myOrders.length > 0 ? getCustomerType(myOrders) : 'unknown'
      return { ...u, spent, tier, pts, myOrders, custType }
    })
  }, [users, orders])

  const stats = useMemo(() => ({
    total: enriched.length,
    online: enriched.filter(u => u.custType === 'online').length,
    delivery: enriched.filter(u => u.custType === 'delivery').length,
    gold: enriched.filter(u => u.tier === 'Gold').length,
    totalPts: enriched.reduce((s, u) => s + u.pts, 0),
    totalSpent: enriched.reduce((s, u) => s + u.spent, 0),
  }), [enriched])

  const filtered = useMemo(() => {
    let list = enriched.filter(u => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        String(u.phone || '').includes(q)
      const matchType = filterType === 'all' || u.custType === filterType
      const matchTier = filterTier === 'all' || u.tier === filterTier
      return matchSearch && matchType && matchTier
    })

    if (sortBy === 'spent') list = [...list].sort((a, b) => b.spent - a.spent)
    else if (sortBy === 'pts') list = [...list].sort((a, b) => b.pts - a.pts)
    else if (sortBy === 'orders') list = [...list].sort((a, b) => b.myOrders.length - a.myOrders.length)
    else if (sortBy === 'name') list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    return list
  }, [enriched, search, filterType, filterTier, sortBy])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease-out' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: t.text, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={26} color={t.accent} /> Customer Intelligence
        </h1>
        <p style={{ fontSize: 13, color: t.text3, marginTop: 4 }}>
          Manage loyalty tiers, track spending, and analyse online vs walk-in behaviour.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Customers', value: stats.total, color: t.blue, icon: <Users size={18} /> },
          { label: 'Online Customers', value: stats.online, color: t.accent, icon: <Wifi size={18} /> },
          { label: 'Delivery Customers', value: stats.delivery, color: t.purple || '#a855f7', icon: <Truck size={18} /> },
          { label: 'Gold Members', value: stats.gold, color: '#f59e0b', icon: <Award size={18} /> },
          { label: 'Total Loyalty Pts', value: (stats.totalPts || 0).toLocaleString(), color: t.yellow, icon: <Star size={18} /> },
          { label: 'Total Revenue', value: fmt(stats.totalSpent, settings?.sym), color: t.green, icon: <TrendingUp size={18} /> },
        ].map(({ label, value, color, icon }) => (
          <Card key={label} t={t} style={{ padding: '14px 18px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.text4, textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color }}>{value}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card t={t} style={{ padding: '14px 18px', borderRadius: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.text4 }} />
          <input type="text" placeholder="Search name, email, phone..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 38px', borderRadius: 10, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: 13, outline: 'none' }} />
        </div>

        {/* Customer Type Filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: t.text4 }}><Filter size={11} /> TYPE:</span>
          {[
            { value: 'all', label: 'All' },
            { value: 'online', label: '🌐 Online' },
            { value: 'walk-in', label: '🏪 Walk-in' },
            { value: 'delivery', label: '🚚 Delivery' },
            { value: 'unknown', label: '✨ New' },
          ].map(({ value, label }) => (
            <button key={value} onClick={() => setFilterType(value)}
              style={{
                padding: '5px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                border: `1px solid ${filterType === value ? t.accent : t.border}`,
                background: filterType === value ? `${t.accent}15` : 'transparent',
                color: filterType === value ? t.accent : t.text3,
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tier Filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: t.text4 }}>TIER:</span>
          {['all', 'Gold', 'Silver', 'Bronze'].map(tier => {
            const col = tier === 'all' ? t.text3 : TIER_COLORS[tier]
            return (
              <button key={tier} onClick={() => setFilterTier(tier)}
                style={{
                  padding: '5px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  border: `1px solid ${filterTier === tier ? col : t.border}`,
                  background: filterTier === tier ? `${col}15` : 'transparent',
                  color: filterTier === tier ? col : t.text3,
                }}>
                {tier === 'all' ? 'All Tiers' : `${TIER_ICONS[tier]} ${tier}`}
              </button>
            )
          })}
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 10, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: 12, outline: 'none', cursor: 'pointer' }}>
          <option value="spent">Sort: Highest Spend</option>
          <option value="pts">Sort: Most Points</option>
          <option value="orders">Sort: Most Orders</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
      </Card>

      {/* Results Count */}
      <div style={{ fontSize: 12, color: t.text4, fontWeight: 600 }}>
        Showing <strong style={{ color: t.text }}>{filtered.length}</strong> of <strong style={{ color: t.text }}>{enriched.length}</strong> customers
      </div>

      {/* Customer Table */}
      <Card t={t} style={{ padding: 0, overflow: 'hidden', borderRadius: 20 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: t.text4 }}>
            <Users size={40} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>No customers match your filters.</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting the search or filter options above.</div>
          </div>
        ) : (
          <Table
            t={t}
            cols={['Customer', 'Contact', 'Type', 'Tier', 'Points', 'Total Spent', 'Orders', '']}
            rows={filtered.map(u => {
              const tierCol = TIER_COLORS[u.tier] || '#9ca3af'
              return [
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 12,
                    background: `${tierCol}20`, border: `2px solid ${tierCol}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 900, color: tierCol, flexShrink: 0
                  }}>{u.avatar || u.name?.[0] || 'U'}</div>
                  <div>
                    <div style={{ fontWeight: 800, color: t.text, fontSize: 13 }}>{u.name}</div>
                    <div style={{ fontSize: 10, color: t.text4 }}>Joined {u.joinDate || '2024'}</div>
                  </div>
                </div>,
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontSize: 11, color: t.text3, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Mail size={10} /> {u.email}
                  </div>
                  <div style={{ fontSize: 11, color: t.text3, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={10} /> {u.phone || '—'}
                  </div>
                </div>,
                <CustomerTypeBadge type={u.custType} t={t} />,
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900, color: tierCol }}>
                  {TIER_ICONS[u.tier]} {u.tier}
                </span>,
                <span style={{ color: t.yellow, fontWeight: 800 }}>⭐ {(u.pts || 0).toLocaleString()}</span>,
                <span style={{ fontWeight: 900, color: t.accent }}>{fmt(u.spent, settings?.sym)}</span>,
                <Badge t={t} text={`${u.myOrders.length} orders`} color="blue" />,
                <Btn t={t} variant="ghost" style={{ color: t.accent, fontSize: 12, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setSelected(u)}>
                  <Eye size={13} /> View
                </Btn>,
              ]
            })}
          />
        )}
      </Card>

      {/* Customer Profile Modal */}
      {selected && (
        <Modal t={t} title={`Customer — ${selected.name}`} onClose={() => setSelected(null)} width={620}>
          {(() => {
            const myOrders = (orders || []).filter(o => o.customerId === selected.id || o.customer_id === selected.id)
            const tierCol = TIER_COLORS[selected.tier] || '#9ca3af'
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Profile Hero */}
                <div style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, borderRadius: 16, padding: '20px 24px', color: '#fff', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, flexShrink: 0 }}>
                    {selected.avatar || selected.name?.[0] || 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>{selected.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{selected.email}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                        {TIER_ICONS[selected.tier]} {selected.tier}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                        ⭐ {selected.pts?.toLocaleString()} pts
                      </span>
                      <CustomerTypeBadge type={selected.custType} t={{ ...t, blue: '#fff', green: '#fff', accent: '#fff', text4: 'rgba(255,255,255,0.6)' }} />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <Card t={t} style={{ padding: '12px 14px', textAlign: 'center', borderRadius: 12 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: t.blue }}>{myOrders.length}</div>
                    <div style={{ fontSize: 11, color: t.text4, fontWeight: 700, marginTop: 2 }}>TOTAL ORDERS</div>
                  </Card>
                  <Card t={t} style={{ padding: '12px 14px', textAlign: 'center', borderRadius: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: t.accent }}>{fmt(selected.spent, settings?.sym)}</div>
                    <div style={{ fontSize: 11, color: t.text4, fontWeight: 700, marginTop: 2 }}>TOTAL SPENT</div>
                  </Card>
                  <Card t={t} style={{ padding: '12px 14px', textAlign: 'center', borderRadius: 12 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: t.yellow }}>{selected.pts?.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: t.text4, fontWeight: 700, marginTop: 2 }}>LOYALTY PTS</div>
                  </Card>
                </div>

                {/* Order History */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: t.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingBag size={15} color={t.accent} /> Order History
                  </div>
                  {myOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', color: t.text4, fontSize: 13, padding: 20 }}>No orders yet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {myOrders.slice(0, 8).map(o => (
                        <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: t.bg3, borderRadius: 10, alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{o.id || o.order_number}</div>
                            <div style={{ fontSize: 11, color: t.text4 }}>
                              {(o.date || o.created_at || '').split(/[ T]/)[0]} · {(o.items || o.order_items || []).length} items
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 14, fontWeight: 900, color: t.accent }}>{fmt(o.total, settings?.sym)}</span>
                            <Badge t={t} text={o.status || 'completed'} color={o.status === 'completed' ? 'green' : 'yellow'} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </Modal>
      )}
    </div>
  )
}
