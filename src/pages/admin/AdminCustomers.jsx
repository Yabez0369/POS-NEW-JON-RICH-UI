import { useState } from 'react'
import { Btn, Badge, Card, StatCard, Modal, Table } from '@/components/ui'
import { fmt } from '@/lib/utils'
import { Users, Wifi, Truck, Award, Star, TrendingUp, Search, Eye, Mail, Phone, ShoppingBag, Download, Plus, Filter, MoreHorizontal } from 'lucide-react'

const TIER_ICONS = { Gold: '👑', Silver: '🥈', Bronze: '🥉' }
const TIER_COLORS = { Gold: '#f59e0b', Silver: '#64748b', Bronze: '#b45309' }

export const AdminCustomers = ({ users, orders, t, settings }) => {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState('all')

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
    
    return true
  }).sort((a, b) => {
    return (b.dynamicSpent || 0) - (a.dynamicSpent || 0)
  })

  const enriched = baseCustomers;

  const stats = {
    total: totalCustomers,
    gold: goldMembers,
    totalSpent: baseCustomers.reduce((s, u) => s + (u.dynamicSpent || 0), 0)
  }

  const totalOrdersCount = baseCustomers.reduce((s, u) => s + (u.myOrders?.length || 0), 0)
  const aov = totalOrdersCount > 0 ? stats.totalSpent / totalOrdersCount : 0;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
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
        alignItems: 'flex-end', 
        flexWrap: 'wrap', 
        gap: 16,
        marginBottom: 32
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#64748b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>CRM</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>
            Customer Hub
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ 
            padding: '10px 20px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', 
            fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, 
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'all 0.2s'
          }}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32, marginBottom: 32 }}>
        {/* Total Customers Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', borderRadius: 28, padding: '36px 48px', 
          color: '#fff', boxShadow: '0 20px 40px -10px rgba(79,70,229,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative Background Elements */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)' }}></div>
          <div style={{ position: 'absolute', bottom: -60, right: 80, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)' }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>Total Network</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
              <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>{stats.total}</div>
              <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 14, fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={16} /> +12%
              </div>
            </div>
          </div>
          <div style={{ width: 96, height: 96, borderRadius: 28, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, border: '1px solid rgba(255,255,255,0.2)' }}>
            <Users size={44} color="#fff" strokeWidth={2.5} />
          </div>
        </div>

        {/* Gold Members Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: 28, padding: '36px 48px', 
          color: '#fff', boxShadow: '0 20px 40px -10px rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative Background Elements */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)' }}></div>
          <div style={{ position: 'absolute', bottom: -60, right: 80, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)' }}></div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>VIP Gold Members</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
              <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>{stats.gold}</div>
              <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: 14, fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={16} /> +2 this month
              </div>
            </div>
          </div>
          <div style={{ width: 96, height: 96, borderRadius: 28, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, border: '1px solid rgba(255,255,255,0.3)' }}>
            <Award size={44} color="#fff" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        {/* Tier Filter */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#f1f5f9', padding: 6, borderRadius: 16 }}>
          {['all', 'Gold', 'Silver', 'Bronze'].map(tier => {
            return (
              <button key={tier} onClick={() => setFilterTier(tier)}
                style={{
                  padding: '8px 16px', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 800,
                  border: 'none',
                  background: filterTier === tier ? '#fff' : 'transparent',
                  color: filterTier === tier ? '#0f172a' : '#64748b',
                  boxShadow: filterTier === tier ? '0 4px 10px rgba(0,0,0,0.04)' : 'none',
                  transition: 'all 0.2s'
                }}>
                {tier === 'all' ? 'All Customers' : tier}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Search by name or email..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontSize: 14, fontWeight: 600, outline: 'none', transition: 'all 0.2s' }} />
          </div>

          <button style={{ 
            padding: '12px 20px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', 
            fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, 
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'all 0.2s'
          }}>
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>



      {/* Customer List Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        
        {/* List Header */}
        {filtered.length > 0 && (
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'minmax(250px, 1.5fr) 100px 100px 100px 100px 120px', gap: 16, 
            padding: '0 24px', marginBottom: 4, color: '#94a3b8', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 
          }}>
            <div style={{ paddingLeft: 68 }}>Customer</div>
            <div style={{ textAlign: 'center' }}>Points</div>
            <div style={{ textAlign: 'center' }}>Spent</div>
            <div style={{ textAlign: 'center' }}>Orders</div>
            <div style={{ textAlign: 'center' }}>Last Order</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{ padding: 80, textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: 20 }}>
            <Users size={60} strokeWidth={1} style={{ marginBottom: 16, opacity: 0.4 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>No customers match your filters.</div>
          </div>
        ) : (
          filtered.map(u => {
            const tierCol = TIER_COLORS[u.dynamicTier] || '#9ca3af'
            const pts = u.loyaltyPoints || u.loyalty_points || u.pts || 0;
            const myOrders = u.myOrders || [];
            
            // Generate some random looking mock last order date based on ID
            const daysAgo = (u.id?.charCodeAt(0) || 5) % 15 + 1;
            const lastOrderText = myOrders.length ? `${daysAgo} days ago` : 'Never';

            return (
              <div key={u.id} style={{ 
                background: '#fff', borderRadius: 16, padding: '16px 24px', 
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9',
                display: 'grid', gridTemplateColumns: 'minmax(250px, 1.5fr) 100px 100px 100px 100px 120px', gap: 16, alignItems: 'center',
                transition: 'all 0.2s', cursor: 'default'
              }}>
                {/* Avatar & Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      width: 48, height: 48, borderRadius: 14, background: '#f8fafc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0
                    }}>
                      {u.avatar || '👱'}
                    </div>
                    <div style={{ 
                      position: 'absolute', top: -4, right: -4, 
                      width: 18, height: 18, borderRadius: '50%', background: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {TIER_ICONS[u.dynamicTier]}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{u.name}</div>
                    <div style={{ 
                      display: 'inline-flex', padding: '2px 8px', borderRadius: 6, border: `1px solid ${tierCol}30`, 
                      color: tierCol, fontSize: 11, fontWeight: 800, alignItems: 'center', gap: 4,
                      background: `${tierCol}05`
                    }}>
                      {TIER_ICONS[u.dynamicTier]} {u.dynamicTier}
                    </div>
                  </div>
                </div>

                {/* Points */}
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                   <Star size={14} fill="#f59e0b" color="#f59e0b" /> {pts.toLocaleString()}
                </div>
                
                {/* Spent */}
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>
                   {fmt(u.dynamicSpent, settings?.sym)}
                </div>
                
                {/* Orders */}
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>
                   {myOrders.length}
                </div>
                
                {/* Last Order */}
                <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textAlign: 'center' }}>
                   {lastOrderText}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
                  <button onClick={() => setSelected(u)} style={{ 
                    padding: '8px 16px', borderRadius: 10, border: 'none', background: '#e0e7ff', 
                    color: '#6366f1', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                    <Eye size={14} /> View
                  </button>
                  <button style={{ 
                    width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' 
                  }}>
                    <MoreHorizontal size={16} />
                  </button>
                </div>

              </div>
            )
          })
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
              const myOrders = selected.myOrders || []
              const tierCol = TIER_COLORS[selected.dynamicTier] || '#9ca3af'
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                  {/* Profile Hero */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                    borderRadius: 32, 
                    padding: '32px 40px', 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 24,
                    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)'
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
                      <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
                         <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={14} /> {selected.email}</span>
                         {selected.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} /> {selected.phone}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 12, fontSize: 13, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {TIER_ICONS[selected.dynamicTier]} {selected.dynamicTier}
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 12, fontSize: 13, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                          ⭐ {(selected.loyaltyPoints || selected.pts || 0).toLocaleString()} pts
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
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#6366f1' }}>{fmt(selected.dynamicSpent, settings?.sym)}</div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Revenue</div>
                    </div>
                    <div style={{ padding: '24px', borderRadius: 24, background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#f59e0b' }}>{(selected.loyaltyPoints || selected.pts || 0).toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Points</div>
                    </div>
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

