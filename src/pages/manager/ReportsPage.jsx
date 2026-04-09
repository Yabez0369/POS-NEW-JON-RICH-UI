import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import { fmt } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import {
  Download, Calendar as CalendarIcon, TrendingUp, TrendingDown,
  RefreshCw, BarChart2, Box, Tag, Users, 
  DollarSign, ShoppingCart, Activity, Search, Filter, ArrowUpRight, ChevronRight, Layers, Sparkles
} from 'lucide-react'

const notify = (msg, type) => console.log(`[Notification] ${type}: ${msg}`)

export const ReportsPage = ({ orders = [], users = [], products = [], settings, t }) => {
  const { currentUser } = useAuth()
  const [activeReport, setActiveReport] = useState('sales-category')
  const [dateRange, setDateRange] = useState({
    from: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    to: dayjs().format('YYYY-MM-DD')
  })

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return (Array.isArray(orders) ? orders : []).filter(o => {
      const dateStr = o.date || o.created_at
      if (!dateStr) return true
      const d = dayjs(dateStr).isValid() ? dayjs(dateStr) : dayjs(dateStr, 'DD/MM/YYYY, HH:mm:ss')
      return d.isValid() && d.isAfter(dayjs(dateRange.from).subtract(1, 'day')) && d.isBefore(dayjs(dateRange.to).add(1, 'day'))
    })
  }, [orders, dateRange])

  // Stats for the Bento Grid
  const reportStats = useMemo(() => {
    const revenue = filteredOrders.reduce((s, o) => s + (o.total || 0), 0)
    const count = filteredOrders.length
    const aov = count > 0 ? revenue / count : 0
    const refunds = filteredOrders.filter(o => o.status === 'refunded').length
    
    return {
      revenue: { val: revenue, trend: '+12.4%', up: true, icon: <DollarSign size={24} />, color: '#6366F1' },
      orders: { val: count, trend: '+8.7%', up: true, icon: <ShoppingCart size={24} />, color: '#10B981' },
      aov: { val: aov, trend: '+3.2%', up: true, icon: <Activity size={24} />, color: '#8B5CF6' },
      returns: { val: refunds, trend: '-2.1%', up: false, icon: <RefreshCw size={24} />, color: '#F43F5E' }
    }
  }, [filteredOrders])

  // Category Mix
  const categoryMix = useMemo(() => {
    const catRev = {}
    filteredOrders.forEach(o => {
      const items = o.items || o.order_items || []
      items.forEach(i => {
        const name = i.product_name || i.name || 'Unknown'
        const p = (products || []).find(x => x.name === name)
        const cat = p?.category || 'Other'
        catRev[cat] = (catRev[cat] || 0) + (i.unit_price ?? i.price ?? 0) * (i.quantity ?? i.qty ?? 0)
      })
    })
    const total = Object.values(catRev).reduce((a, b) => a + b, 0) || 1
    return Object.entries(catRev).map(([name, val]) => ({
      name,
      val,
      pct: (val / total) * 100,
      color: name === 'Jerseys' ? '#6366F1' : name === 'Accessories' ? '#10B981' : name === 'Equipment' ? '#F59E0B' : name === 'Collectibles' ? '#8B5CF6' : '#94A3B8'
    })).sort((a, b) => b.val - a.val)
  }, [filteredOrders, products])

  const totalCatSum = categoryMix.reduce((a, b) => a + b.val, 0)

  // Top Products Data
  const topProductsRaw = useMemo(() => {
    const pSales = {}
    filteredOrders.forEach(o => {
      const items = o.items || o.order_items || []
      items.forEach(i => {
        const name = i.product_name || i.name || 'Unknown'
        if (!pSales[name]) pSales[name] = { qty: 0, val: 0 }
        pSales[name].qty += (i.quantity ?? i.qty ?? 0)
        pSales[name].val += (i.unit_price ?? i.price ?? 0) * (i.quantity ?? i.qty ?? 0)
      })
    })
    return Object.entries(pSales)
      .sort((a, b) => b[1].val - a[1].val)
      .slice(0, 5)
      .map(([name, s], i) => ({
        name,
        sold: s.qty,
        val: s.val,
        trend: ['+12.5%', '+8.2%', '-3.1%', '+15.7%', '-1.2%'][i] || '+0%',
        up: !['-', '0'].includes((['+12.5%', '+8.2%', '-3.1%', '+15.7%', '-1.2%'][i] || '').charAt(0))
      }))
  }, [filteredOrders])

  const reports = [
    { id: 'sales-category', label: 'Sales Overview', icon: <BarChart2 size={16} /> },
    { id: 'sales-product', label: 'By Product', icon: <Box size={16} /> },
    { id: 'sales-counter', label: 'By Counter', icon: <ShoppingCart size={16} /> },
    { id: 'sales-operator', label: 'By Operator', icon: <Users size={16} /> },
    { id: 'returns', label: 'Returns', icon: <RefreshCw size={16} /> },
    { id: 'stock', label: 'Inventory', icon: <Layers size={16} /> },
    { id: 'discounts', label: 'Discounts', icon: <Tag size={16} /> },
  ]

  return (
    <div className="reports-intelligence-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .reports-intelligence-root {
          --primary: #6366F1;
          --bg-main: #F4F7FE;
          --text-deep: #0F172A;
          --text-muted: #64748B;
          --card-bg: rgba(255, 255, 255, 0.9);
          --glass-border: rgba(226, 232, 240, 0.8);
          
          background: var(--bg-main);
          min-height: calc(100vh - 120px);
          margin: -24px;
          padding: 32px 40px;
          font-family: 'Outfit', sans-serif;
          color: var(--text-deep);
        }

        /* Header & Nav */
        .ri-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .ri-title-box h1 { font-size: 34px; font-weight: 900; margin: 0; background: linear-gradient(135deg, #1E293B, #475569); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .ri-breadcrumb { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px; display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }

        .btn-premium { padding: 12px 24px; border-radius: 16px; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 10px; cursor: pointer; border: 1px solid var(--glass-border); background: white; transition: 0.3s; }
        .btn-premium:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .btn-primary { background: var(--primary); color: white; border: none; }

        .nav-bar { display: flex; gap: 12px; margin-bottom: 32px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }
        .nav-bar::-webkit-scrollbar { display: none; }
        .nav-item { padding: 10px 20px; border-radius: 99px; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; background: white; color: var(--text-muted); cursor: pointer; border: 1px solid var(--glass-border); white-space: nowrap; transition: 0.3s; }
        .nav-item.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 8px 16px -4px rgba(99, 102, 241, 0.4); }

        /* Control Panel */
        .ri-controls { background: white; border-radius: 24px; padding: 20px 32px; border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
        .date-picker-group { display: flex; align-items: center; gap: 24px; }
        .date-col { display: flex; flex-direction: column; }
        .date-lbl { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px; letter-spacing: 1px; }
        .date-inp { font-size: 16px; font-weight: 700; color: var(--text-deep); border: none; background: transparent; outline: none; border-bottom: 2px solid #E2E8F0; padding-bottom: 2px; }

        /* Bento Stats */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 32px; }
        .stat-card { background: white; border-radius: 28px; padding: 28px; border: 1px solid var(--glass-border); transition: 0.4s; }
        .stat-card:hover { transform: translateY(-6px); box-shadow: 0 15px 30px -5px rgba(0,0,0,0.05); }
        .sc-top { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .sc-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; }
        .sc-trend { font-size: 12px; font-weight: 800; display: flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 99px; }
        .sc-val { font-size: 32px; font-weight: 900; letter-spacing: -0.04em; }
        .sc-lbl { font-size: 14px; color: var(--text-muted); font-weight: 500; }

        /* Main Content Grid */
        .content-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 24px; }
        .viz-card { background: white; border-radius: 32px; padding: 32px; border: 1px solid var(--glass-border); display: flex; flex-direction: column; }
        .span-8 { grid-column: span 8; }
        .span-4 { grid-column: span 4; }
        .viz-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .viz-title h2 { font-size: 22px; font-weight: 800; margin: 0; }
        .viz-title p { font-size: 14px; color: var(--text-muted); margin: 4px 0 0 0; }

        /* Donut & Legend */
        .donut-section { display: flex; align-items: center; gap: 60px; }
        .donut-box { position: relative; width: 220px; height: 220px; }
        .donut-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .dl-val { font-size: 24px; font-weight: 900; }
        .dl-txt { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }

        .legend-grid { flex: 1; display: flex; flex-direction: column; gap: 16px; }
        .legend-row { display: flex; align-items: center; gap: 16px; }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
        .legend-info { flex: 1; display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; margin-bottom: 6px; }
        .legend-bar-bg { height: 6px; background: #F1F5F9; border-radius: 10px; }
        .legend-bar-fill { height: 100%; border-radius: 10px; transition: 1s ease; }

        /* Trend Chart */
        .trend-chart { height: 250px; width: 100%; position: relative; margin-top: 20px; }
        
        /* Leaderboard */
        .lb-list { display: flex; flex-direction: column; gap: 12px; }
        .lb-item { display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 20px; background: #F8FAFC; border: 1px solid transparent; transition: 0.2s; }
        .lb-item:hover { background: white; border-color: var(--primary); transform: scale(1.02); }
        .lb-num { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; background: white; color: var(--primary); }
        .lb-info { flex: 1; }
        .lb-name { font-size: 14px; font-weight: 700; }
        .lb-sold { font-size: 12px; color: var(--text-muted); }
        .lb-stats { text-align: right; }
        .lb-trend { font-size: 11px; font-weight: 800; display: flex; justify-content: flex-end; align-items: center; gap: 2px; }

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .ani-up { animation: fadeInUp 0.5s ease forwards; }
      `}</style>

      {/* Header */}
      <div className="ri-header">
        <div className="ri-title-box">
          <div className="ri-breadcrumb"><Activity size={12} /> Management Hub <ChevronRight size={10} /> Intelligence</div>
          <h1>Command Intelligence</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-premium"><Search size={18} color="#64748B" /> Data Query</button>
          <button className="btn-premium btn-primary"><Download size={18} /> Generate Report</button>
        </div>
      </div>

      {/* Navigation */}
      <div className="nav-bar">
        {reports.map((r, i) => (
          <button key={r.id} className={`nav-item ${activeReport === r.id ? 'active' : ''}`} onClick={() => setActiveReport(r.id)}>
            {r.icon} {r.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="ri-controls ani-up">
        <div className="date-picker-group">
          <div className="date-col">
            <span className="date-lbl">Begin Range</span>
            <input type="date" className="date-inp" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} />
          </div>
          <div style={{ padding: '16px 0 0 0', color: '#CBD5E1' }}><ChevronRight size={14} /></div>
          <div className="date-col">
            <span className="date-lbl">End Range</span>
            <input type="date" className="date-inp" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)' }}>{filteredOrders.length}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Orders Sync</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#10B981' }}>{fmt(reportStats.revenue.val, settings?.sym)}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Capital</div>
          </div>
        </div>
        <button className="btn-premium" style={{ border: 'none', background: '#F1F5F9' }}><Filter size={16} color="#64748B" /> Advanced</button>
      </div>

      {/* Bento Grid */}
      <div className="stats-grid">
        {Object.entries(reportStats).map(([k, d], i) => (
          <div key={k} className="stat-card ani-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="sc-top">
              <div className="sc-icon" style={{ background: d.color }}>{d.icon}</div>
              <div className="sc-trend" style={{ background: d.up ? '#ECFDF5' : '#FFF1F2', color: d.up ? '#10B981' : '#F43F5E' }}>
                {d.up ? <ArrowUpRight size={14} /> : <TrendingDown size={14} />} {d.trend}
              </div>
            </div>
            <div>
              <div className="sc-val">{k === 'orders' || k === 'returns' ? d.val : fmt(d.val, settings?.sym)}</div>
              <div className="sc-lbl">{k === 'revenue' ? 'Sales Capital' : k === 'orders' ? 'Transactions' : k === 'aov' ? 'Avg Yield' : 'Processed Returns'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Intelligence Dashboard */}
      {activeReport === 'sales-category' && (
        <div className="content-grid">
          {/* Revenue by Category (Donut) */}
          <div className="viz-card span-8 ani-up" style={{ animationDelay: '0.4s' }}>
            <div className="viz-top">
              <div className="viz-title">
                <h2>Revenue by Category</h2>
                <p>Distribution of sales across product segments</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 8, height: 8, background: '#10B981', borderRadius: '50%' }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#10B981' }}>Live Feed</span>
              </div>
            </div>
            <div className="donut-section">
              <div className="donut-box">
                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  {(() => {
                    let off = 0;
                    return categoryMix.map((c, i) => {
                      const sd = `${c.pct} ${100 - c.pct}`;
                      const el = <circle key={i} cx="50" cy="50" r="42" fill="none" stroke={c.color} strokeWidth="12" strokeDasharray={sd} strokeDashoffset={100 - off} strokeLinecap="round" />
                      off += c.pct;
                      return el;
                    })
                  })()}
                </svg>
                <div className="donut-label">
                  <span className="dl-val">{fmt(totalCatSum, settings?.sym).split('.')[0]}</span>
                  <span className="dl-txt">Total</span>
                </div>
              </div>
              <div className="legend-grid">
                {categoryMix.map((c, i) => (
                  <div key={i} className="legend-row">
                    <div className="legend-dot" style={{ background: c.color }} />
                    <div style={{ flex: 1 }}>
                      <div className="legend-info">
                        <span>{c.name}</span>
                        <span>{fmt(c.val, settings?.sym)}</span>
                      </div>
                      <div className="legend-bar-bg">
                        <div className="legend-bar-fill" style={{ width: `${c.pct}%`, background: c.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Breakdown Rankings */}
          <div className="viz-card span-4 ani-up" style={{ animationDelay: '0.5s' }}>
            <div className="viz-top">
              <div className="viz-title">
                <h2>Category Breakdown</h2>
                <p>Performance hierarchy</p>
              </div>
            </div>
            <div className="lb-list">
              {categoryMix.map((c, i) => (
                <div key={i} className="lb-item">
                  <div className="lb-num" style={{ background: c.color + '15', color: c.color }}>{i + 1}</div>
                  <div className="lb-info">
                    <div className="lb-name">{c.name}</div>
                    <div className="lb-sold" style={{ color: c.color }}>{c.pct.toFixed(1)}% Share</div>
                  </div>
                  <div className="lb-stats">
                    <div style={{ fontWeight: 800 }}>{fmt(c.val, settings?.sym)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Trend (Area Chart) */}
          <div className="viz-card span-8 ani-up" style={{ animationDelay: '0.6s' }}>
            <div className="viz-top">
              <div className="viz-title">
                <h2>Revenue Trend</h2>
                <p>Monthly revenue and order volume analytics</p>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} /> Revenue</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} /> Orders</div>
              </div>
            </div>
            <div className="trend-chart">
              <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 200">
                <defs>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 50, 100, 150].map(y => <line key={y} x1="50" y1={y} x2="950" y2={y} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />)}
                <text x="40" y="15" fontSize="10" fill="#94A3B8" textAnchor="end">10K</text>
                <text x="50" y="215" fontSize="10" fill="#94A3B8">Oct</text>
                <text x="230" y="215" fontSize="10" fill="#94A3B8">Nov</text>
                <text x="410" y="215" fontSize="10" fill="#94A3B8">Dec</text>
                <text x="590" y="215" fontSize="10" fill="#94A3B8">Jan</text>
                <text x="770" y="215" fontSize="10" fill="#94A3B8">Feb</text>
                <text x="950" y="215" fontSize="10" fill="#94A3B8">Mar</text>
                <path d="M 50 120 C 200 80, 250 140, 400 70 C 550 40, 600 110, 700 80 C 800 60, 850 160, 950 100 L 950 200 L 50 200 Z" fill="url(#gC)" />
                <path d="M 50 120 C 200 80, 250 140, 400 70 C 550 40, 600 110, 700 80 C 800 60, 850 160, 950 100" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Top Products */}
          <div className="viz-card span-4 ani-up" style={{ animationDelay: '0.7s' }}>
            <div className="viz-top">
              <div className="viz-title">
                <h2>Top Products</h2>
                <p>Leading SKU performance</p>
              </div>
              <Tag size={18} color="#CBD5E1" />
            </div>
            <div className="lb-list">
              {topProductsRaw.map((p, i) => (
                <div key={i} className="lb-item">
                  <div className="lb-info">
                    <div className="lb-name">{p.name}</div>
                    <div className="lb-sold">{p.sold} Synced Sales</div>
                  </div>
                  <div className="lb-stats">
                    <div className="lb-trend" style={{ color: p.up ? '#10B981' : '#F43F5E' }}>
                      {p.up ? <ArrowUpRight size={10} /> : <TrendingDown size={10} />} {p.trend}
                    </div>
                    <div style={{ fontWeight: 800 }}>{fmt(p.val, settings?.sym)}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-premium" style={{ border: 'none', background: '#F8FAFC', width: '100%', marginTop: 'auto', justifyContent: 'center', color: 'var(--primary)' }}>
              Full Inventory Analysis
            </button>
          </div>
        </div>
      )}

      {/* Basic Fallback for other modules */}
      {activeReport !== 'sales-category' && (
        <div className="viz-card ani-up" style={{ padding: 80, textAlign: 'center', background: 'rgba(255,255,255,0.5)' }}>
          <Sparkles size={48} color="#CBD5E1" style={{ marginBottom: 20 }} />
          <h2 style={{ color: '#64748B' }}>Extended Module Active</h2>
          <p style={{ color: '#94A3B8' }}>Granular data for {activeReport} is being synchronized.</p>
          <button className="btn-premium btn-primary" onClick={() => setActiveReport('sales-category')} style={{ margin: '20px auto 0' }}>Return to Overview</button>
        </div>
      )}
    </div>
  )
}
