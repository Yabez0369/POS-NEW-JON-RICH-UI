import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { notify } from '@/components/shared'
import './HardwarePanel.css'

// ── HARDWARE ICONS (SVG PATHS) ──
const ICONS = {
  scan: <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  print: <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  card: <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  drawer: <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M12 11V11"/><path d="M12 17V17"/></svg>,
}

export const HardwarePanel = ({ addAudit, settings, t: tProp }) => {
  const { t: tCtx, darkMode } = useTheme()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const t = tProp || tCtx

  const [devs, setDevs] = useState([
    { id: 'scan', name: 'Barcode Scanner', type: 'USB-HID', status: 'connected', serial: 'BS-2024-001' },
    { id: 'print', name: 'Receipt Printer', type: 'TCP-IP', status: 'connected', serial: 'RP-2024-002' },
    { id: 'card', name: 'Card Terminal', type: 'WEB-API', status: 'connected', serial: 'CT-2024-003' },
    { id: 'drawer', name: 'Cash Drawer', type: 'RJ11', status: 'connected', serial: 'CD-2024-004' },
  ])
  
  const [testStatus, setTestStatus] = useState({})
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))

  useEffect(() => {
    const iv = setInterval(() => {
      setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  const toggleDevice = (d) => {
    setDevs(ds => ds.map(x => {
      if (x.id !== d.id) return x
      const s = x.status === 'connected' ? 'disconnected' : 'connected'
      if (addAudit) addAudit({ action: `Hardware ${s}`, detail: x.name, user: currentUser?.name || 'Staff' })
      notify(`${x.name} is now ${s}`, s === 'connected' ? 'success' : 'warning')
      return { ...x, status: s }
    }))
  }

  const runDiagnostic = (d) => {
    if (testStatus[d.id] === 'running') return
    
    setTestStatus(prev => ({ ...prev, [d.id]: 'running' }))
    
    // Simulate multi-step hardware check for premium feel
    setTimeout(() => {
      const logs = [
        `> Initialized ${d.name} diag...`,
        `> Checking connection: OK`,
        `> Testing internal buffer...`,
        `> SYNC SUCCESS`
      ]
      
      const responses = {
        scan: 'Barcode "5012345678901" read @ 12ms',
        print: 'Printed: 180mm x 80mm feed test',
        card: `Auth link: ${settings?.sym || '£'}0.01 success`,
        drawer: 'Kick signal 24V pulsed: OK',
      }
      
      setTestStatus(prev => ({ ...prev, [d.id]: responses[d.id] }))
      notify(`${d.name} Diagnostic Passed!`, 'success')
      
      setTimeout(() => {
        setTestStatus(prev => {
          const next = { ...prev }
          delete next[d.id]
          return next
        })
      }, 5000)
    }, 2000)
  }

  return (
    <div className="hw-terminal" data-theme={darkMode ? 'dark' : 'light'} style={{ color: t.text }}>
      
      {/* ════════════ TOPBAR ════════════ */}
      <div className="hw-topbar" style={{ background: t.bg2 }}>
        <button className="hw-back-btn" onClick={() => navigate('/app/home')} style={{ background: t.bg, color: t.text3 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <div className="hw-topbar-center">
          <div className="hw-topbar-title">Hardware Hub</div>
          <div className="hw-status-badge hw-status--sim">
            <span className="hw-status-pulse" />
            Simulation Mode
          </div>
        </div>

        <div className="hw-topbar-right">
          <div className="hw-time">{clock}</div>
        </div>
      </div>

      <div className="hw-main">
        {/* ── HERO ── */}
        <div className="hw-hero">
          <div className="hw-hero-title">System Health: Optimal</div>
          <div className="hw-hero-subtitle">All core peripherals active and ready</div>
        </div>

        {/* ── GRID ── */}
        <div className="hw-grid">
          {devs.map(d => {
            const isOnline = d.status === 'connected'
            const isTesting = testStatus[d.id] === 'running'
            const testResult = typeof testStatus[d.id] === 'string' && testStatus[d.id] !== 'running' ? testStatus[d.id] : null

            return (
              <div key={d.id} className={`hw-card ${isOnline ? 'hw-card--online' : ''}`} style={{ borderColor: t.border }}>
                <div className="hw-card-header">
                  <div className="hw-icon-wrap" style={{ color: isOnline ? '#10b981' : t.text3 }}>
                    {ICONS[d.id]}
                  </div>
                  <div className={isOnline ? "hw-online-dot" : "hw-offline-dot"} />
                </div>

                <div className="hw-card-info">
                  <div className="hw-card-name">{d.name}</div>
                  <div className="hw-card-meta">{d.type} • {d.serial}</div>
                </div>

                {isTesting && (
                  <div className="hw-testing-bar">
                    <div className="hw-testing-progress" />
                  </div>
                )}

                {testResult && (
                  <div className="hw-log slide-up">
                    <div style={{ opacity: 0.6, fontSize: '9px', marginBottom: '2px' }}>DIAGNOSTIC LOG</div>
                    {testResult}
                  </div>
                )}

                <div className="hw-actions">
                  <button 
                    className="hw-btn hw-btn--secondary"
                    onClick={() => toggleDevice(d)}
                  >
                    {isOnline ? 'Detach' : 'Initialize'}
                  </button>
                  <button 
                    className={`hw-btn ${isOnline ? 'hw-btn--primary' : 'hw-btn--disabled'}`}
                    disabled={!isOnline || isTesting}
                    onClick={() => runDiagnostic(d)}
                  >
                    {isTesting ? 'Testing...' : 'Test Device'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── FOOTER WARNING ── */}
        <div className="hw-sim-warning">
          <div className="hw-sim-icon">⚠️</div>
          <div className="hw-sim-text">
            <div className="hw-sim-title">Virtual Environment Active</div>
            <div className="hw-sim-desc">You are running in hardware simulation mode. Interaction signals bypass physical drivers.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

