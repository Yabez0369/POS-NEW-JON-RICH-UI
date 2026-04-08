import { useState } from 'react'
import { Btn, Badge, Card, StatCard, Modal, Table } from '@/components/ui'
import { fmt } from '@/lib/utils'
import { Users, Wifi, Truck, Award, Star, TrendingUp, Search, Eye, Mail, Phone, ShoppingBag } from 'lucide-react'

const TIER_ICONS = { Gold: '👑', Silver: '🥈', Bronze: '🥉' }
const TIER_COLORS = { Gold: '#f59e0b', Silver: '#64748b', Bronze: '#b45309' }

export const AdminCustomers = ({ users, orders, t, settings }) => {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterTier, setFilterTier] = useState('all')
  const [sortBy, setSortBy] = useState('spent')

  const baseCustomers = users.filter(u => u.role === 'customer').map(u => {
    const myOrders = orders.filter(o => o.customerId === u.id || o.customer_id === u.id)
    const dynamicSpent = myOrders.reduce((s, o) => s + (o.total || 0), 0)
    const spent = Math.max(u.totalSpent || u.total_spent || 0, dynamicSpent)
    
    let tier = u.tier || 'Bronze'
    if (spent >= 1500) tier = 'Gold'
    else if (spent >= 500) tier = 'Silver'
    else tier = 'Bronze'
    
    return { ...u, dynamicSpent: spent, dynamicTier: tier, myOrders }
  })

  // Calculate stats for all customers (ignore search/filter)
  const totalCustomers = baseCustomers.length
  const goldMembers = baseCustomers.filter(u => u.dynamicTier === 'Gold').length
  const silverMembers = baseCustomers.filter(u => u.dynamicTier === 'Silver').length
  const totalPoints = baseCustomers.reduce((s, u) => s + (u.loyaltyPoints || u.loyalty_points || 0), 0)

  // Filter customers based on search and selected filter type
  const filtered = baseCustomers.filter(u => {
    // Basic search filtering (Name, Email, Phone)
    const matchesSearch = search === '' || 
      (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (u.email || '').toLowerCase().includes(search.toLowerCase()) || 
      (u.phone && String(u.phone).includes(search))

    if (!matchesSearch) return false
    
    // Tier filter
    if (filterTier !== 'all' && u.dynamicTier !== filterTier) return false;

    // Filter by order types using their order history
    if (filterType === 'all') return true
    
    const myOrders = u.myOrders || []
    
    if (filterType === 'walk-in') {
      return myOrders.some(o => (o.orderType || o.order_type) === 'in-store')
    }
    if (filterType === 'online') {
      return myOrders.some(o => (o.payment || o.payment_method) === 'Online' || (o.orderType || o.order_type) === 'online')
    }
    if (filterType === 'delivery') {
      return myOrders.some(o => (o.orderType || o.order_type) === 'delivery')
    }
    if (filterType === 'unknown') { // new/unknown
      return myOrders.length === 0
    }
    
    return true
  }).sort((a, b) => {
    if (sortBy === 'spent') return (b.dynamicSpent || 0) - (a.dynamicSpent || 0)
    if (sortBy === 'pts') return (b.loyaltyPoints || b.loyalty_points || 0) - (a.loyaltyPoints || a.loyalty_points || 0)
    if (sortBy === 'orders') return (b.myOrders?.length || 0) - (a.myOrders?.length || 0)
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
    return 0
  })

  const enriched = baseCustomers;

  const stats = {
    total: totalCustomers,
    online: baseCustomers.filter(u => u.myOrders.some(o => (o.orderType || o.order_type) === 'online' || (o.payment || o.payment_method) === 'Online')).length,
    delivery: baseCustomers.filter(u => u.myOrders.some(o => (o.orderType || o.order_type) === 'delivery')).length,
    gold: goldMembers,
    totalPts: totalPoints,
    totalSpent: baseCustomers.reduce((s, u) => s + (u.dynamicSpent || 0), 0)
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 32,
      background: '#f8fafc',
      margin: '-24px',
      padding: '32px',
      minHeight: 'calc(100vh - 64px)',
      animation: 'fadeIn 0.5s ease-out' 
    }}>

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: 16,
        position: 'sticky',
        top: -32,
        zIndex: 50,
        background: '#f8fafc',
        padding: '16px 0',
        margin: '-16px 0 0 0'
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 12, letterSpacing: '-0.03em' }}>
            <Users size={24} color="#4f46e5" strokeWidth={2.5} /> Customer Intelligence
          </h1>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 20 }}>
        {[
          { label: 'Total Customers', value: stats.total, color: '#4f46e5', icon: <Users size={24} /> },
          { label: 'Online', value: stats.online, color: '#3b82f6', icon: <Wifi size={24} /> },
          { label: 'Delivery', value: stats.delivery, color: '#8b5cf6', icon: <Truck size={24} /> },
          { label: 'Gold Members', value: stats.gold, color: '#f59e0b', icon: <Award size={24} /> },
          { label: 'Loyalty Pts', value: (stats.totalPts || 0).toLocaleString(), color: '#eab308', icon: <Star size={24} /> },
          { label: 'Revenue', value: fmt(stats.totalSpent, settings?.sym), color: '#22c55e', icon: <TrendingUp size={24} /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 24, padding: '24px 28px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid #f1f5f9' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginTop: 4, letterSpacing: '-0.02em' }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input type="text" placeholder="Search name, email, phone..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '14px 16px 14px 52px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 600, outline: 'none', transition: 'all 0.2s' }} />
        </div>

        {/* Customer Type Filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', background: '#f1f5f9', padding: 6, borderRadius: 16 }}>
          {[
            { value: 'all', label: 'All' },
            { value: 'online', label: 'Online' },
            { value: 'walk-in', label: 'Walk-in' },
            { value: 'delivery', label: 'Delivery' },
            { value: 'unknown', label: 'New' },
          ].map(({ value, label }) => (
            <button key={value} onClick={() => setFilterType(value)}
              style={{
                padding: '8px 16px', borderRadius: 12, cursor: 'pointer', fontSize: 12, fontWeight: 800,
                border: 'none',
                background: filterType === value ? '#fff' : 'transparent',
                color: filterType === value ? '#4f46e5' : '#64748b',
                boxShadow: filterType === value ? '0 4px 10px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s'
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tier Filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', background: '#f1f5f9', padding: 6, borderRadius: 16 }}>
          {['all', 'Gold', 'Silver', 'Bronze'].map(tier => {
            const col = tier === 'Gold' ? '#f59e0b' : tier === 'Silver' ? '#64748b' : tier === 'Bronze' ? '#b45309' : '#64748b'
            return (
              <button key={tier} onClick={() => setFilterTier(tier)}
                style={{
                  padding: '8px 16px', borderRadius: 12, cursor: 'pointer', fontSize: 12, fontWeight: 800,
                  border: 'none',
                  background: filterTier === tier ? '#fff' : 'transparent',
                  color: filterTier === tier ? col : '#64748b',
                  boxShadow: filterTier === tier ? '0 4px 10px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s'
                }}>
                {tier === 'all' ? 'All Tiers' : `${TIER_ICONS[tier]} ${tier}`}
              </button>
            )
          })}
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding: '12px 18px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontSize: 13, fontWeight: 700, outline: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <option value="spent">Sort: Highest Spend</option>
          <option value="pts">Sort: Most Points</option>
          <option value="orders">Sort: Most Orders</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
      </div>

      {/* Results Count */}
      <div style={{ fontSize: 12, color: t.text4, fontWeight: 600 }}>
        Showing <strong style={{ color: t.text }}>{filtered.length}</strong> of <strong style={{ color: t.text }}>{enriched.length}</strong> customers
      </div>

      {/* Customer Table */}
      <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 80, textAlign: 'center', color: '#94a3b8' }}>
            <Users size={60} strokeWidth={1} style={{ marginBottom: 16, opacity: 0.4 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>No customers match your filters.</div>
            <div style={{ fontSize: 14, marginTop: 8, fontWeight: 600 }}>Try adjusting the search or filter options above.</div>
          </div>
        ) : (
          <Table
            t={t}
            cols={['Customer', 'Contact', 'Tier', 'Points', 'Total Spent', 'Orders', 'Actions']}
            rows={filtered.map(u => {
              const tierCol = TIER_COLORS[u.tier] || '#9ca3af'
              return [
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `${tierCol}10`, border: `2px solid ${tierCol}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 900, color: tierCol, flexShrink: 0
                  }}>{u.avatar || u.name?.[0] || 'U'}</div>
                  <div>
                    <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 15 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, marginTop: 2 }}>Joined {u.joinDate || '2024'}</div>
                  </div>
                </div>,
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 13, color: '#445569', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                    <Mail size={14} color="#94a3b8" /> {u.email}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                    <Phone size={14} color="#94a3b8" /> {u.phone || '—'}
                  </div>
                </div>,
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 900, color: tierCol }}>
                  {TIER_ICONS[u.tier]} {u.tier}
                </span>,
                <span style={{ color: '#f59e0b', fontWeight: 900, fontSize: 15 }}>⭐ {(u.pts || 0).toLocaleString()}</span>,
                <span style={{ fontWeight: 900, color: '#4f46e5', fontSize: 16 }}>{fmt(u.spent, settings?.sym)}</span>,
                <div style={{ padding: '6px 12px', borderRadius: 8, background: '#eef2ff', color: '#4f46e5', fontSize: 12, fontWeight: 900, display: 'inline-block' }}>
                   {u.myOrders.length} orders
                </div>,
                <Btn t={t} variant="ghost" style={{ 
                  color: '#4f46e5', 
                  fontSize: 13, 
                  fontWeight: 800,
                  padding: '8px 16px', 
                  borderRadius: 10,
                  background: '#f8fafc',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8,
                  border: '1px solid #e2e8f0'
                }} onClick={() => setSelected(u)}>
                  <Eye size={16} /> View Profile
                </Btn>,
              ]
            })}
          />
        )}
      </div>

      {selected && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 9999, 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24
        }} onClick={() => setSelected(null)}>
          <div style={{ 
            maxWidth: 720, 
            width: '100%', 
            borderRadius: 40, 
            padding: 48, 
            background: '#fff',
            boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
            position: 'relative',
            animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={e => e.stopPropagation()}>
            {(() => {
              const myOrders = (orders || []).filter(o => o.customerId === selected.id || o.customer_id === selected.id)
              const tierCol = TIER_COLORS[selected.tier] || '#9ca3af'
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                  {/* Profile Hero */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
                    borderRadius: 32, 
                    padding: '32px 40px', 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 24,
                    boxShadow: '0 20px 40px rgba(79, 70, 229, 0.2)'
                  }}>
                    <div style={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: 24, 
                      background: 'rgba(255,255,255,0.2)', 
                      border: '4px solid rgba(255,255,255,0.3)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: 28, 
                      fontWeight: 900, 
                      flexShrink: 0 
                    }}>
                      {selected.avatar || selected.name?.[0] || 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>{selected.name}</div>
                      <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                         <Mail size={14} /> {selected.email}
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 12, fontSize: 13, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {TIER_ICONS[selected.tier]} {selected.tier}
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 12, fontSize: 13, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                          ⭐ {selected.pts?.toLocaleString()} pts
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <div style={{ padding: '24px', borderRadius: 24, background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#3b82f6' }}>{myOrders.length}</div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Orders</div>
                    </div>
                    <div style={{ padding: '24px', borderRadius: 24, background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#4f46e5' }}>{fmt(selected.spent, settings?.sym)}</div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Revenue</div>
                    </div>
                    <div style={{ padding: '24px', borderRadius: 24, background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#f59e0b' }}>{selected.pts?.toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Points</div>
                    </div>
                  </div>

                  {/* Order History */}
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <ShoppingBag size={20} color="#4f46e5" strokeWidth={2.5} /> Recent History
                    </div>
                    {myOrders.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, padding: 32, background: '#f8fafc', borderRadius: 24, border: '1px dashed #e2e8f0', fontWeight: 600 }}>No historical data found.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {myOrders.slice(0, 5).map(o => (
                          <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>#{o.id?.slice(-8).toUpperCase() || o.order_number}</div>
                              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>
                                {(o.date || o.created_at || '').split(/[ T]/)[0]} · {(o.items || o.order_items || []).length} products
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <span style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>{fmt(o.total, settings?.sym)}</span>
                              <div style={{ 
                                padding: '6px 12px', 
                                borderRadius: 10, 
                                fontSize: 11, 
                                fontWeight: 900, 
                                background: o.status === 'completed' ? '#f0fdf4' : '#fffbeb',
                                color: o.status === 'completed' ? '#22c55e' : '#f59e0b',
                                textTransform: 'uppercase'
                              }}>
                                {o.status || 'completed'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
