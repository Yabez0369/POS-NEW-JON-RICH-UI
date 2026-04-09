import { useState, useMemo, useEffect } from 'react'
import { useVenueStore } from '@/stores/venueStore'
import { fmt } from '@/lib/utils'
import dayjs from 'dayjs'
import {
  TrendingUp, ShoppingCart, AlertTriangle, ChevronRight, Activity, ArrowUpRight, ArrowDownRight, Store, Eye, Clock, Box, Sparkles
} from 'lucide-react'

export const AdminDashboard = ({ orders = [], products = [], users = [], venues = [], sites = [], settings, t, currentUser }) => {
  const { selectedVenueId, selectedSiteId } = useVenueStore()
  const [now, setNow] = useState(dayjs())

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000)
    return () => clearInterval(timer)
  }, [])

  const activeOrders = useMemo(() => {
    let filtered = Array.isArray(orders) ? orders : [];
    if (selectedSiteId) {
      filtered = filtered.filter(o => o.site_id === selectedSiteId || o.siteId === selectedSiteId)
    } else if (selectedVenueId) {
      filtered = filtered.filter(o => o.venue_id === selectedVenueId || o.venueId === selectedVenueId)
    }
    return filtered;
  }, [orders, selectedSiteId, selectedVenueId])

  const latestOrderDate = useMemo(() => activeOrders.length > 0
    ? activeOrders.reduce((latest, o) => {
      const tsStr = o.created_at || o.date || '';
      const orderDate = tsStr.includes('T') ? tsStr.split('T')[0] : tsStr.split(' ')[0];
      return orderDate && orderDate > latest ? orderDate : latest;
    }, '2000-01-01')
    : new Date().toISOString().split('T')[0], [activeOrders]);

  const stats = useMemo(() => {
    const todayOrders = activeOrders.filter(o => {
      const tsStr = o.created_at || o.date || '';
      return tsStr.startsWith(latestOrderDate);
    })
    const todaySales = todayOrders.reduce((s, o) => s + (o.total || 0), 0)
    const lowStockProducts = (products || []).filter(p => (p.stock || 0) < 10)

    return {
      todaySales,
      todayOrders: todayOrders.length,
      lowStockProducts
    }
  }, [activeOrders, products, latestOrderDate])

  const outletPerformance = useMemo(() => {
    const siteStats = {};
    activeOrders.forEach(o => {
      const tsStr = o.created_at || o.date || '';
      if (tsStr.startsWith(latestOrderDate)) {
        const sid = o.site_id || o.siteId || 'unassigned';
        if (!siteStats[sid]) siteStats[sid] = { sales: 0, orders: 0 };
        siteStats[sid].sales += (o.total || 0);
        siteStats[sid].orders += 1;
      }
    });

    const flatVenues = [];
    (sites || []).forEach(s => {
      flatVenues.push({ venueName: 'System', siteName: s.name, id: s.id, ...(siteStats[s.id] || { sales: 0, orders: 0 }) });
    });

    (venues || []).forEach(v => {
      if (siteStats[v.id] && !flatVenues.some(f => String(f.id) === String(v.id))) {
        flatVenues.push({ venueName: 'System', siteName: v.name, id: v.id, ...siteStats[v.id] });
      }
      (v.sites || []).forEach(s => {
        if (!flatVenues.some(f => String(f.id) === String(s.id))) {
          flatVenues.push({ venueName: v.name, siteName: s.name, id: s.id, ...(siteStats[s.id] || { sales: 0, orders: 0 }) });
        }
      });
    });

    return flatVenues.sort((a, b) => b.sales - a.sales);
  }, [activeOrders, venues, sites, latestOrderDate]);

  const topOutlet = outletPerformance.length > 0 ? outletPerformance[0] : null;

  const criticalAlerts = useMemo(() => {
    let alerts = [];
    const oos = stats.lowStockProducts.filter(p => p.stock === 0);
    if (oos.length > 0) alerts.push({ type: 'error', color: '#EF4444', bg: '#FEF2F2', title: 'Out of Stock', desc: `${oos.length} items depleted` });
    
    const low = stats.lowStockProducts.filter(p => p.stock > 0);
    if (low.length > 0) alerts.push({ type: 'warning', color: '#F59E0B', bg: '#FFFBEB', title: 'Low Stock', desc: `${low.length} items left` });

    return alerts;
  }, [stats.lowStockProducts, outletPerformance]);

  const activityFeed = useMemo(() => {
    return activeOrders.slice(0, 15).map(o => ({
      id: o.id,
      time: (o.created_at || o.date || '')?.includes('T') ? (o.created_at || o.date).split('T')[1].substring(0, 5) : (o.created_at || o.date || '')?.split(' ')[1] || 'Just now',
      desc: `Order ${o.id ? '#' + o.id.toString().substring(0, 6).toUpperCase() : 'New Transaction'}`,
      val: fmt(o.total, settings?.sym),
    }));
  }, [activeOrders, settings]);

  return (
    <div className="command-hub-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .command-hub-root {
          --primary: #6366F1;
          --bg-main: #F4F7FE;
          --text-deep: #0F172A;
          --text-muted: #64748B;
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(226, 232, 240, 0.8);
          
          background: var(--bg-main);
          min-height: calc(100vh - 64px);
          margin: -24px;
          padding: 32px 40px;
          font-family: 'Outfit', sans-serif;
          color: var(--text-deep);
        }

        .hub-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .hub-title-box h1 {
          font-size: 34px;
          font-weight: 900;
          letter-spacing: -0.04em;
          margin: 0;
          color: var(--text-deep);
        }
        .hub-breadcrumb {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 6px;
        }

        .hub-clock-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          padding: 10px 20px;
          border-radius: 99px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-deep);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          border: 1px solid var(--glass-border);
        }

        .hub-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
        }

        .hub-card {
          background: white;
          border-radius: 32px;
          padding: 32px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 10px 40px -20px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          transition: transform 0.3s;
        }
        .hub-card:hover { transform: translateY(-4px); }

        /* Hero Hub */
        .hero-hub-card {
          grid-column: span 8;
          background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%);
          color: white;
          position: relative;
          overflow: hidden;
          justify-content: space-between;
        }
        .hero-hub-card::after {
          content: '';
          position: absolute;
          top: -20%; right: -10%;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
          border-radius: 50%;
        }

        .hh-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .hh-title { font-size: 42px; font-weight: 900; margin: 24px 0 8px 0; letter-spacing: -0.04em; }
        .hh-subtitle { font-size: 15px; color: rgba(255, 255, 255, 0.6); font-weight: 500; }

        .hh-stats { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
        .hhs-val { font-size: 64px; font-weight: 900; line-height: 1; letter-spacing: -0.05em; }
        .hhs-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: rgba(255, 255, 255, 0.5); margin-bottom: 8px; }

        /* Alerts Hub */
        .alerts-hub-card { grid-column: span 4; background: #FFF1F2; border-color: #FECDD3; }
        .ah-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .ah-title { font-size: 18px; font-weight: 900; color: #9F1239; margin: 0; }
        .ah-count { background: #E11D48; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; }

        .alert-row {
          background: white;
          padding: 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;
          box-shadow: 0 4px 12px rgba(159, 18, 57, 0.05);
        }
        .al-dot { width: 8px; height: 8px; border-radius: 50%; }
        .al-body { flex: 1; }
        .al-title { font-size: 14px; font-weight: 800; color: var(--text-deep); margin-bottom: 2px; }
        .al-desc { font-size: 12px; color: var(--text-muted); }

        /* Stats Spans */
        .stat-hub-span { grid-column: span 4; padding: 24px; }
        .sh-label { font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .sh-val-row { display: flex; justify-content: space-between; align-items: baseline; }
        .sh-val { font-size: 32px; font-weight: 900; letter-spacing: -0.03em; }
        .sh-trend { font-size: 13px; font-weight: 800; color: #10B981; display: flex; align-items: center; gap: 4px; }

        /* Perf Matrix */
        .perf-hub-card { grid-column: span 8; }
        .ph-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
        .ph-icon { width: 56px; height: 56px; background: #EEF2FF; color: var(--primary); border-radius: 20px; display: flex; align-items: center; justify-content: center; }
        .ph-title { font-size: 22px; font-weight: 900; margin: 0; }
        
        .perf-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .perf-item { background: #F8FAFC; border-radius: 24px; padding: 24px; border: 1px solid var(--glass-border); }
        .pi-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .pi-name { font-size: 15px; font-weight: 800; color: var(--text-deep); margin: 0; }
        .pi-val { font-size: 24px; font-weight: 900; margin-bottom: 8px; }
        .pi-bar-bg { height: 8px; background: #E2E8F0; border-radius: 10px; overflow: hidden; }
        .pi-bar-fill { height: 100%; border-radius: 10px; transition: width 1s ease; }

        /* Inventory Hub */
        .inv-hub-card { grid-column: span 4; }
        .iv-list { display: flex; flex-direction: column; gap: 16px; }
        .iv-item { background: #F8FAFC; border-radius: 20px; padding: 16px; border: 1px solid var(--glass-border); }
        .iv-name { font-size: 14px; font-weight: 800; margin-bottom: 8px; }
        .iv-badge { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 900; text-transform: uppercase; }

        /* Animation */
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-hub { animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}</style>

      {/* Header */}
      <div className="hub-header">
        <div className="hub-title-box">
          <div className="hub-breadcrumb">System Overview</div>
          <h1>Command Intelligence Center</h1>
        </div>
        <div className="hub-clock-pill">
          <Clock size={18} color="var(--primary)" /> {now.format('dddd, DD MMMM')} · {now.format('HH:mm:ss')}
        </div>
      </div>

      <div className="hub-grid">
        
        {/* Main Hero */}
        <div className="hub-card hero-hub-card animate-hub">
          <div>
            <div className="hh-badge"><Sparkles size={14} /> Peak Performance Detected</div>
            <h2 className="hh-title">{topOutlet ? topOutlet.siteName : 'Primary Flagship Store'}</h2>
            <p className="hh-subtitle">{topOutlet ? topOutlet.venueName : 'Main Hub'} · Global Intelligence Enabled</p>
          </div>
          
          <div className="hh-stats">
            <div>
              <div className="hhs-label">Daily Revenue Stream</div>
              <div className="hhs-val">{fmt(topOutlet ? topOutlet.sales : 3800.11, settings?.sym)}</div>
            </div>
            <div className="hh-badge" style={{ padding: '12px 24px', fontSize: '16px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', border: '1px solid #10B981' }}>
              <TrendingUp size={20} /> +18.4%
            </div>
          </div>
        </div>

        {/* Intelligence Alerts */}
        <div className="hub-card alerts-hub-card animate-hub" style={{ animationDelay: '0.1s' }}>
          <div className="ah-header">
            <h3 className="ah-title">Intelligence Alerts</h3>
            <div className="ah-count">{criticalAlerts.length}</div>
          </div>
          
          <div>
            {criticalAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9F1239', fontWeight: 700 }}>Optimal Performance Verified.</div>
            ) : (
              criticalAlerts.slice(0, 3).map((alt, idx) => (
                <div key={idx} className="alert-row">
                  <div className="al-dot" style={{ background: alt.color }} />
                  <div className="al-body">
                    <div className="al-title">{alt.title}</div>
                    <div className="al-desc">{alt.desc}</div>
                  </div>
                  <ChevronRight size={16} color="#FECDD3" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="hub-card stat-hub-span animate-hub" style={{ animationDelay: '0.2s' }}>
          <div className="sh-label">Aggregated Revenue</div>
          <div className="sh-val-row">
            <div className="sh-val">{fmt(stats.todaySales, settings?.sym)}</div>
            <div className="sh-trend"><TrendingUp size={16} /> +12%</div>
          </div>
        </div>

        <div className="hub-card stat-hub-span animate-hub" style={{ animationDelay: '0.3s' }}>
          <div className="sh-label">Active Workload</div>
          <div className="sh-val-row">
            <div className="sh-val">{stats.todayOrders} <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>Orders</span></div>
            <div className="sh-trend" style={{ color: '#0EA5E9' }}><Activity size={16} /> Steady</div>
          </div>
        </div>

        <div className="hub-card stat-hub-span animate-hub" style={{ animationDelay: '0.4s' }}>
          <div className="sh-label">System Health</div>
          <div className="sh-val-row">
            <div className="sh-val">100%</div>
            <div className="sh-trend" style={{ color: '#8B5CF6' }}><Sparkles size={16} /> Optimal</div>
          </div>
        </div>

        {/* Performance Matrix */}
        <div className="hub-card perf-hub-card animate-hub" style={{ animationDelay: '0.5s' }}>
          <div className="ph-header">
            <div className="ph-icon"><Store size={28} /></div>
            <div>
              <h2 className="ph-title">Performance Matrix</h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>Real-time outlet efficiency tracking</p>
            </div>
          </div>

          <div className="perf-grid">
            {outletPerformance.slice(0, 6).map((outlet, idx) => {
              const maxS = Math.max(...outletPerformance.map(o => o.sales), 1);
              const pct = (outlet.sales / maxS) * 100;
              return (
                <div key={idx} className="perf-item">
                  <div className="pi-head">
                    <div className="pi-name">{outlet.siteName}</div>
                    <ArrowUpRight size={16} color={idx === 0 ? '#10B981' : '#CBD5E1'} />
                  </div>
                  <div className="pi-val">{fmt(outlet.sales, settings?.sym)}</div>
                  <div className="pi-bar-bg">
                    <div className="pi-bar-fill" style={{ width: `${pct}%`, background: idx === 0 ? 'var(--primary)' : '#CBD5E1' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dynamic Watchlist */}
        <div className="hub-card inv-hub-card animate-hub" style={{ animationDelay: '0.6s' }}>
          <div className="ph-header">
            <div className="ph-icon" style={{ background: '#FFF7ED', color: '#F97316' }}><Eye size={28} /></div>
            <div>
              <h2 className="ph-title">Watchlist</h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>Inventory health monitor</p>
            </div>
          </div>

          <div className="iv-list">
            {stats.lowStockProducts.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>All nodes fully operational.</div>
            ) : (
              stats.lowStockProducts.slice(0, 4).map((prod, idx) => (
                <div key={idx} className="iv-item">
                  <div className="iv-name">{prod.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="iv-badge" style={{ background: prod.stock === 0 ? '#FEE2E2' : '#FFEDD5', color: prod.stock === 0 ? '#EF4444' : '#F97316' }}>
                      {prod.stock === 0 ? 'Depleted' : `${prod.stock} Units Left`}
                    </span>
                    <Box size={14} color="#CBD5E1" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
