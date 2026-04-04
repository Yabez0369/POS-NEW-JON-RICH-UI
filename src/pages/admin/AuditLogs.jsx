import { useState, useMemo } from 'react'
import { Badge, Card, Table, Btn } from '@/components/ui'
import {
  Shield,
  Search,
  Filter,
  Download,
  RefreshCw,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  ShoppingCart,
  Package,
  Settings,
  Lock,
  LogIn,
  LogOut,
  Eye,
  Trash2,
  Edit3
} from 'lucide-react'

const MODULE_ICONS = {
  auth: <LogIn size={14} />,
  login: <LogIn size={14} />,
  logout: <LogOut size={14} />,
  sales: <ShoppingCart size={14} />,
  orders: <ShoppingCart size={14} />,
  inventory: <Package size={14} />,
  products: <Package size={14} />,
  users: <User size={14} />,
  settings: <Settings size={14} />,
  security: <Lock size={14} />,
  till: <Activity size={14} />,
  cash: <Activity size={14} />,
  returns: <RefreshCw size={14} />,
}

const ACTION_COLORS = {
  created: 'green',
  updated: 'blue',
  deleted: 'red',
  viewed: 'teal',
  opened: 'green',
  closed: 'yellow',
  login: 'blue',
  logout: 'yellow',
  approved: 'green',
  rejected: 'red',
  export: 'purple',
  imported: 'teal',
}

const SEVERITY_MAP = {
  deleted: 'high',
  rejected: 'high',
  'security': 'high',
  login: 'low',
  logout: 'low',
  viewed: 'low',
  created: 'medium',
  updated: 'medium',
  closed: 'medium',
}

function getSeverity(log) {
  const act = (log.action || '').toLowerCase()
  const mod = (log.module || '').toLowerCase()
  const det = (log.details || '').toLowerCase()
  if (mod === 'security' || act.includes('delete') || act.includes('reject') || det.includes('fail')) return 'HIGH'
  if (act.includes('create') || act.includes('update') || act.includes('close')) return 'MED'
  return 'LOW'
}

function getSeverityColor(sev, t) {
  if (sev === 'HIGH') return t.red
  if (sev === 'MED') return t.yellow
  return t.green
}

function getModuleIcon(module) {
  const key = (module || '').toLowerCase()
  return MODULE_ICONS[key] || <Activity size={14} />
}

function getActionColor(action) {
  const key = (action || '').toLowerCase()
  for (const [k, v] of Object.entries(ACTION_COLORS)) {
    if (key.includes(k)) return v
  }
  return 'blue'
}

