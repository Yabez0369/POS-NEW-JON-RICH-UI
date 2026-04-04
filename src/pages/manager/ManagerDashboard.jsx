import { Card, StatCard, Badge, Table } from '@/components/ui'
import { ImgWithFallback } from '@/components/shared'
import { PRODUCT_IMAGES } from '@/lib/seed-data'
import { fmt } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

function getOrderItems(o) {
  const items = o?.items || o?.order_items || []
  return Array.isArray(items) ? items : []
}

function toItemName(i) {
  return i?.product_name || i?.name || 'Unknown'
}

function toItemQty(i) {
  return i?.quantity ?? i?.qty ?? 0
}

export const ManagerDashboard = ({ orders = [], products = [], users = [], counters = [], t, settings, currentUser }) => {
  const navigate = useNavigate()
  
  // Filter core data by manager's assigned venue and site (if any)
  const venueId = currentUser?.venue_id
  const siteId = currentUser?.site_id
  
  const storeOrders = (Array.isArray(orders) ? orders : []).filter(o => 
    (!venueId || o.venue_id === venueId) && (!siteId || o.site_id === siteId)
  )
  const todayRevenue = storeOrders.reduce((s, o) => s + (o.total ?? 0), 0)
  const staffCount = (users || []).filter(u => 
    u.role === 'cashier' && (!venueId || u.venue_id === venueId) && (!siteId || u.site_id === siteId)
  ).length
  const activeCounters = (counters || []).filter(c => 
    (!venueId || c.venue_id === venueId) && (!siteId || c.site_id === siteId)
  )
  const lowStock = (products || []).filter(p => (p.stock ?? 0) < 10).length

  const topP = {}
  storeOrders.forEach(o => {
    getOrderItems(o).forEach(i => {
      const name = toItemName(i)
      topP[name] = (topP[name] || 0) + toItemQty(i)
    })
  })
  const topProducts = Object.entries(topP).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const handleExportCSV = () => {
    const csvRows = [
      ['Manager Dashboard Summary'],
      [`Date: ${new Date().toLocaleString()}`],
      [''],
      ['Metric', 'Value'],
      ['Total Revenue', fmt(todayRevenue, settings?.sym)],
      ['Active Sales', storeOrders.length],
      ['Active Staff', staffCount],
      [''],
      ['Top Products', 'Quantity Sold'],
      ...topProducts.map(([name, qty]) => [name, qty]),
      [''],
      ['Low Stock Alert', 'Current Stock'],
      ...(products || [])
        .filter(p => (p.stock ?? 0) < 15)
        .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
        .slice(0, 10)
        .map(p => [p.name, p.stock])
    ];

    const csvContent = csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Dashboard_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ 
      background: 'linear-gradient(180deg, #C4E8E7 0%, #FFFFFF 100%)',
      minHeight: '100%', padding: '32px', borderRadius: 24,
      display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40, fontFamily: "'Inter', sans-serif" 
    }}>

      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', letterSpacing: -0.5 }}>Store Overview</div>
          <div style={{ fontSize: 16, color: '#64748B', marginTop: 4 }}>Real-time metrics and active operations</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{
            background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: '10px 16px',
            fontSize: 15, fontWeight: 600, color: '#1E293B', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Customize
          </button>
          <button
            onClick={handleExportCSV}
            style={{
              background: 'linear-gradient(135deg, #0F172A, #1E293B)', border: 'none', borderRadius: 12, padding: '10px 20px',
              fontSize: 15, fontWeight: 600, color: '#fff', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        <StatCard t={t} title="Total Revenue" value={fmt(todayRevenue, settings?.sym)} color="#10B981" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>} trend={12} />
        <StatCard t={t} title="Active Sales" value={storeOrders.length} color="#3B82F6" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>} trend={5} />
        <StatCard t={t} title="Active Staff" value={staffCount} color="#8B5CF6" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>} />
        <StatCard t={t} title="Storage Usage" value="1.2 GB" color="#22D3EE" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 24 }}>

        {/* Left Column - Large Data Views */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1E293B' }}>Recent Activity</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#3B82F6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'opacity 0.15s' }}
                onClick={() => navigate('/app/order-history')}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                View all
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <th style={{ padding: '12px 0', fontSize: 14, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Order No</th>
                    <th style={{ padding: '12px 0', fontSize: 14, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ padding: '12px 0', fontSize: 14, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Customer</th>
                    <th style={{ padding: '12px 0', fontSize: 14, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 0', fontSize: 14, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {storeOrders.slice(0, 5).map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '16px 0', fontSize: 15, fontWeight: 600, color: '#475569', fontFamily: 'monospace' }}>{o.order_number || o.id.slice(0, 8)}</td>
                      <td style={{ padding: '16px 0' }}>
                        <span style={{
                          fontSize: 13, fontWeight: 700, padding: '4px 8px', borderRadius: 6,
                          background: (o.order_type || o.orderType) === 'delivery' ? '#FEF3C7' : '#E0E7FF',
                          color: (o.order_type || o.orderType) === 'delivery' ? '#D97706' : '#4F46E5',
                          textTransform: 'capitalize'
                        }}>
                          {o.order_type || o.orderType || 'in-store'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 0', fontSize: 15, color: '#1E293B', fontWeight: 500 }}>{o.customer_name || 'Walk-in Customer'}</td>
                      <td style={{ padding: '16px 0' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: o.status === 'completed' ? '#10B981' : '#F59E0B' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
                          <span style={{ textTransform: 'capitalize' }}>{o.status}</span>
                        </span>
                      </td>
                      <td style={{ padding: '16px 0', fontSize: 16, fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>{fmt(o.total, settings?.sym)}</td>
                    </tr>
                  ))}
                  {storeOrders.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '32px 0', textAlign: 'center', color: '#94A3B8', fontSize: 15 }}>No recent orders to show.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* File / Data Preview Panel */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1E293B' }}>Data Imports & Exports</div>
              <button style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { name: 'Products_Q3.csv', size: '2.4 MB', date: 'Oct 24, 2026', icon: 'file-text', color: '#10B981' },
                { name: 'Store_Revenue.pdf', size: '840 KB', date: 'Oct 23, 2026', icon: 'file', color: '#EF4444' },
                { name: 'User_Manifest.json', size: '1.1 MB', date: 'Oct 20, 2026', icon: 'database', color: '#8B5CF6' }
              ].map(file => (
                <div key={file.name} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16,
                  border: '1px solid #F1F5F9', background: '#F8FAFC', transition: 'all 0.2s', cursor: 'pointer'
                }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: file.color, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{file.size} • {file.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Mini Panels & Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 20 }}>Top Selling Items</div>
            {topProducts.length === 0 ? (
              <div style={{ color: '#94A3B8', fontSize: 15, textAlign: 'center', padding: '20px 0' }}>Data aggregating...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {topProducts.map(([name, qty], i) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: i === 0 ? '#FEF3C7' : '#F1F5F9', color: i === 0 ? '#D97706' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>#{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{qty} xs</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ 
            background: '#fff', borderRadius: 24, padding: 24, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
            border: '1px solid rgba(0,0,0,0.04)',
            borderLeft: '5px solid #F59E0B'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ color: '#F59E0B', fontSize: 18 }}>⚠️</span>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#3B82F6' }}>Low Stock Alerts</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(products || []).filter(p => (p.stock ?? 0) < 15).sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0)).slice(0, 5).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {p.image ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', borderRadius: 10, objectFit: 'cover' }} /> : (p.emoji || '📦')}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>{p.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{ 
                          fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
                          background: '#FFFBEB', color: '#B45309', border: '1px solid #FEF3C7'
                        }}>
                          {p.stock} / 10
                        </span>
                        <button style={{
                          fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 8,
                          background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#1E293B',
                          cursor: 'pointer'
                        }}>
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {lowStock === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#10B981', fontSize: 15, fontWeight: 500 }}>All stock levels are optimal.</div>
              )}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 20 }}>Counter Connectivity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeCounters.slice(0, 4).map(c => {
                const isActive = c.active === true || c.status === 'active';
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ position: 'relative', display: 'flex', height: 10, width: 10 }}>
                        {isActive && <span className="animate-ping" style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', background: '#10B981', opacity: 0.75 }}></span>}
                        <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: 10, width: 10, background: isActive ? '#10B981' : '#94A3B8' }}></span>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#1E293B' }}>{c.name}</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{isActive ? 'Online' : 'Offline'}</span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
