import { useState, useMemo } from 'react'
import { Badge, Card, StatCard, Table, Btn, Modal } from '@/components/ui'
import { useVenueStore } from '@/stores/venueStore'
import { fmt, ts } from '@/lib/utils'
import { 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle, 
  DollarSign, 
  ArrowRight, 
  Activity, 
  CheckCircle2,
  Clock,
  LogOut,
  Package
} from 'lucide-react'

export const AdminDashboard = ({ orders = [], products = [], users = [], venues = [], settings, t, currentUser }) => {
  const [showClosing, setShowClosing] = useState(false)
  const [showLowStock, setShowLowStock] = useState(false)
  const { selectedVenueId, selectedSiteId } = useVenueStore()

  const activeOrders = useMemo(() => {
    let filtered = Array.isArray(orders) ? orders : [];
    if (selectedSiteId) {
       filtered = filtered.filter(o => o.site_id === selectedSiteId || o.siteId === selectedSiteId)
    } else if (selectedVenueId) {
       filtered = filtered.filter(o => o.venue_id === selectedVenueId || o.venueId === selectedVenueId)
    }
    return filtered;
  }, [orders, selectedSiteId, selectedVenueId])

  const stats = useMemo(() => {
    // Find the latest order date from our data to simulate "today"
    const latestDate = activeOrders.length > 0 
      ? activeOrders.reduce((latest, o) => {
          const tsStr = o.created_at || o.date || '';
          const orderDate = tsStr.includes('T') ? tsStr.split('T')[0] : tsStr.split(' ')[0];
          return orderDate && orderDate > latest ? orderDate : latest;
        }, '2000-01-01') 
      : new Date().toISOString().split('T')[0]
      
    const todayOrders = activeOrders.filter(o => {
      const tsStr = o.created_at || o.date || '';
      return tsStr.startsWith(latestDate);
    })
    const todaySales = todayOrders.reduce((s, o) => s + (o.total || 0), 0)
    const lowStockProducts = (products || []).filter(p => (p.stock || 0) < 10)
    const lowStockCount = lowStockProducts.length
    const profitSnapshot = todaySales * 0.3 // Assuming 30% margin for demo

    return {
      todaySales,
      todayOrders: todayOrders.length,
      lowStockCount,
      lowStockProducts,
      profitSnapshot
    }
  }, [activeOrders, products])

  const recentActivity = useMemo(() => {
    return (activeOrders || []).slice(0, 5).map(o => ({
      id: o.id,
      type: 'Sale',
      msg: `${o.customerName || 'Customer'} purchased for ${fmt(o.total, settings?.sym)}`,
      time: (o.created_at || o.date || '')?.includes('T') ? (o.created_at || o.date).split('T')[1].substring(0,5) : (o.created_at || o.date || '')?.split(' ')[1] || 'Just now',
      status: 'success'
    }))
  }, [orders, settings])

  const topProducts = useMemo(() => {
    return [
      { name: 'Premium VIP Access', sales: 124, revenue: 14500.50 },
      { name: 'Standard Match Ticket', sales: 98, revenue: 4900.00 },
      { name: 'Home Kit Jersey 2026', sales: 85, revenue: 7649.15 },
      { name: 'Stadium Scarf', sales: 64, revenue: 1280.00 },
      { name: 'Matchday Program', sales: 45, revenue: 225.00 }
    ]
  }, [])

  const latestOrderDate = useMemo(() => activeOrders.length > 0 
    ? activeOrders.reduce((latest, o) => {
        const tsStr = o.created_at || o.date || '';
        const orderDate = tsStr.includes('T') ? tsStr.split('T')[0] : tsStr.split(' ')[0];
        return orderDate && orderDate > latest ? orderDate : latest;
      }, '2000-01-01') 
    : new Date().toISOString().split('T')[0], [activeOrders]);

  const outletPerformance = useMemo(() => {
    const siteStats = {};
    activeOrders.forEach(o => {
      const tsStr = o.created_at || o.date || '';
      if (tsStr.startsWith(latestOrderDate)) {
        const sid = o.site_id || o.siteId || 'unknown';
        if (!siteStats[sid]) siteStats[sid] = { sales: 0, orders: 0, profit: 0 };
        siteStats[sid].sales += (o.total || 0);
        siteStats[sid].orders += 1;
        siteStats[sid].profit += (o.total || 0) * 0.3;
      }
    });

    return (venues || []).flatMap(v => (v.sites || []).map(s => {
      const stats = siteStats[s.id] || { sales: 0, orders: 0, profit: 0 };
      return { venueName: v.name, siteName: s.name, id: s.id, ...stats };
    })).sort((a,b) => b.sales - a.sales);
  }, [activeOrders, venues, latestOrderDate]);

  const topOutlets = useMemo(() => {
    return outletPerformance.filter(o => o.sales > 0).slice(0, 4);
  }, [outletPerformance]);

  const maxOutletSale = useMemo(() => Math.max(...topOutlets.map(o => o.sales), 1), [topOutlets]);

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
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: 16 
      }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>
            System Control
          </h1>
          <p style={{ fontSize: 16, color: '#64748b', marginTop: 4, fontWeight: 600 }}>
            Good Afternoon, <span style={{ color: '#0f172a', fontWeight: 800 }}>{currentUser?.name || 'Admin'}</span>. Here is your store at a glance.
          </p>
        </div>
        <Btn 
          t={t} 
          onClick={() => setShowClosing(true)}
          style={{ 
            background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 12,
            boxShadow: `0 4px 12px ${t.accent}40`,
            fontWeight: 800
          }}
        >
          <LogOut size={16} /> Daily Closing
        </Btn>
      </div>

      {/* KPI Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: 24 
      }}>
        {/* Stock Alerts */}
        <div 
          onClick={() => setShowLowStock(true)}
          style={{ 
            background: '#fff', 
            borderRadius: 24, 
            padding: '24px 32px', 
            boxShadow: '0 12px 40px rgba(0,0,0,0.06)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 20, 
            position: 'relative', 
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'none'}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: stats.lowStockCount > 0 ? '#ef4444' : '#22c55e' }} />
          <div style={{ width: 56, height: 56, borderRadius: 16, background: stats.lowStockCount > 0 ? '#fef2f2' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stats.lowStockCount > 0 ? '#ef4444' : '#22c55e' }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{stats.lowStockCount}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>STOCK ALERTS</div>
          </div>
        </div>
        {/* Today Sales */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: '#22c55e' }} />
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#22c55e', letterSpacing: '-0.02em' }}>{fmt(stats.todaySales, settings?.sym)}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>TODAY SALES</div>
          </div>
        </div>
        {/* Total Orders */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: '#3b82f6' }} />
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <ShoppingCart size={28} />
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{stats.todayOrders}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>TOTAL ORDERS</div>
          </div>
        </div>
        {/* Profit Snapshot */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: t.accent }} />
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `${t.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accent }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{fmt(stats.profitSnapshot, settings?.sym)}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>PROFIT SNAPSHOT</div>
          </div>
        </div>
      </div>

      {/* Outlet Performance Details */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Venue & Outlet Performance</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Real-time contribution breakdown for <strong>{new Date(latestOrderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</strong></p>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {outletPerformance.map((outlet, i) => (
            <div key={outlet.id || i} style={{ 
              background: '#fff', 
              borderRadius: 24, 
              padding: '24px', 
              boxShadow: '0 8px 20px rgba(0,0,0,0.04)', 
              border: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              transition: 'transform 0.2s ease',
              cursor: 'default'
            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: i === 0 ? '#eff6ff' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i === 0 ? '#3b82f6' : '#94a3b8' }}>
                    <Activity size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>{outlet.siteName}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{outlet.venueName}</div>
                  </div>
                </div>
                {i === 0 && outlet.sales > 0 && <Badge t={t} text="Top Performer" color="blue" />}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Orders</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{outlet.orders}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Profit</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#22c55e' }}>{fmt(outlet.profit, settings?.sym)}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Total Revenue</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{fmt(outlet.sales, settings?.sym)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Low Stock Details Modal */}
      {showLowStock && (
        <Modal t={t} title="Low Stock Inventory" onClose={() => setShowLowStock(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: `${t.yellow}10`, padding: 12, borderRadius: 12 }}>
              <AlertTriangle color={t.yellow} size={20} />
              <div style={{ fontSize: 13, color: t.text2 }}>
                The following products are currently below the threshold of <strong>10 units</strong>.
              </div>
            </div>
            
            <div style={{ maxHeight: 400, overflowY: 'auto', borderRadius: 12, border: `1px solid ${t.border}` }}>
              <Table 
                t={t}
                cols={['Product', 'Category', 'Stock']}
                rows={stats.lowStockProducts.map(p => [
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, color: t.text }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: t.text4 }}>{p.sku || 'No SKU'}</span>
                  </div>,
                  <span style={{ fontSize: 12, color: t.text3 }}>{p.category || 'General'}</span>,
                  <Badge t={t} text={`${p.stock || 0} left`} color={p.stock < 5 ? 'red' : 'yellow'} />
                ])}
              />
              {stats.lowStockProducts.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: t.text4 }}>
                  No low stock items found. All levels are healthy!
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Btn t={t} variant="outline" style={{ flex: 1 }} onClick={() => setShowLowStock(false)}>Close</Btn>
              <Btn 
                t={t} 
                style={{ flex: 1, background: t.accent, color: '#fff' }} 
                onClick={() => {
                  // This could navigate to inventory page
                  setShowLowStock(false)
                }}
              >
                Manage Inventory
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Daily Closing Modal */}
      {showClosing && (
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
        }} onClick={() => setShowClosing(false)}>
          <div style={{ 
            maxWidth: 450, 
            width: '100%', 
            borderRadius: 40, 
            padding: 48, 
            background: '#fff',
            boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
            textAlign: 'center',
            position: 'relative',
            animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 24, 
              background: '#eef2ff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 28px',
              color: '#4f46e5',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.1)'
            }}>
              <Clock size={40} />
            </div>
            
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', margin: '0 0 10px 0', letterSpacing: '-0.03em' }}>Daily Closing</h2>
            <p style={{ fontSize: 16, color: '#64748b', margin: '0 0 32px 0', fontWeight: 600 }}>Summary for {new Date().toLocaleDateString()}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', background: '#f8fafc', borderRadius: 20 }}>
                <span style={{ fontSize: 15, color: '#64748b', fontWeight: 700 }}>Total Revenue</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{fmt(stats.todaySales, settings?.sym)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', background: '#f8fafc', borderRadius: 20 }}>
                <span style={{ fontSize: 15, color: '#64748b', fontWeight: 700 }}>Total Orders</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{stats.todayOrders}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'transparent', margin: '4px 0' }}>
                <span style={{ fontSize: 16, color: '#0f172a', fontWeight: 800 }}>Est. Profit</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#22c55e' }}>{fmt(stats.profitSnapshot, settings?.sym)}</span>
              </div>
            </div>

            <Btn t={t} onClick={() => setShowClosing(false)} style={{ 
              width: '100%', 
              borderRadius: 20, 
              padding: 20, 
              fontWeight: 900,
              fontSize: 16,
              background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
              color: '#fff',
              boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
              border: 'none'
            }}> 
              Close Day & Log Out 
            </Btn>
          </div>
        </div>
      )}
      <style>{`
        @keyframes modalSlideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