export const AuditLogs = ({ auditLogs = [], t }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterModule, setFilterModule] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')

  const modules = useMemo(() => {
    const s = new Set(auditLogs.map(l => l.module).filter(Boolean))
    return ['all', ...Array.from(s)]
  }, [auditLogs])

  const filtered = useMemo(() => {
    return auditLogs.filter(l => {
      const search = searchTerm.toLowerCase()
      const matchSearch = !search ||
        (l.user || '').toLowerCase().includes(search) ||
        (l.action || '').toLowerCase().includes(search) ||
        (l.module || '').toLowerCase().includes(search) ||
        (l.details || '').toLowerCase().includes(search)
      const matchModule = filterModule === 'all' || l.module === filterModule
      const sev = getSeverity(l)
      const matchSev = filterSeverity === 'all' || sev === filterSeverity
      return matchSearch && matchModule && matchSev
    })
  }, [auditLogs, searchTerm, filterModule, filterSeverity])

  const stats = useMemo(() => ({
    total: auditLogs.length,
    high: auditLogs.filter(l => getSeverity(l) === 'HIGH').length,
    med: auditLogs.filter(l => getSeverity(l) === 'MED').length,
    low: auditLogs.filter(l => getSeverity(l) === 'LOW').length,
  }), [auditLogs])

  const handleExport = () => {
    const headers = ['ID', 'User', 'Role', 'Action', 'Module', 'Details', 'Timestamp']
    const rows = filtered.map(l =>
      [l.id, l.user, l.role, l.action, l.module, l.details, l.timestamp].map(v => `"${v || ''}"`).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const roleColors = { admin: 'red', manager: 'yellow', cashier: 'green', customer: 'blue', system: 'purple', staff: 'teal' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease-out' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: t.text, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={26} color={t.accent} /> Audit Log
          </h1>
          <p style={{ fontSize: 13, color: t.text3, marginTop: 4 }}>
            Full system activity history — every action tracked and timestamped.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn t={t} variant="outline" style={{ borderRadius: 10, display: 'flex', gap: 8, alignItems: 'center' }} onClick={handleExport}>
            <Download size={15} /> Export CSV
          </Btn>
        </div>
      </div>

      {/* Severity KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Events', value: stats.total, color: t.accent, icon: <Activity size={18} /> },
          { label: 'High Risk', value: stats.high, color: t.red, icon: <AlertCircle size={18} /> },
          { label: 'Medium', value: stats.med, color: t.yellow, icon: <Clock size={18} /> },
          { label: 'Low / Info', value: stats.low, color: t.green, icon: <CheckCircle size={18} /> },
        ].map(({ label, value, color, icon }) => (
          <Card key={label} t={t} style={{ padding: '14px 18px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.text4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card t={t} style={{ padding: '16px 20px', borderRadius: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.text4 }} />
          <input
            type="text"
            placeholder="Search user, action, module..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 38px', borderRadius: 10, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: 13, outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.text3, fontWeight: 700 }}>
            <Filter size={13} /> Module:
          </div>
          {modules.slice(0, 6).map(m => (
            <button key={m} onClick={() => setFilterModule(m)} style={{
              padding: '5px 12px', borderRadius: 20,
              border: `1px solid ${filterModule === m ? t.accent : t.border}`,
              background: filterModule === m ? `${t.accent}15` : 'transparent',
              color: filterModule === m ? t.accent : t.text3,
              fontSize: 11, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize'
            }}>
              {m}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'HIGH', 'MED', 'LOW'].map(s => {
            const col = s === 'HIGH' ? t.red : s === 'MED' ? t.yellow : s === 'LOW' ? t.green : t.text3
            return (
              <button key={s} onClick={() => setFilterSeverity(s)} style={{
                padding: '5px 12px', borderRadius: 20,
                border: `1px solid ${filterSeverity === s ? col : t.border}`,
                background: filterSeverity === s ? `${col}15` : 'transparent',
                color: filterSeverity === s ? col : t.text3,
                fontSize: 11, fontWeight: 700, cursor: 'pointer'
              }}>
                {s === 'all' ? 'All Levels' : s}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Log Table */}
      <Card t={t} style={{ padding: 0, overflow: 'hidden', borderRadius: 20 }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: t.text }}>Activity Timeline</span>
          <span style={{ fontSize: 12, color: t.text4, fontWeight: 600 }}>{filtered.length} of {auditLogs.length} events</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: t.text4 }}>
            <Shield size={40} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>No audit events found.</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {auditLogs.length === 0 ? 'Events will appear here as users take actions in the system.' : 'Try adjusting your search or filters.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((l, idx) => {
              const sev = getSeverity(l)
              const sevColor = getSeverityColor(sev, t)
              return (
                <div key={l.id || idx} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 24px',
                  borderBottom: idx < filtered.length - 1 ? `1px solid ${t.border}` : 'none',
                  background: sev === 'HIGH' ? `${t.red}05` : 'transparent',
                  transition: 'background 0.2s',
                  animation: `slideInUp 0.3s ease-out ${idx * 0.05}s both`
                }} className="audit-row">
                  {/* Severity Badge */}
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: sevColor, flexShrink: 0
                  }} />

                  {/* Module Icon */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: `${t.accent}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accent
                  }}>
                    {getModuleIcon(l.module)}
                  </div>

                  {/* Main Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: t.text }}>{l.user || 'System'}</span>
                      <Badge t={t} text={l.action || 'ACTION'} color={getActionColor(l.action)} style={{ fontSize: 10, fontWeight: 800 }} />
                      <span style={{ fontSize: 12, color: t.text4 }}>in</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: t.text2, textTransform: 'capitalize' }}>{l.module || '—'}</span>
                    </div>
                    {l.details && (
                      <div style={{ fontSize: 12, color: t.text3, marginTop: 4, letterSpacing: -0.2 }}>
                        {l.details}
                      </div>
                    )}
                  </div>

                  {/* Role Badge */}
                  <Badge t={t} text={(l.role || 'system').toUpperCase()} color={roleColors[l.role] || 'blue'} style={{ flexShrink: 0 }} />

                  {/* Severity */}
                  <span style={{ fontSize: 10, fontWeight: 900, color: sevColor, flexShrink: 0, minWidth: 30 }}>{sev}</span>

                  {/* Timestamp */}
                  <div style={{ fontSize: 11, color: t.text4, fontFamily: 'monospace', flexShrink: 0, textAlign: 'right' }}>
                    {l.timestamp || '—'}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Empty State Hint */}
      {auditLogs.length === 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px', background: `${t.blue}10`,
          border: `1px solid ${t.blue}20`, borderRadius: 16, color: t.blue
        }}>
          <Shield size={20} />
          <div style={{ fontSize: 13 }}>
            <strong>Audit Logs are auto-generated</strong> — every login, sale, refund, product edit, and user action is automatically recorded here as it happens.
          </div>
        </div>
      )}
    </div>
  )
}
