import { useState } from 'react'
import { Badge, Card, Table } from '@/components/ui'

export const AuditLogs = ({ auditLogs, t }) => {
  const [f, setF] = useState('all')
  const mods = ['all', ...new Set(auditLogs.map(l => l.module))]
  const fil = f === 'all' ? auditLogs : auditLogs.filter(l => l.module === f)
  const roleColors = { admin: 'red', manager: 'yellow', cashier: 'green', customer: 'blue', system: 'purple' }

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

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 12, letterSpacing: '-0.03em' }}>
            <Shield size={32} color="#4f46e5" strokeWidth={2.5} /> Audit Log
          </h1>
          <p style={{ fontSize: 16, color: '#64748b', marginTop: 4, fontWeight: 600 }}>
             Full system activity history — every action tracked and timestamped.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Btn t={t} variant="outline" style={{ 
            borderRadius: 14, 
            padding: '12px 24px', 
            fontSize: 14,
            fontWeight: 800,
            color: '#64748b',
            display: 'flex', 
            alignItems: 'center', 
            gap: 10,
            background: '#fff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }} onClick={handleExport}>
            <Download size={18} /> Export History
          </Btn>
        </div>
      </div>

      {/* Severity KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        {[
          { label: 'Total Events', value: stats.total, color: '#4f46e5', icon: <Activity size={24} /> },
          { label: 'High Risk', value: stats.high, color: '#ef4444', icon: <AlertCircle size={24} /> },
          { label: 'Medium', value: stats.med, color: '#f59e0b', icon: <Clock size={24} /> },
          { label: 'Low / Info', value: stats.low, color: '#22c55e', icon: <CheckCircle size={24} /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 20, border: '1px solid #f1f5f9' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginTop: 4, letterSpacing: '-0.02em' }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search user, action, module..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '14px 16px 14px 52px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 600, outline: 'none', transition: 'all 0.2s' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', background: '#f1f5f9', padding: 6, borderRadius: 16 }}>
          {modules.slice(0, 6).map(m => (
            <button key={m} onClick={() => setFilterModule(m)} style={{
              padding: '8px 16px', borderRadius: 12, border: 'none',
              background: filterModule === m ? '#fff' : 'transparent',
              color: filterModule === m ? '#4f46e5' : '#64748b',
              boxShadow: filterModule === m ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
              fontSize: 12, fontWeight: 800, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s'
            }}>
              {m}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, background: '#f1f5f9', padding: 6, borderRadius: 16 }}>
          {['all', 'HIGH', 'MED', 'LOW'].map(s => {
            const col = s === 'HIGH' ? '#ef4444' : s === 'MED' ? '#f59e0b' : s === 'LOW' ? '#22c55e' : '#64748b'
            return (
              <button key={s} onClick={() => setFilterSeverity(s)} style={{
                padding: '8px 16px', borderRadius: 12, border: 'none',
                background: filterSeverity === s ? '#fff' : 'transparent',
                color: filterSeverity === s ? col : '#64748b',
                boxShadow: filterSeverity === s ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
              }}>
                {s === 'all' ? 'All Levels' : s}
              </button>
            )
          })}
        </div>
      </div>

      {/* Log Timeline */}
      <div style={{ background: '#fff', borderRadius: 32, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Activity Analytics Timeline</span>
          <span style={{ fontSize: 14, color: '#64748b', fontWeight: 700 }}>{filtered.length} of {auditLogs.length} events logged</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 100, textAlign: 'center', color: '#94a3b8' }}>
            <Shield size={64} strokeWidth={1} style={{ marginBottom: 20, opacity: 0.4 }} />
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>No audit events found.</div>
            <div style={{ fontSize: 15, marginTop: 8, fontWeight: 600 }}>
              {auditLogs.length === 0 ? 'Events will appear here as users take actions in the system.' : 'Try adjusting your search or filters.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((l, idx) => {
              const sev = getSeverity(l)
              return (
                <div key={l.id || idx} style={{
                  display: 'flex', alignItems: 'center', gap: 24,
                  padding: '24px 32px',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                  background: sev === 'HIGH' ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                  transition: 'all 0.2s',
                  animation: `slideInUp 0.4s ease-out ${idx * 0.05}s both`
                }} className="audit-row">
                  {/* Status Index */}
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: sev === 'HIGH' ? '#ef4444' : sev === 'MED' ? '#f59e0b' : '#22c55e', 
                    flexShrink: 0,
                    boxShadow: `0 0 10px ${sev === 'HIGH' ? 'rgba(239, 68, 68, 0.3)' : 'transparent'}`
                  }} />

                  {/* Module Icon Container */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5'
                  }}>
                    {getModuleIcon(l.module)}
                  </div>

                  {/* Narrative Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em' }}>{l.user || 'System Process'}</span>
                      <div style={{ 
                        padding: '4px 10px', 
                        borderRadius: 8, 
                        background: '#eef2ff', 
                        color: '#4f46e5', 
                        fontSize: 10, 
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}>
                        {l.action}
                      </div>
                      <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>in</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#475569', textTransform: 'capitalize' }}>{l.module || 'Infrastructure'}</span>
                    </div>
                    {l.details && (
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, fontWeight: 600, lineHeight: 1.4 }}>
                        {l.details}
                      </div>
                    )}
                  </div>

                  {/* Security Clearance */}
                  <div style={{ 
                    padding: '6px 12px', 
                    borderRadius: 10, 
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: 11,
                    fontWeight: 900,
                    color: '#64748b'
                  }}>
                    {(l.role || 'system').toUpperCase()}
                  </div>

                  {/* Priority Indicator */}
                  <div style={{ 
                    fontSize: 11, 
                    fontWeight: 900, 
                    color: sev === 'HIGH' ? '#ef4444' : sev === 'MED' ? '#f59e0b' : '#22c55e', 
                    flexShrink: 0, 
                    minWidth: 40,
                    textAlign: 'center'
                  }}>
                    {sev}
                  </div>

                  {/* Chronometer */}
                  <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', flexShrink: 0, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {l.timestamp || '—'}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Empty State Hint */}
      {auditLogs.length === 0 && (
        <div style={{
          display: 'flex', 
          alignItems: 'center', 
          gap: 16,
          padding: '24px 32px', 
          background: '#eef2ff', 
          border: '1px solid #e0e7ff', 
          borderRadius: 24, 
          color: '#4f46e5',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.05)'
        }}>
          <Shield size={24} />
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            <strong style={{ fontWeight: 900 }}>Infrastructure Protocol:</strong> Audit Logs are auto-generated — every login, sale, refund, product edit, and user action is automatically recorded here for compliance.
          </div>
        </div>
      )}
    </div>
  )
}
