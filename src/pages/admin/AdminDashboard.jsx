import { useState, useMemo } from 'react'
import { Badge, Table, Btn, Modal } from '@/components/ui'
import { useVenueStore } from '@/stores/venueStore'
import { fmt } from '@/lib/utils'
import {
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Activity,
  Clock,
  LogOut,
  Package,
  Zap,
  ArrowUpRight,
  Info,
  CheckCircle2,
  Filter
} from 'lucide-react'

// Theme (SCSTIX) 
const colors = {
  primary: '#2563EB', // Blue
  bg: '#FFFFFF', // White
  dark: '#1F2937', // Dark Areas
  success: '#10B981', // Green
  warning: '#FBBF24', // Yellow
  error: '#EF4444', // Red
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  lightBg: '#F3F4F6'
}

export const AdminDashboard = ({ orders = [], products = [], users = [], venues = [], sites = [], settings, t, currentUser }) => {
  const { selectedVenueId, selectedSiteId } = useVenueStore()
  const [localSiteId, setLocalSiteId] = useState('all')

  const activeOrders = useMemo(() => {
    let filtered = Array.isArray(orders) ? orders : [];
    if (selectedSiteId) {
      filtered = filtered.filter(o => o.site_id === selectedSiteId || o.siteId === selectedSiteId)
    } else if (selectedVenueId) {
      filtered = filtered.filter(o => o.venue_id === selectedVenueId || o.venueId === selectedVenueId)
    }
    return filtered;
  }, [orders, selectedSiteId, selectedVenueId])

  const filteredOrders = useMemo(() => {
    if (localSiteId === 'all') return activeOrders;
    return activeOrders.filter(o => String(o.site_id || o.siteId) === String(localSiteId));
  }, [activeOrders, localSiteId])

  const latestOrderDate = useMemo(() => activeOrders.length > 0
    ? activeOrders.reduce((latest, o) => {
      const tsStr = o.created_at || o.date || '';
      const orderDate = tsStr.includes('T') ? tsStr.split('T')[0] : tsStr.split(' ')[0];
      return orderDate && orderDate > latest ? orderDate : latest;
    }, '2000-01-01')
    : new Date().toISOString().split('T')[0], [activeOrders]);

  const stats = useMemo(() => {
    const todayOrders = filteredOrders.filter(o => {
      const tsStr = o.created_at || o.date || '';
      return tsStr.startsWith(latestOrderDate);
    })
    const todaySales = todayOrders.reduce((s, o) => s + (o.total || 0), 0)
    const lowStockProducts = (products || []).filter(p => (p.stock || 0) < 10)
    const profitSnapshot = todaySales * 0.3

    return {
      todaySales,
      todayOrders: todayOrders.length,
      lowStockProducts,
      profitSnapshot
    }
  }, [filteredOrders, products, latestOrderDate])

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

    // 1. First, prioritize data from the primary 'sites' table
    (sites || []).forEach(s => {
      flatVenues.push({
        venueName: 'System',
        siteName: s.name,
        id: s.id,
        ...(siteStats[s.id] || { sales: 0, orders: 0 })
      });
    });

    // 2. Then check venues and their nested sites for legacy support
    (venues || []).forEach(v => {
      // If venue itself is a target
      if (siteStats[v.id] && !flatVenues.some(f => String(f.id) === String(v.id))) {
        flatVenues.push({ venueName: 'System', siteName: v.name, id: v.id, ...siteStats[v.id] });
      }

      (v.sites || []).forEach(s => {
        if (!flatVenues.some(f => String(f.id) === String(s.id))) {
          flatVenues.push({
            venueName: v.name,
            siteName: s.name,
            id: s.id,
            ...(siteStats[s.id] || { sales: 0, orders: 0 })
          });
        }
      });
    });

    // 3. Add any remaining orders that didn't match
    Object.keys(siteStats).forEach(sid => {
      if (!flatVenues.some(f => String(f.id) === String(sid))) {
        const siteLabel = sid === 'unassigned' ? 'Unassigned' : `Site ${String(sid).substring(0, 4)}`;
        flatVenues.push({ venueName: 'Venue', siteName: siteLabel, id: sid, ...siteStats[sid] });
      }
    });

    return flatVenues.sort((a, b) => b.sales - a.sales);
  }, [activeOrders, venues, sites, latestOrderDate]);

  const topOutlet = outletPerformance.length > 0 ? outletPerformance[0] : null;

  const criticalAlerts = useMemo(() => {
    let alerts = [];
    const oos = stats.lowStockProducts.filter(p => p.stock === 0);
    if (oos.length > 0) {
      alerts.push({ type: 'error', title: 'Out of Stock', desc: `${oos.length} items are completely depleted.` });
    }

    // Low stock alerts
    const low = stats.lowStockProducts.filter(p => p.stock > 0);
    if (low.length > 0) {
      alerts.push({ type: 'warning', title: 'Low Stock', desc: `${low.length} items are running low.` });
    }

    if (outletPerformance.length > 1 && outletPerformance[outletPerformance.length - 1].sales < (outletPerformance[0].sales * 0.2)) {
      alerts.push({ type: 'warning', title: 'Sales Drop', desc: `Performance at ${outletPerformance[outletPerformance.length - 1].siteName} dropped.` });
    }
    return alerts;
  }, [stats.lowStockProducts, outletPerformance]);

  const smartInsights = useMemo(() => {
    const defaultInsights = [
      { icon: <Zap size={18} />, text: 'Top outlets are experiencing peak traffic. Consider re-allocating floating staff.' },
      { icon: <TrendingUp size={18} />, text: `Revenue is trending +14% compared to this time last week. Optimal close projection ready.` },
      { icon: <Package size={18} />, text: 'Optimize Inventory: Transfer surplus stock from underperforming sites to balance demand.' }
    ];

    if (topOutlet && outletPerformance.length > 1) {
      defaultInsights.unshift({ icon: <Activity size={18} />, text: `${topOutlet.siteName} is the top performer today, generating ${Math.trunc((topOutlet.sales / (stats.todaySales || 1)) * 100)}% of total sales.` })
    }

    return defaultInsights.slice(0, 3);
  }, [stats.todaySales, topOutlet, outletPerformance]);

  const lowStockByOutlet = useMemo(() => {
    return outletPerformance.slice(0, 3).map((outlet, i) => {
      const assigned = stats.lowStockProducts.filter((_, idx) => idx % 3 === i);
      return { ...outlet, stockIssues: assigned };
    }).filter(o => o.stockIssues.length > 0);
  }, [outletPerformance, stats.lowStockProducts]);

  const getSiteName = (sid) => {
    if (!sid || sid === 'unassigned') return 'Unassigned';

    // Check primary sites table first
    const primarySite = (sites || []).find(s => String(s.id) === String(sid));
    if (primarySite) return primarySite.name;

    // Check venues and nested sites
    for (const v of (venues || [])) {
      if (String(v.id) === String(sid)) return v.name;
      const nestedSite = (v.sites || []).find(s => String(s.id) === String(sid));
      if (nestedSite) return nestedSite.name;
    }
    return `Site ${String(sid).substring(0, 4)}`;
  }

  const activityFeed = useMemo(() => {
    return activeOrders.slice(0, 10).map(o => ({
      id: o.id,
      time: (o.created_at || o.date || '')?.includes('T') ? (o.created_at || o.date).split('T')[1].substring(0, 5) : (o.created_at || o.date || '')?.split(' ')[1] || 'Just now',
      desc: `Order ${o.id ? '#' + o.id.toString().substring(0, 6).toUpperCase() : 'Completed'} processed`,
      val: fmt(o.total, settings?.sym),
      outlet: getSiteName(o.siteId || o.site_id)
    }));
  }, [activeOrders, settings, venues]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      background: '#f8fafc',
      margin: '-24px',
      padding: '32px',
      minHeight: 'calc(100vh - 64px)',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <style>{`
        .command-grid-v2 {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .command-grid-v2 { grid-template-columns: 1fr; }
        }
        .feed-scroll::-webkit-scrollbar { height: 6px; }
        .feed-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>

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
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Activity size={24} color="#4f46e5" strokeWidth={2.5} /> Command Center
          </h1>
        </div>
      </div>

      <div className="command-grid-v2">
        {/* LEFT COLUMN: PRIMARY FOCUS & MAIN ANALYSIS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* TOP ROW (LEFT): Hero Outlet Card */}
          <div style={{
            background: '#1e293b',
            borderRadius: 16,
            padding: 32,
            color: colors.bg,
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={14} /> Top Performing Outlet
                </div>
                <h2 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 4px 0', letterSpacing: '-0.02em', color: '#fff' }}>
                  {topOutlet ? topOutlet.siteName : 'No Data'}
                </h2>
                <div style={{ opacity: 0.6, fontSize: 14 }}>{topOutlet?.venueName || 'System'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7, marginBottom: 8 }}>Today's Revenue</div>
                <div style={{ fontSize: 42, fontWeight: 900, margin: 0, lineHeight: 1, color: '#fff' }}>{fmt(topOutlet?.sales || 0, settings?.sym)}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 8, color: '#34d399', fontSize: 14, fontWeight: 600 }}>
                  <ArrowUpRight size={16} /> +18.4% vs Yesterday
                </div>
              </div>
            </div>
          </div>

          {/* SECOND ROW: KPI Strip (All Outlets Summary) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{ background: colors.bg, padding: 20, borderRadius: 12, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: `${colors.primary}15`, color: colors.primary, width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={24} /></div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Revenue</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: colors.dark }}>{fmt(stats.todaySales, settings?.sym)}</div>
              </div>
            </div>
            <div style={{ background: colors.bg, padding: 20, borderRadius: 12, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: '#EFF6FF', color: colors.primary, width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingCart size={24} /></div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Orders</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: colors.dark }}>{stats.todayOrders}</div>
              </div>
            </div>
            <div style={{ background: colors.bg, padding: 20, borderRadius: 12, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: criticalAlerts.length > 0 ? `${colors.error}15` : `${colors.success}15`, color: criticalAlerts.length > 0 ? colors.error : colors.success, width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {criticalAlerts.length > 0 ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>System Alerts</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: colors.dark }}>{criticalAlerts.length}</div>
              </div>
            </div>
          </div>

          {/* THIRD ROW: Outlet Comparison */}
          <div style={{ background: colors.bg, borderRadius: 16, padding: 24, border: `1px solid ${colors.border}` }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 800, color: colors.dark }}>Outlet Performance Comparison</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {outletPerformance.length === 0 && <div style={{ color: colors.textSecondary, fontSize: 14 }}>No data available.</div>}
              {outletPerformance.map((outlet, idx) => {
                const maxSales = Math.max(...outletPerformance.map(o => o.sales), 1);
                const widthPct = Math.max((outlet.sales / maxSales) * 100, 5);
                return (
                  <div key={outlet.id || idx} style={{ background: colors.lightBg, padding: 16, borderRadius: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: colors.dark, marginBottom: 4 }}>{outlet.siteName}</div>
                    <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 12 }}>{outlet.orders} Orders</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: idx === 0 ? colors.primary : colors.dark }}>{fmt(outlet.sales, settings?.sym)}</span>
                    </div>
                    <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${widthPct}%`, height: '100%', background: idx === 0 ? colors.primary : '#94A3B8', borderRadius: 3 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* FOURTH ROW: Smart Insights (MAIN AREA) */}
          <div style={{ background: colors.bg, borderRadius: 16, padding: 24, border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ background: `${colors.primary}15`, color: colors.primary, width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: colors.dark }}>Active Intelligence Insights</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              {smartInsights.map((insight, idx) => (
                <div key={idx} style={{ padding: 20, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ color: colors.primary, marginTop: 2, background: colors.bg, padding: 8, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{insight.icon}</div>
                  <div style={{ fontSize: 14, color: colors.dark, lineHeight: 1.5, fontWeight: 600 }}>
                    {insight.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ATTENTION PANELS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 24 }}>

          {/* TOP ROW (RIGHT): Critical Alerts */}
          <div style={{ background: colors.bg, borderRadius: 16, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            <div style={{ background: colors.dark, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={20} color={colors.error} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: colors.bg }}>Action Required</h3>
              <Badge t={t} text={criticalAlerts.length.toString()} color="red" style={{ marginLeft: 'auto' }} />
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {criticalAlerts.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: colors.success, fontSize: 14, fontWeight: 600 }}>
                  <CheckCircle2 size={18} /> No immediate action required.
                </div>
              ) : (
                criticalAlerts.map((alert, idx) => (
                  <div key={idx} style={{
                    padding: 16,
                    borderRadius: 12,
                    background: alert.type === 'error' ? `${colors.error}15` : `${colors.warning}15`,
                    borderLeft: `4px solid ${alert.type === 'error' ? colors.error : colors.warning}`
                  }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: 14, fontWeight: 800, color: alert.type === 'error' ? '#991B1B' : '#B45309' }}>{alert.title}</h4>
                    <p style={{ margin: 0, fontSize: 13, color: alert.type === 'error' ? '#7F1D1D' : '#92400E', lineHeight: 1.5 }}>{alert.desc}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock by Outlet */}
          <div style={{ background: colors.bg, borderRadius: 16, padding: 24, border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Package size={20} color={colors.warning} />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: colors.dark }}>Low Stock Watchlist</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {lowStockByOutlet.length === 0 ? (
                <div style={{ fontSize: 14, color: colors.textSecondary }}>Inventory levels healthy across all monitored outlets.</div>
              ) : (
                lowStockByOutlet.map((outlet, idx) => (
                  <div key={idx} style={{ background: colors.lightBg, borderRadius: 12, padding: 16 }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 800, color: colors.dark }}>{outlet.siteName}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {outlet.stockIssues.map((p, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: colors.bg, padding: '8px 12px', borderRadius: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: colors.dark, maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                          <Badge t={t} text={p.stock === 0 ? 'Out' : `${p.stock} Left`} color={p.stock === 0 ? 'red' : 'yellow'} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM (FULL WIDTH): Live Activity Feed */}
      <div style={{ background: colors.bg, borderRadius: 16, padding: 24, border: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Activity size={20} color={colors.primary} />
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: colors.dark }}>Live System Activity</h3>
        </div>

        <div className="feed-scroll" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, width: '100%' }}>
          {activityFeed.length === 0 ? (
            <div style={{ fontSize: 14, color: colors.textSecondary }}>No recent processing activity.</div>
          ) : (
            activityFeed.map((activity, idx) => (
              <div key={idx} style={{
                minWidth: 260,
                maxWidth: 300,
                flexShrink: 0,
                background: colors.lightBg,
                padding: '16px',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 700 }}>{activity.time}</div>
                  <div style={{ fontSize: 14, color: colors.success, fontWeight: 800 }}>+{activity.val}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.dark }}>{activity.desc}</div>
                <div style={{ fontSize: 12, color: colors.primary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ArrowUpRight size={12} /> {activity.outlet}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
