import { useState, useMemo } from 'react'
import { Badge, Card, StatCard, Table, Btn } from '@/components/ui'
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
  LogOut
} from 'lucide-react'

export const AdminDashboard = ({ orders = [], products = [], users = [], settings, t }) => {
  const [showClosing, setShowClosing] = useState(false)
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
    const lowStockCount = (products || []).filter(p => (p.stock || 0) < 10).length
    const profitSnapshot = todaySales * 0.3 // Assuming 30% margin for demo

    return {
      todaySales,
      todayOrders: todayOrders.length,
      lowStockCount,
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

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 24,
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
          <h1 style={{ fontSize: 28, fontWeight: 900, color: t.text, margin: 0, letterSpacing: '-0.02em' }}>
            System Control
          </h1>
          <p style={{ fontSize: 14, color: t.text3, marginTop: 4 }}>
            Good Morning, <span style={{ color: t.accent, fontWeight: 700 }}>Admin</span>. Here is your store at a glance.
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 20 
      }}>
        <StatCard 
          t={t} 
          title="Today Sales" 
          value={fmt(stats.todaySales, settings?.sym)} 
          description="Gross revenue today"
          icon={<DollarSign size={20} />} 
          color={t.green}
          trend={+14.5}
        />
        <StatCard 
          t={t} 
          title="Total Orders" 
          value={stats.todayOrders} 
          description="Transactions processed"
          icon={<ShoppingCart size={20} />} 
          color={t.blue}
          trend={+8.2}
        />
        <StatCard 
          t={t} 
          title="Stock Alerts" 
          value={stats.lowStockCount} 
          description="Items below threshold"
          icon={<AlertTriangle size={20} />} 
          color={stats.lowStockCount > 10 ? t.red : t.yellow}
          trend={stats.lowStockCount > 0 ? 'Risk' : 'Clear'}
        />
        <StatCard 
          t={t} 
          title="Profit Snapshot" 
          value={fmt(stats.profitSnapshot, settings?.sym)} 
          description="Est. net (30% margin)"
          icon={<TrendingUp size={20} />} 
          color={t.accent}
          trend={+12}
        />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: 24,
        alignItems: 'start'
      }} className="admin-grid-main">
        
        {/* Recent Orders Hub */}
        <Card t={t} style={{ padding: 0, overflow: 'hidden', borderRadius: 20 }}>
          <div style={{ 
            padding: '20px 24px', 
            borderBottom: `1px solid ${t.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: t.text }}>Recent Sales Hub</h3>
            <Btn t={t} variant="ghost" style={{ fontSize: 12, fontWeight: 700, color: t.accent }}>
              View All <ArrowRight size={14} />
            </Btn>
          </div>
          <Table 
            t={t}
            cols={['Order ID', 'Customer', 'Total', 'Status']}
            rows={activeOrders.slice(0, 6).map(o => [
              <span style={{ fontWeight: 700, fontSize: 13, color: t.text2 }}>{o.id}</span>,
              <div style={{ fontSize: 13, color: t.text }}>{o.customerName || 'Guest'}</div>,
              <span style={{ fontWeight: 800, color: t.accent }}>{fmt(o.total, settings?.sym)}</span>,
              <Badge t={t} text={o.status || 'Active'} color={o.status === 'completed' ? 'green' : 'blue'} />
            ])}
          />
        </Card>

        {/* Activity Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card t={t} style={{ borderRadius: 20 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 900, color: t.text, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} color={t.accent} /> Live Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recentActivity.map((act, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: 10, 
                    background: act.status === 'success' ? `${t.green}15` : `${t.red}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {act.status === 'success' ? <CheckCircle2 size={16} color={t.green} /> : <AlertTriangle size={16} color={t.red} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: t.text, fontWeight: 600, lineHeight: 1.3 }}>{act.msg}</div>
                    <div style={{ fontSize: 11, color: t.text4, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} /> {act.time}
                    </div>
                  </div>
                  {i < recentActivity.length - 1 && (
                    <div style={{ 
                      position: 'absolute', 
                      left: 15, 
                      top: 36, 
                      bottom: -12, 
                      width: 1, 
                      background: t.border,
                      zIndex: 0 
                    }} />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Smart Alert Placeholder */}
          {stats.lowStockCount > 5 && (
            <div style={{ 
              background: `linear-gradient(135deg, ${t.red}, #991b1b)`, 
              borderRadius: 20, 
              padding: '20px', 
              color: '#fff',
              boxShadow: `0 8px 16px ${t.red}40`
            }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <AlertTriangle size={24} />
                <div>
                  <div style={{ fontWeight: 900, fontSize: 15 }}>Urgent: Low Stock</div>
                  <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>{stats.lowStockCount} products are reaching critical levels. Restock now to avoid sales loss.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Closing Modal */}
      {showClosing && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 9999, 
          background: 'rgba(0,0,0,0.4)', 
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }} onClick={() => setShowClosing(false)}>
          <Card t={t} style={{ maxWidth: 400, width: '100%', borderRadius: 24, padding: 32 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 64, 
                height: 64, 
                borderRadius: 20, 
                background: `${t.accent}15`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px',
                color: t.accent
              }}>
                <Clock size={32} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: t.text, margin: '0 0 8px 0' }}>Daily Closing</h2>
              <p style={{ fontSize: 14, color: t.text3, margin: '0 0 24px 0' }}>Summary for {new Date().toLocaleDateString()}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: t.bg, borderRadius: 12 }}>
                  <span style={{ fontSize: 14, color: t.text3 }}>Total Revenue</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: t.text }}>{fmt(stats.todaySales, settings?.sym)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: t.bg, borderRadius: 12 }}>
                  <span style={{ fontSize: 14, color: t.text3 }}>Total Orders</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: t.text }}>{stats.todayOrders}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: t.bg2, borderRadius: 12 }}>
                  <span style={{ fontSize: 14, color: t.text3, fontWeight: 700 }}>Est. Profit</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: t.green }}>{fmt(stats.profitSnapshot, settings?.sym)}</span>
                </div>
              </div>

              <Btn t={t} onClick={() => setShowClosing(false)} style={{ width: '100%', borderRadius: 14, padding: 14, fontWeight: 800 }}> Close Day & Log Out </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
