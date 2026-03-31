import { useState } from 'react'
import { Btn, Badge, Card, StatCard, Modal, Table } from '@/components/ui'
import { fmt } from '@/lib/utils'

export const AdminCustomers = ({ users, orders, t, settings }) => {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

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
  const customers = baseCustomers.filter(u => {
    // Basic search filtering (Name, Email, Phone)
    const matchesSearch = search === '' || 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase()) || 
      (u.phone && u.phone.includes(search))

    if (!matchesSearch) return false

    // Filter by order types using their order history
    if (filter === 'All') return true
    
    const myOrders = u.myOrders || []
    
    if (filter === 'Walk-in') {
      return myOrders.some(o => (o.orderType || o.order_type) === 'in-store')
    }
    if (filter === 'Online') {
      return myOrders.some(o => (o.payment || o.payment_method) === 'Online' || (o.orderType || o.order_type) === 'online')
    }
    if (filter === 'Delivery') {
      return myOrders.some(o => (o.orderType || o.order_type) === 'delivery')
    }
    
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: t.text }}>👥 Customer Management</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14 }}>
        <StatCard t={t} title="Total Customers" value={totalCustomers} color={t.blue} icon="👥" />
        <StatCard t={t} title="Gold Members" value={goldMembers} color="#f59e0b" icon="🥇" />
        <StatCard t={t} title="Silver Members" value={silverMembers} color="#9ca3af" icon="🥈" />
        <StatCard t={t} title="Total Loyalty Pts" value={totalPoints} color={t.yellow} icon="⭐" />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search by name, email, phone..." 
          style={{ flex: 1, minWidth: 200, background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, padding: '10px 14px', color: t.text, fontSize: 13, outline: 'none' }} 
        />
        <select 
          value={filter} 
          onChange={e => setFilter(e.target.value)} 
          style={{ padding: '10px 14px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, color: t.text, fontSize: 13, outline: 'none', cursor: 'pointer' }}
        >
          <option value="All">All Types</option>
          <option value="Walk-in">Walk-in Customers</option>
          <option value="Online">Online Customers</option>
          <option value="Delivery">Delivery Customers</option>
        </select>
      </div>

      <Card t={t} style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          t={t}
          cols={['Customer', 'Email', 'Phone', 'Tier', 'Points', 'Total Spent', 'Orders', '']}
          rows={customers.map(u => {
            const myOrders = u.myOrders || []
            const usedTier = u.dynamicTier || 'Bronze'
            const tierC = { Bronze: '#cd7f32', Silver: '#9ca3af', Gold: '#f59e0b', 'N/A': '#9ca3af' }
            return [
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, background: (tierC[usedTier] || '#9ca3af') + '20', border: `2px solid ${tierC[usedTier] || '#9ca3af'}40`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: tierC[usedTier] || '#9ca3af' }}>{u.avatar}</div>
                <span style={{ fontWeight: 700, color: t.text }}>{u.name}</span>
              </div>,
              <span style={{ fontSize: 12, color: t.text3 }}>{u.email}</span>,
              <span style={{ fontSize: 12, color: t.text3 }}>{u.phone || '—'}</span>,
              <Badge t={t} text={usedTier.toUpperCase()} color={usedTier === 'Gold' ? 'yellow' : usedTier === 'Silver' ? 'blue' : 'orange'} />,
              <span style={{ color: t.yellow, fontWeight: 700 }}>⭐{u.loyaltyPoints || u.loyalty_points || 0}</span>,
              <span style={{ fontWeight: 800, color: t.accent }}>{fmt(u.dynamicSpent || 0, settings?.sym)}</span>,
              <span style={{ color: t.blue, fontWeight: 700 }}>{myOrders.length}</span>,
              <Btn t={t} variant="secondary" size="sm" onClick={() => setSelected(u)}>View Profile</Btn>,
            ]
          })}
        />
      </Card>

      {selected && (
        <Modal t={t} title={'Customer Profile — ' + selected.name} onClose={() => setSelected(null)} width={600}>
          {(() => {
            const myOrders = orders.filter(o => o.customerId === selected.id || o.customer_id === selected.id)
            const dynamicSpent = myOrders.reduce((s, o) => s + (o.total || 0), 0)
            const totalSpent = Math.max(selected.totalSpent || selected.total_spent || 0, dynamicSpent)
            const usedTier = selected.dynamicTier || selected.tier || 'Bronze'
            const pts = selected.loyaltyPoints || selected.loyalty_points || 0

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: `linear-gradient(135deg,${t.accent},${t.accent2})`, borderRadius: 12, padding: '20px 24px', color: '#fff' }}>
                  <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,.2)', border: '3px solid rgba(255,255,255,.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900 }}>{selected.avatar}</div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>{selected.name}</div>
                    <div style={{ fontSize: 13, opacity: .8 }}>{selected.email} · {selected.role}</div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 10 }}>
                      <span style={{ background: 'rgba(255,255,255,.2)', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{usedTier === 'Gold' ? '🥇' : usedTier === 'Silver' ? '🥈' : '🥉'} {usedTier}</span>
                      <span style={{ background: 'rgba(255,255,255,.2)', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>⭐ {pts} pts</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <StatCard t={t} title="Total Orders" value={myOrders.length} color={t.blue} icon="🧾" />
                  <StatCard t={t} title="Total Spent" value={fmt(totalSpent, settings?.sym)} color={t.accent} icon="💰" />
                  <StatCard t={t} title="Loyalty Points" value={pts} color={t.yellow} icon="⭐" />
                </div>

                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: t.text, marginBottom: 12 }}>Order History</div>
                  {myOrders.length === 0
                    ? <div style={{ color: t.text3, fontSize: 13 }}>No orders yet</div>
                    : myOrders.map(o => (
                      <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${t.border}`, flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{o.id || o.order_number}</div>
                          <div style={{ fontSize: 11, color: t.text3 }}>{o.date || o.created_at?.split('T')[0]} · {(o.items || o.order_items || []).length} items</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: t.accent }}>{fmt(o.total, settings?.sym)}</div>
                          <Badge t={t} text={o.status} color={o.status === 'completed' ? 'green' : 'yellow'} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )
          })()}
        </Modal>
      )}
    </div>
  )
}
