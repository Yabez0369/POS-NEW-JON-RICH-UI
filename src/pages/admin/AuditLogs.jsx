import { useState } from 'react'
import { Badge, Card, Table, Btn } from '@/components/ui'
import { 
  Shield, Download, Activity, AlertCircle, Clock, CheckCircle, 
  Search, Filter, ChevronRight, User, Terminal, HardDrive, 
  Database, RefreshCcw, Bell
} from 'lucide-react'

export const AuditLogs = ({ auditLogs, t }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterModule, setFilterModule] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')

  const safeLogs = (auditLogs || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  const modules = ['all', ...new Set(safeLogs.map(l => l.module).filter(Boolean))]

  const getSeverity = (log) => {
    if (log.severity) return log.severity;
    const act = (log.action || '').toLowerCase();
    if (act.includes('delete') || act.includes('remove') || act.includes('failed')) return 'HIGH'
    if (act.includes('edit') || act.includes('update')) return 'MED'
    return 'LOW'
  }

  const getModuleIcon = (module) => {
    const m = (module || '').toLowerCase()
    if (m.includes('user') || m.includes('auth')) return <User size={18} />
    if (m.includes('inventory') || m.includes('product')) return <HardDrive size={18} />
    if (m.includes('sale')) return <Activity size={18} />
    if (m.includes('setting')) return <Database size={18} />
    return <Terminal size={18} />
  }

  const filtered = safeLogs.filter(l => {
    const matchSearch = Object.values(l).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    const matchMod = filterModule === 'all' || l.module === filterModule
    const matchSev = filterSeverity === 'all' || getSeverity(l) === filterSeverity
    return matchSearch && matchMod && matchSev
  })

  const stats = {
    total: safeLogs.length,
    high: safeLogs.filter(l => getSeverity(l) === 'HIGH').length,
    med: safeLogs.filter(l => getSeverity(l) === 'MED').length,
    low: safeLogs.filter(l => getSeverity(l) === 'LOW').length,
  }

  const handleExport = () => {
    console.log('Exporting logs...')
  }

  return (
    <div className="audit-hub-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .audit-hub-root {
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
          align-items: flex-end;
          margin-bottom: 40px;
        }
        .header-title-box h1 {
          font-size: 36px;
          font-weight: 900;
          letter-spacing: -0.04em;
          margin: 0;
          color: var(--text-deep);
        }
        .header-breadcrumb {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        .live-indicator {
            display: flex; align-items: center; gap: 8px;
            font-size: 11px; font-weight: 900; color: #10B981;
            padding: 4px 12px; background: #ECFDF5; border-radius: 99px;
            margin-bottom: 8px; width: fit-content;
        }
        .live-dot { width: 6px; height: 6px; background: #10B981; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0.4; } }

        /* KPI Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }
        .stat-card {
          background: white;
          border-radius: 32px;
          padding: 24px 32px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
          display: flex; align-items: center; gap: 20px;
        }
        .sc-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: #F1F5F9; color: var(--text-muted); }
        .sc-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; opacity: 0.6; }
        .sc-value { font-size: 28px; font-weight: 900; letter-spacing: -0.02em; }

        /* Command Filter Hub */
        .command-filters {
          background: white; border-radius: 28px; padding: 24px; margin-bottom: 32px;
          border: 1px solid var(--glass-border); box-shadow: 0 10px 30px -15px rgba(0,0,0,0.05);
          display: flex; gap: 20px; align-items: center;
        }
        .search-wrap { position: relative; flex: 1; }
        .search-wrap input {
          width: 100%; height: 52px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px;
          padding: 0 16px 0 48px; font-size: 14px; font-weight: 600; outline: none; transition: 0.2s;
        }
        .search-wrap input:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }

        .chip-hub { display: flex; gap: 8px; background: #F1F5F9; padding: 6px; border-radius: 16px; }
        .chip-btn { padding: 8px 16px; border-radius: 12px; border: none; background: transparent; color: var(--text-muted); font-size: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .chip-btn.active { background: white; color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }

        /* Feed Container */
        .feed-container {
          background: white; border-radius: 32px; border: 1px solid var(--glass-border);
          box-shadow: 0 10px 40px -15px rgba(0,0,0,0.05); overflow: hidden;
        }
        .feed-header {
            padding: 24px 32px; border-bottom: 1px solid var(--glass-border);
            display: flex; justify-content: space-between; align-items: center; background: #fcfdfe;
        }
        .feed-row {
          display: flex; align-items: center; gap: 24px; padding: 20px 32px;
          border-bottom: 1px solid #F1F5F9; transition: all 0.2s;
        }
        .feed-row:hover { background: #F8FAFC; transform: scale(1.002); }
        .feed-row.high-risk { background: rgba(239, 68, 68, 0.03); }

        .module-node {
            width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
            background: #F1F5F9; color: var(--primary);
            display: flex; align-items: center; justify-content: center;
        }
        
        .row-main { flex: 1; min-width: 0; }
        .row-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }
        .user-name { font-weight: 950; font-size: 15px; color: var(--text-deep); }
        .action-tag { padding: 2px 10px; background: #EEF2FF; color: var(--primary); border-radius: 6px; font-size: 11px; font-weight: 900; text-transform: uppercase; }
        .module-label { font-size: 12px; font-weight: 800; color: var(--text-muted); opacity: 0.7; }
        .row-details { font-size: 13px; color: var(--text-muted); font-weight: 600; line-height: 1.4; }

        .row-time { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 800; color: var(--text-muted); text-align: right; whiteSpace: nowrap; }

        @keyframes slideInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-hub { animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* Header */}
      <div className="hub-header animate-hub">
        <div className="header-title-box">
          <div className="live-indicator"><div className="live-dot" /> STREAMING PROTOCOL ACTIVE</div>
          <div className="header-breadcrumb">Security Orchestration</div>
          <h1>Operational Command</h1>
        </div>
        <div className="action-btns">
            <button className="premium-btn outline" onClick={handleExport}><Download size={18} /> Export Schema</button>
            <button className="premium-btn primary"><Bell size={18} strokeWidth={2.5} /> Notify Security</button>
        </div>
      </div>

      {/* Stat KPI Grid */}
      <div className="stats-grid">
        <div className="stat-card animate-hub" style={{ animationDelay: '0.1s' }}>
          <div className="sc-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}><Activity size={20} /></div>
          <div><div className="sc-label">Total Events</div><div className="sc-value">{stats.total}</div></div>
        </div>
        <div className="stat-card animate-hub" style={{ animationDelay: '0.2s' }}>
          <div className="sc-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}><AlertCircle size={20} /></div>
          <div><div className="sc-label">Critical Risks</div><div className="sc-value">{stats.high}</div></div>
        </div>
        <div className="stat-card animate-hub" style={{ animationDelay: '0.3s' }}>
          <div className="sc-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}><Clock size={20} /></div>
          <div><div className="sc-label">Medium Vectors</div><div className="sc-value">{stats.med}</div></div>
        </div>
        <div className="stat-card animate-hub" style={{ animationDelay: '0.4s' }}>
          <div className="sc-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}><CheckCircle size={20} /></div>
          <div><div className="sc-label">Routine Checks</div><div className="sc-value">{stats.low}</div></div>
        </div>
      </div>

      {/* Commands Hub */}
      <div className="command-filters animate-hub" style={{ animationDelay: '0.5s' }}>
        <div className="search-wrap">
          <Search size={18} className="search-icon" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search Protocol Logs, Users or Systems..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="chip-hub">
           {modules.slice(0, 5).map(m => (
             <button key={m} className={`chip-btn ${filterModule === m ? 'active' : ''}`} onClick={() => setFilterModule(m)}>
               {m.toUpperCase()}
             </button>
           ))}
        </div>

        <div className="chip-hub">
           {['all', 'HIGH', 'MED', 'LOW'].map(s => (
             <button key={s} className={`chip-btn ${filterSeverity === s ? 'active' : ''}`} onClick={() => setFilterSeverity(s)}>
               {s}
             </button>
           ))}
        </div>
      </div>

      {/* Feed Area */}
      <div className="feed-container animate-hub" style={{ animationDelay: '0.6s' }}>
         <div className="feed-header">
            <span style={{ fontSize: 18, fontWeight: 950, color: 'var(--text-deep)', letterSpacing: '-0.03em' }}>System Event Ledger</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 800 }}>{filtered.length} Sequential Events</span>
                <button className="icon-btn" style={{ padding: '6px 12px', background: '#F1F5F9', border: 'none', borderRadius: 8, cursor: 'pointer' }}><RefreshCcw size={14} /></button>
            </div>
         </div>

         {filtered.length === 0 ? (
           <div style={{ padding: 120, textAlign: 'center' }}>
             <Shield size={64} style={{ opacity: 0.1, marginBottom: 24 }} />
             <h2 style={{ fontSize: 24, fontWeight: 900 }}>Feed Depleted</h2>
             <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No telemetry data matches your current filter parameters.</p>
           </div>
         ) : (
           <div className="feed-main">
              {filtered.map((l, idx) => {
                const sev = getSeverity(l)
                return (
                  <div key={idx} className={`feed-row ${sev === 'HIGH' ? 'high-risk' : ''} animate-hub`} style={{ animationDelay: `${0.7 + idx * 0.05}s` }}>
                    <div className="module-node">{getModuleIcon(l.module)}</div>
                    <div className="row-main">
                       <div className="row-meta">
                          <span className="user-name">{l.user || 'SYSTEM PROCESS'}</span>
                          <span className="action-tag">{l.action}</span>
                          <span className="module-label">v.{l.module || 'Root'}</span>
                          <div style={{ 
                            marginLeft: 'auto', padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 950,
                            background: sev === 'HIGH' ? '#FEE2E2' : sev === 'MED' ? '#FEF3C7' : '#DCFCE7',
                            color: sev === 'HIGH' ? '#EF4444' : sev === 'MED' ? '#D97706' : '#10B981'
                          }}>{sev} PRIORITY</div>
                       </div>
                       <div className="row-details">{l.details || 'Operational procedure executed successfully with no additional telemetry.'}</div>
                    </div>
                    <div className="row-time">{l.timestamp || '--:--'}</div>
                  </div>
                )
              })}
           </div>
         )}
      </div>
    </div>
  )
}
