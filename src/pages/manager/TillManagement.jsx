import { useState, useEffect, useMemo } from 'react'
import { Card, StatCard, Badge, Table, Modal, Input, Btn } from '@/components/ui'
import { fmt } from '@/lib/utils'
import { cashService } from '@/services'
import { notify } from '@/components/shared'

export default function TillManagement({ t, currentUser, settings }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active') // 'active' | 'closed' | 'reconciliation'
  const [selectedSession, setSelectedSession] = useState(null)
  const [logs, setLogs] = useState([])
  const [showLogs, setShowLogs] = useState(false)
  const [showReconcile, setShowReconcile] = useState(false)
  const [reconcileNotes, setReconcileNotes] = useState('')
  
  const [filters, setFilters] = useState({
    cashier: '',
    date: '',
  })

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const siteId = currentUser?.site_id || 'b0000000-0000-0000-0000-000000000001'
      const data = await cashService.fetchAllSessions(siteId)
      setSessions(data || [])
    } catch (err) {
      console.error('TillManagement: Failed to load sessions:', err)
      notify(`Session load failed: ${err.message || 'Unknown error'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredSessions = useMemo(() => {
    let result = sessions
    if (tab === 'active') result = sessions.filter(s => s.status === 'open')
    if (tab === 'closed') result = sessions.filter(s => s.status === 'closed')
    if (tab === 'reconciliation') result = sessions.filter(s => s.status === 'closed' && (s.variance !== 0) && s.reconciliation_status !== 'approved')

    if (filters.cashier) {
      result = result.filter(s => 
        (s.opened_by_name || '').toLowerCase().includes(filters.cashier.toLowerCase()) ||
        (s.opened_by_user?.name || '').toLowerCase().includes(filters.cashier.toLowerCase())
      )
    }
    if (filters.date) {
      result = result.filter(s => s.opened_at.startsWith(filters.date))
    }
    return result
  }, [sessions, tab, filters])

  const stats = useMemo(() => {
    const active = sessions.filter(s => s.status === 'open')
    const pending = sessions.filter(s => s.status === 'closed' && s.variance !== 0 && s.reconciliation_status === 'pending')
    const totalCash = active.reduce((sum, s) => sum + (s.expected_cash || s.opening_float || 0), 0)
    return {
      activeCount: active.length,
      pendingCount: pending.length,
      totalActiveCash: totalCash
    }
  }, [sessions])

  const viewLogs = async (session) => {
    setSelectedSession(session)
    setShowLogs(true)
    try {
      const data = await cashService.fetchSessionMovements(session.id)
      setLogs(data || [])
    } catch (err) {
      notify('Failed to load transaction logs', 'error')
    }
  }

  const handleReconcile = async (status) => {
    if (!selectedSession) return
    try {
      await cashService.updateReconciliation(selectedSession.id, status, reconcileNotes, currentUser.id)
      notify(`Session ${status === 'approved' ? 'approved' : 'rejected'}`, 'success')
      setShowReconcile(false)
      setReconcileNotes('')
      loadSessions()
    } catch (err) {
      notify('Failed to update reconciliation', 'error')
    }
  }

  const sym = settings?.sym || '£'

  return (
    <div style={{ 
      background: 'linear-gradient(180deg, #C4E8E7 0%, #FFFFFF 100%)',
      minHeight: '100%', padding: '32px', borderRadius: 24,
      display: 'flex', flexDirection: 'column', gap: 40, paddingBottom: 40, fontFamily: "'Inter', sans-serif" 
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1E293B', margin: 0, letterSpacing: '-0.02em' }}>Till Management</h1>
          <p style={{ color: '#64748B', marginTop: 4, fontSize: 15 }}>Monitor drawer balances and verify shift reconciliations</p>
        </div>
        <Btn t={t} onClick={loadSessions} variant="secondary">Refresh Data</Btn>
      </div>

      {/* Stats - Full Width Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: 24, 
        width: '100%',
      }}>
        <StatCard centered t={t} title="Live Drawer Cash" value={fmt(stats.totalActiveCash, sym)} color="#10B981" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>} />
        <StatCard centered t={t} title="Active Tills" value={stats.activeCount} color="#3B82F6" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>} />
        <StatCard centered t={t} title="Needs Review" value={stats.pendingCount} color="#EF4444" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>} />
      </div>

      {/* Main Content - White Theme */}
      <Card t={t} style={{ 
        padding: 0, 
        overflow: 'hidden', 
        background: '#FFFFFF', 
        color: '#1E293B',
        border: '1px solid #E2E8F0', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        borderRadius: 24,
        marginTop: 12
      }}>
        {/* Tabs & Filters */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8, background: '#F1F5F9', padding: 6, borderRadius: 14 }}>
            {[
              { id: 'active', label: 'Active Tills' },
              { id: 'closed', label: 'Closed Tills' },
              { id: 'reconciliation', label: 'Needs Review' }
            ].map(tabItem => (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id)}
                style={{
                  padding: '12px 24px', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  background: tab === tabItem.id ? '#fff' : 'transparent',
                  color: tab === tabItem.id ? '#1E293B' : '#64748B',
                  boxShadow: tab === tabItem.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {tabItem.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Input 
              t={t} placeholder="Search Cashier..." value={filters.cashier} 
              onChange={v => setFilters(f => ({ ...f, cashier: v }))}
              style={{ width: 220, marginBottom: 0 }}
              size="sm"
            />
            <input 
              type="date" 
              value={filters.date} 
              onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
              style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none', fontWeight: 700, color: '#475569', background: '#fff' }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #F1F5F9' }}>
                <th style={{ padding: '20px 24px', fontSize: 13, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cashier / Counter</th>
                <th style={{ padding: '20px 24px', fontSize: 13, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Time Range</th>
                <th style={{ padding: '20px 24px', fontSize: 13, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                <th style={{ padding: '20px 24px', fontSize: 13, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Expected</th>
                <th style={{ padding: '20px 24px', fontSize: 13, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Actual</th>
                <th style={{ padding: '20px 24px', fontSize: 13, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Variance</th>
                <th style={{ padding: '20px 24px', fontSize: 13, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map(s => {
                const name = s.opened_by_name || 'Staff Member'
                const counter = s.counter_name || 'POS Terminal'
                const diff = (s.closing_cash || 0) - (s.expected_cash || 0)
                const isMismatch = s.status === 'closed' && diff !== 0
                
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 17 }}>{name}</div>
                      <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                        {counter}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: 13, color: '#64748B' }}>
                      <div style={{ fontWeight: 600 }}>{s.opened_at ? new Date(s.opened_at).toLocaleTimeString() : 'N/A'}</div>
                      {s.closed_at && <div style={{ fontSize: 11, opacity: 0.7 }}>Closed: {new Date(s.closed_at).toLocaleTimeString()}</div>}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <Badge 
                        t={t} 
                        text={s.status.toUpperCase()} 
                        color={s.status === 'open' ? 'green' : 'gray'} 
                      />
                      {s.reconciliation_status && s.reconciliation_status !== 'pending' && (
                        <div style={{ fontSize: 10, marginTop: 6, fontWeight: 800, color: s.reconciliation_status === 'approved' ? '#10B981' : '#EF4444', textTransform: 'uppercase' }}>
                          ✓ {s.reconciliation_status}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '24px 24px', textAlign: 'right', fontWeight: 800, color: '#1E293B', fontSize: 17 }}>{fmt(s.expected_cash || 0, sym)}</td>
                    <td style={{ padding: '24px 24px', textAlign: 'right', color: '#64748B', fontWeight: 700, fontSize: 16 }}>{s.status === 'closed' ? fmt(s.closing_cash || 0, sym) : '--'}</td>
                    <td style={{ padding: '24px 24px', textAlign: 'right' }}>
                      {isMismatch ? (
                        <span style={{ fontWeight: 900, fontSize: 16, color: diff > 0 ? '#10B981' : '#EF4444', padding: '6px 12px', borderRadius: 10, background: diff > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                          {diff > 0 ? '+' : ''}{fmt(diff, sym)}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: 14, fontWeight: 700 }}>{s.status === 'open' ? '--' : 'Matched'}</span>
                      )}
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => viewLogs(s)}
                          style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#475569', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#CBD5E1'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                        >
                          Logs
                        </button>
                        {isMismatch && s.reconciliation_status === 'pending' && (
                          <button 
                            onClick={() => { setSelectedSession(s); setShowReconcile(true) }}
                            style={{ background: 'linear-gradient(135deg, #3B82F6, #2563eb)', border: 'none', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(37,99,235,0.2)' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 64, textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>📂</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#475569' }}>No sessions found</div>
                    <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 4 }}>Try adjusting your filters or search terms.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Modal */}
      {showLogs && selectedSession && (
        <Modal t={t} title="Audit Logs" subtitle={`Transaction history for ${selectedSession.opened_by_name || 'Staff'}`} onClose={() => setShowLogs(false)} width={600}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto', paddingRight: 10 }}>
            {logs.map((log, i) => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#F8FAFC' : '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.02)' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#1E293B', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: ['drop', 'refund', 'cash-out'].includes(log.type) ? '#EF4444' : '#10B981' }}></span>
                    {(log.type || 'info').replace('-', ' ')}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, fontWeight: 500 }}>{new Date(log.created_at).toLocaleString()} · {log.notes || 'System entry'}</div>
                </div>
                <div style={{ fontWeight: 900, fontSize: 16, color: ['drop', 'refund', 'cash-out'].includes(log.type) ? '#EF4444' : '#10B981' }}>
                  {['drop', 'refund', 'cash-out'].includes(log.type) ? '-' : '+'}{fmt(log.amount, sym)}
                </div>
              </div>
            ))}
            {logs.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: '#94A3B8', fontWeight: 600 }}>No transaction logs available</div>}
          </div>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <Btn t={t} onClick={() => setShowLogs(false)} variant="secondary">Close Audit View</Btn>
          </div>
        </Modal>
      )}

      {/* Reconciliation Modal */}
      {showReconcile && selectedSession && (
        <Modal t={t} title="Verify Mismatch" subtitle="Confirm or reject the shift variance report" onClose={() => setShowReconcile(false)} width={420}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>System Expected:</span>
                <span style={{ fontWeight: 800, color: '#1E293B' }}>{fmt(selectedSession.expected_cash, sym)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Cashier Counted:</span>
                <span style={{ fontWeight: 800, color: '#1E293B' }}>{fmt(selectedSession.closing_cash, sym)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #E2E8F0', paddingTop: 12 }}>
                <span style={{ color: '#64748B', fontWeight: 700, fontSize: 13 }}>TOTAL VARIANCE:</span>
                <span style={{ fontWeight: 900, fontSize: 20, color: selectedSession.variance > 0 ? '#10B981' : '#EF4444' }}>
                  {selectedSession.variance > 0 ? '+' : ''}{fmt(selectedSession.variance, sym)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>Reconciliation Notes</label>
              <textarea 
                value={reconcileNotes} 
                onChange={e => setReconcileNotes(e.target.value)}
                placeholder="Reason for mismatch or manual correction details..."
                style={{ width: '100%', minHeight: 100, padding: 12, borderRadius: 12, border: '1px solid #E2E8F0', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Btn 
                t={t} 
                variant="danger" 
                style={{ padding: '14px', borderRadius: 12, fontWeight: 800 }} 
                onClick={() => handleReconcile('rejected')}
              >
                Reject Report
              </Btn>
              <Btn 
                t={t} 
                variant="success" 
                style={{ padding: '14px', borderRadius: 12, fontWeight: 800 }} 
                onClick={() => handleReconcile('approved')}
              >
                Approve Variance
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
