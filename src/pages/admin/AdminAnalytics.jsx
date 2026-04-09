import { useState, useMemo } from 'react'
import { fmt } from '@/lib/utils'
import {
  Download, Calendar as CalendarIcon, TrendingUp, TrendingDown,
  RefreshCw, BarChart2, Box, Tag, Users, 
  DollarSign, ShoppingCart, Activity, Search, Filter, ArrowUpRight, ChevronRight, Layers, Sparkles
} from 'lucide-react'

export const AdminAnalytics = ({ orders = [], products = [], settings, t }) => {
  const [activeTab, setActiveTab] = useState('Sales by Category')
  const [dateRange, setDateRange] = useState({ from: '2026-03-10', to: '2026-04-09' })

  // Data Synthesis (Matching the user's provided screen but enhancing)
  const stats = useMemo(() => {
    const totalRev = 38524.50
    const totalOrders = 216
    const avgOrder = totalRev / totalOrders
    const returns = 12
    const returnsValue = 840.00
    
    return {
      revenue: { val: totalRev, trend: '+12.4%', up: true, icon: <DollarSign size={24} />, color: '#6366F1' },
      orders: { val: totalOrders, trend: '+8.7%', up: true, icon: <ShoppingCart size={24} />, color: '#10B981' },
      aov: { val: avgOrder, trend: '+3.2%', up: true, icon: <Activity size={24} />, color: '#8B5CF6' },
      returns: { val: returns, trend: '-2.1%', up: false, icon: <RefreshCw size={24} />, color: '#F43F5E' }
    }
  }, [orders])

  const catData = useMemo(() => {
    return [
      { name: 'Jerseys', val: 1399.84, color: '#6366F1', pct: 15 },
      { name: 'Accessories', val: 1150.93, color: '#10B981', pct: 12 },
      { name: 'Equipment', val: 890.91, color: '#F59E0B', pct: 9 },
      { name: 'Collectibles', val: 470.98, color: '#8B5CF6', pct: 5 },
      { name: 'Other', val: 34611.84, color: '#94A3B8', pct: 59 }
    ].sort((a, b) => b.val - a.val)
  }, [])

  const totalCatRev = catData.reduce((acc, c) => acc + c.val, 0)

  const tabs = [
    { name: 'Sales by Category', icon: <BarChart2 size={16} /> },
    { name: 'Sales by Product', icon: <Box size={16} /> },
    { name: 'Sales by Counter', icon: <ShoppingCart size={16} /> },
    { name: 'Sales by Operator', icon: <Users size={16} /> },
    { name: 'Returns Summary', icon: <RefreshCw size={16} /> },
    { name: 'Stock Report', icon: <Layers size={16} /> },
    { name: '% Discount/Coupon', icon: <Tag size={16} /> },
  ]

  return (
    <div className="analytics-premium-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .analytics-premium-root {
          --primary: #6366F1;
          --bg-main: #F4F7FE;
          --text-deep: #0F172A;
          --text-muted: #64748B;
          --card-bg: rgba(255, 255, 255, 0.8);
          --glass-border: rgba(226, 232, 240, 0.8);
          
          background: var(--bg-main);
          min-height: calc(100vh - 64px);
          margin: -24px;
          padding: 32px 40px;
          font-family: 'Outfit', sans-serif;
          color: var(--text-deep);
        }

        /* Header Layout */
        .ap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .ap-title-box h1 {
          font-size: 36px;
          font-weight: 900;
          letter-spacing: -0.04em;
          margin: 0;
          background: linear-gradient(135deg, #0F172A 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .ap-breadcrumb {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ap-actions {
          display: flex;
          gap: 12px;
        }
        .btn-premium {
          padding: 12px 24px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
        }
        .btn-primary {
          background: var(--primary);
          color: white;
          box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.5);
        }

        /* Control Bar (Glassmorphic) */
        .control-bar {
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          gap: 40px;
          margin-bottom: 32px;
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
        }
        .date-picker-wrap {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .dp-icon {
          width: 48px;
          height: 48px;
          background: #EEF2FF;
          color: var(--primary);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .date-field {
          display: flex;
          flex-direction: column;
        }
        .date-label { font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
        .date-val { font-size: 15px; font-weight: 700; color: var(--text-deep); border: none; background: transparent; cursor: pointer; }
        
        .divider { width: 1px; height: 40px; background: var(--glass-border); }
        
        .summary-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .si-item { display: flex; align-items: baseline; gap: 8px; }
        .si-val { font-size: 22px; font-weight: 800; color: var(--primary); }
        .si-label { font-size: 14px; color: var(--text-muted); font-weight: 500; }

        /* Bento Grid Metrics */
        .metrics-bento {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }
        .metric-card {
          background: white;
          border-radius: 28px;
          padding: 28px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
        }
        .metric-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08);
        }
        .mc-head {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .mc-icon-box {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .mc-trend-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 800;
        }
        .mc-body h3 { font-size: 32px; font-weight: 900; margin: 0 0 4px 0; letter-spacing: -0.05em; }
        .mc-body p { font-size: 14px; color: var(--text-muted); font-weight: 500; margin: 0; }
        
        /* Sparkline simulation */
        .sparkline {
          position: absolute;
          bottom: 0; right: 0; left: 0;
          height: 40px;
          opacity: 0.15;
          pointer-events: none;
        }

        /* Tabs System */
        .tabs-nav {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          padding: 6px;
          background: rgba(226, 232, 240, 0.4);
          border-radius: 20px;
          width: fit-content;
        }
        .tn-btn {
          padding: 10px 20px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-muted);
          border: none;
          background: transparent;
        }
        .tn-btn.active {
          background: white;
          color: var(--primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        /* Content Sections */
        .main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        .glass-card {
          background: white;
          border-radius: 32px;
          padding: 32px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 10px 40px -15px rgba(0, 0, 0, 0.03);
        }
        .gc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }
        .gc-title h2 { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; }
        .gc-title p { font-size: 14px; color: var(--text-muted); margin: 0; }

        /* Donut & Legend */
        .analytics-viz {
          display: flex;
          align-items: center;
          gap: 60px;
        }
        .donut-container {
          position: relative;
          width: 260px;
          height: 260px;
        }
        .donut-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .donut-main-val { font-size: 28px; font-weight: 900; letter-spacing: -0.05em; }
        .donut-sub-val { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }

        .legend-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .legend-item:hover { transform: translateX(8px); }
        .legend-color { width: 12px; height: 12px; border-radius: 4px; }
        .legend-info { flex: 1; display: flex; justify-content: space-between; align-items: center; }
        .legend-name { font-size: 15px; font-weight: 600; }
        .legend-val { font-size: 15px; font-weight: 800; }
        .legend-bar-wrap { width: 100%; height: 6px; background: #EEF2FF; border-radius: 10px; margin-top: 6px; overflow: hidden; }
        .legend-bar-fill { height: 100%; border-radius: 10px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }

        /* Top Products List */
        .top-products-list { display: flex; flex-direction: column; gap: 16px; }
        .product-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 20px;
          background: #F8FAFC;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .product-item:hover { border-color: var(--primary); background: white; transform: scale(1.02); }
        .pi-img { width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary); }
        .pi-info { flex: 1; }
        .pi-name { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
        .pi-desc { font-size: 12px; color: var(--text-muted); }
        .pi-val-box { text-align: right; }
        .pi-val { font-size: 15px; font-weight: 800; color: var(--text-deep); }
        .pi-trend { font-size: 11px; font-weight: 700; color: #10B981; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease forwards; }
      `}</style>

      {/* Header */}
      <div className="ap-header">
        <div className="ap-title-box">
          <div className="ap-breadcrumb">
            <Activity size={14} /> Analytics Hub <ChevronRight size={12} /> Live Reports
          </div>
          <h1>Command Intelligence</h1>
        </div>
        <div className="ap-actions">
          <button className="btn-premium" style={{ background: 'white', border: '1px solid var(--glass-border)' }}>
            <Search size={18} color="#64748B" /> Search Data
          </button>
          <button className="btn-premium btn-primary">
            <Download size={18} /> Export Analytics
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="control-bar animate-fade-in">
        <div className="date-picker-wrap">
          <div className="dp-icon"><CalendarIcon size={24} /></div>
          <div className="date-field">
            <span className="date-label">Reporting Range</span>
            <input type="date" className="date-val" defaultValue={dateRange.from} />
          </div>
          <div style={{ padding: '0 8px', color: '#CBD5E1', fontWeight: 900 }}>—</div>
          <div className="date-field">
            <span className="date-label">End Date</span>
            <input type="date" className="date-val" defaultValue={dateRange.to} />
          </div>
        </div>
        <div className="divider" />
        <div className="summary-info">
          <div className="si-item">
            <span className="si-val">216</span>
            <span className="si-label">Total Volume</span>
          </div>
          <div className="si-item">
            <span className="si-val" style={{ color: '#10B981' }}>{fmt(38524.50, settings?.sym)}</span>
            <span className="si-label">Net Sales</span>
          </div>
          <div className="si-item">
            <span className="si-val" style={{ color: '#F59E0B' }}>12</span>
            <span className="si-label">Flagged Issues</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn-premium" style={{ background: '#F1F5F9', color: '#475569', padding: '8px 16px', borderRadius: '12px' }}>
            <Filter size={14} /> Advanced
          </button>
        </div>
      </div>

      {/* Metrics Bento */}
      <div className="metrics-bento">
        {Object.entries(stats).map(([key, data], i) => (
          <div key={key} className="metric-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="mc-head">
              <div className="mc-icon-box" style={{ background: data.color }}>{data.icon}</div>
              <div className="mc-trend-badge" style={{ background: data.up ? '#ECFDF5' : '#FFF1F2', color: data.up ? '#10B981' : '#F43F5E' }}>
                {data.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {data.trend}
              </div>
            </div>
            <div className="mc-body">
              <h3>{typeof data.val === 'number' ? (key === 'orders' || key === 'returns' ? data.val : fmt(data.val, settings?.sym)) : data.val}</h3>
              <p>{key === 'revenue' ? 'Total Sales Volume' : key === 'orders' ? 'Transactions Processed' : key === 'aov' ? 'Average Basket Size' : 'Items Returned'}</p>
            </div>
            <svg className="sparkline" viewBox="0 0 100 20">
              <path d="M 0 15 Q 25 5, 50 12 T 100 8" fill="none" stroke={data.color} strokeWidth="2" />
            </svg>
          </div>
        ))}
      </div>

      {/* Tabs Nav */}
      <div className="tabs-nav animate-fade-in" style={{ animationDelay: '0.4s' }}>
        {tabs.map((tab, i) => (
          <button 
            key={tab.name} 
            className={`tn-btn ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {/* Interactive Content */}
      {activeTab === 'Sales by Category' && (
        <div className="main-grid">
          <div className="glass-card animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="gc-header">
              <div className="gc-title">
                <h2>Revenue Intelligence</h2>
                <p>Categorical performance and capital distribution</p>
              </div>
              <div className="ap-actions">
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#6366F1' }}>LIVE SYNC</div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>Update: 2s ago</div>
                </div>
              </div>
            </div>

            <div className="analytics-viz">
              <div className="donut-container">
                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  {(() => {
                    let offset = 0;
                    return catData.map((c, i) => {
                      const strokeDasharray = `${c.pct} ${100 - c.pct}`;
                      const el = <circle key={i} cx="50" cy="50" r="42" fill="none" stroke={c.color} strokeWidth="12" strokeDasharray={strokeDasharray} strokeDashoffset={100 - offset} strokeLinecap="round" />
                      offset += c.pct;
                      return el;
                    })
                  })()}
                </svg>
                <div className="donut-content">
                  <div className="donut-sub-val">Net Capital</div>
                  <div className="donut-main-val">{fmt(totalCatRev, settings?.sym).split('.')[0]}</div>
                  <div style={{ color: '#10B981', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Sparkles size={10} /> +5.4%
                  </div>
                </div>
              </div>

              <div className="legend-list">
                {catData.map((c, i) => (
                  <div key={i} className="legend-item">
                    <div className="legend-color" style={{ background: c.color }} />
                    <div style={{ flex: 1 }}>
                      <div className="legend-info">
                        <span className="legend-name">{c.name}</span>
                        <span className="legend-val">{fmt(c.val, settings?.sym)}</span>
                      </div>
                      <div className="legend-bar-wrap">
                        <div className="legend-bar-fill" style={{ width: `${(c.val / catData[0].val) * 100}%`, background: c.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="gc-header">
              <div className="gc-title">
                <h2>Top Entities</h2>
                <p>Leading SKU performance</p>
              </div>
              <ArrowUpRight size={20} color="#CBD5E1" />
            </div>

            <div className="top-products-list">
              {[
                { name: 'Elite Jersey v4', sold: 124, val: 8680.00, trend: '+15%', icon: <Layers size={18} /> },
                { name: 'Core Accessories Kit', sold: 98, val: 2450.00, trend: '+12%', icon: <Box size={18} /> },
                { name: 'Pro Equipment Set', sold: 45, val: 5400.00, trend: '-2%', icon: <Layers size={18} /> },
                { name: 'Limited Collectible', sold: 32, val: 1600.00, trend: '+22%', icon: <Sparkles size={18} /> },
                { name: 'Basic Training Kit', sold: 88, val: 3520.00, trend: '+8%', icon: <Layers size={18} /> },
              ].map((p, i) => (
                <div key={i} className="product-item">
                  <div className="pi-img">{p.icon}</div>
                  <div className="pi-info">
                    <div className="pi-name">{p.name}</div>
                    <div className="pi-desc">{p.sold} Units Synced</div>
                  </div>
                  <div className="pi-val-box">
                    <div className="pi-val">{fmt(p.val, settings?.sym)}</div>
                    <div className="pi-trend" style={{ color: p.trend.startsWith('+') ? '#10B981' : '#F43F5E' }}>{p.trend}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="btn-premium" style={{ width: '100%', marginTop: '24px', background: '#F8FAFC', color: 'var(--primary)', justifyContent: 'center' }}>
              View Detailed Inventory
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
