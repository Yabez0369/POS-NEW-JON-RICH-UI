import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useCashStore } from '@/stores/cashStore'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Input, Modal } from '@/components/ui'
import { notify } from '@/components/shared'
import { fmt } from '@/lib/utils'
import './CashManagement.css'

// ── Movement type config ──
const MOVE_META = {
  open: { label: 'Opening Float', icon: '🟢', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
  float: { label: 'Opening Float', icon: '🟢', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
  sale: { label: 'Sale', icon: '💰', color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  'cash-in': { label: 'Cash In', icon: '📥', color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  lift: { label: 'Cash Lift', icon: '📥', color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  drop: { label: 'Cash Drop', icon: '📤', color: '#ea580c', bg: 'rgba(234,88,12,0.08)' },
  'cash-out': { label: 'Cash Out', icon: '📤', color: '#ea580c', bg: 'rgba(234,88,12,0.08)' },
  refund: { label: 'Refund', icon: '↩️', color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
}

export const CashManagement = ({ addAudit, settings, t: tProp }) => {
  const { t: tCtx, darkMode } = useTheme()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const t = tProp || tCtx

  const { session, movements, history, openTill: storeOpenTill, addMovement, closeTill: storeCloseTill, loadSession } = useCashStore()

  const [openFloat, setOpenFloat] = useState('100')
  const [showDrop, setShowDrop] = useState(false)
  const [showLift, setShowLift] = useState(false)
  const [showCountCash, setShowCountCash] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const [dropAmt, setDropAmt] = useState('')
  const [liftAmt, setLiftAmt] = useState('')
  const [countDraft, setCountDraft] = useState('')
  const [countedCash, setCountedCash] = useState('')

  // Clock
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

  useEffect(() => {
    const iv = setInterval(() => setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 30000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    const counterId = currentUser?.counter_id || 'c0000000-0000-0000-0000-000000000001'
    loadSession(counterId)
  }, [currentUser])

  // ── Computed values ──
  const cashIn = movements.filter(m => m.type === 'cash-in' || m.type === 'lift' || m.type === 'sale').reduce((s, m) => s + Number(m.amount), 0)
  const cashOut = movements.filter(m => m.type === 'cash-out' || m.type === 'drop' || m.type === 'refund').reduce((s, m) => s + Number(m.amount), 0)
  const expected = session ? Number(session.openFloat) + cashIn - cashOut : 0

  const lastBalance = history?.[0]?.actualCash ?? history?.[0]?.expectedCash ?? 0
  const balance = session ? expected : lastBalance

  const countedNum = parseFloat(countedCash)
  const canCloseShift = !!session && countedCash !== '' && !isNaN(countedNum) && countedNum >= 0

  // ── Actions ──
  const openTill = async () => {
    const amt = parseFloat(openFloat)
    if (isNaN(amt) || amt < 0) { notify('Enter a valid float amount', 'error'); return }
    await storeOpenTill(currentUser, amt)
    if (addAudit) addAudit({ action: 'Till Opened', detail: `Float: ${fmt(amt, settings?.sym)}`, user: currentUser?.name || 'Cashier' })
    notify(`Till opened with ${fmt(amt, settings?.sym)} float`, 'success')
  }

  const doCashDrop = async () => {
    const amt = parseFloat(dropAmt)
    if (isNaN(amt) || amt <= 0) { notify('Enter a valid amount', 'error'); return }
    if (amt > expected) { notify('Cannot drop more than expected balance', 'error'); return }
    await addMovement('drop', amt, 'Cash drop', currentUser)
    if (addAudit) addAudit({ action: 'Cash Drop', detail: `${fmt(amt, settings?.sym)} — Cash drop`, user: currentUser?.name || 'Cashier' })
    notify(`Cash drop: ${fmt(amt, settings?.sym)}`, 'success')
    setShowDrop(false)
    setDropAmt('')
  }

  const doCashLift = async () => {
    const amt = parseFloat(liftAmt)
    if (isNaN(amt) || amt <= 0) { notify('Enter a valid amount', 'error'); return }
    await addMovement('lift', amt, 'Cash lift', currentUser)
    if (addAudit) addAudit({ action: 'Cash Lift', detail: `${fmt(amt, settings?.sym)} — Cash lift`, user: currentUser?.name || 'Cashier' })
    notify(`Cash lift: ${fmt(amt, settings?.sym)}`, 'success')
    setShowLift(false)
    setLiftAmt('')
  }

  const saveCountCash = async () => {
    const actual = parseFloat(countDraft)
    if (isNaN(actual) || actual < 0) { notify('Enter actual cash amount', 'error'); return }
    setCountedCash(String(actual))
    setShowCountCash(false)
    notify('Cash count saved', 'success')
  }

  const closeTill = async (actualInput) => {
    const actual = typeof actualInput === 'number' ? actualInput : parseFloat(actualInput)
    if (isNaN(actual) || actual < 0) { notify('Enter actual cash amount', 'error'); return }
    setShowCloseConfirm(false)
    setShowCountCash(false)
    const savedExpected = expected
    const closed = await storeCloseTill(actual, savedExpected, currentUser)
    if (closed) {
      if (addAudit) {
        addAudit({
          action: 'Till Closed',
          detail: `Expected: ${fmt(savedExpected, settings?.sym)}, Actual: ${fmt(actual, settings?.sym)}, Variance: ${fmt(closed.variance, settings?.sym)}`,
          user: currentUser?.name || 'Cashier',
        })
      }
      notify(`Till closed. Variance: ${fmt(closed.variance, settings?.sym)}`, closed.variance === 0 ? 'success' : 'warning')
    }
    setCountDraft('')
    setCountedCash('')
  }

  const handleCloseShiftTile = () => {
    if (!canCloseShift) {
      setCountDraft(countedCash || '')
      setShowCountCash(true)
      notify('Count cash before closing shift', 'error')
      return
    }
    setShowCloseConfirm(true)
  }

  const sym = settings?.sym || '£'

  return (
    <div className="cm-terminal" data-theme={darkMode ? 'dark' : 'light'} style={{ background: t.bg, color: t.text }}>

      {/* ══════════════════════════ TOP BAR ══════════════════════════ */}
      <div className="cm-topbar" style={{ background: t.bg2, borderBottomColor: t.border }}>
        <button
          className="cm-back-btn"
          style={{ background: t.bg3, color: t.text3 }}
          onClick={() => navigate('/app/home')}
          title="Back to Home"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="cm-topbar-center">
          <span className="cm-topbar-title">Cash Drawer</span>
          <span className={`cm-status-badge ${session ? 'cm-status--open' : 'cm-status--closed'}`}>
            <span className="cm-status-dot" />
            {session ? 'Open' : 'Closed'}
          </span>
        </div>

        <div className="cm-topbar-right">
          <div className="cm-topbar-avatar" style={{ background: t.blue || '#2563eb' }}>
            {currentUser?.name?.charAt(0) || 'C'}
          </div>
          <span className="cm-topbar-time" style={{ color: t.text3 }}>{clock}</span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  STATE: NO SESSION → OPEN TILL GATE                        */}
      {/* ════════════════════════════════════════════════════════════ */}
      {!session ? (
        <div className="cm-gate">
          <div className="cm-gate-glow" />
          <div className="cm-gate-content">
            <div className="cm-gate-icon-wrap">
              <div className="cm-gate-icon">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="3" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                  <line x1="10" y1="14" x2="14" y2="14" />
                </svg>
              </div>
            </div>

            <div className="cm-gate-title" style={{ color: t.text }}>Open Your Till</div>
            <div className="cm-gate-subtitle" style={{ color: t.text3 }}>
              Set your opening float to begin the shift
            </div>

            <div className="cm-gate-form">
              <div className="cm-gate-input-wrap">
                <span className="cm-gate-input-label" style={{ color: t.text3 }}>Opening Float ({sym})</span>
                <input
                  className="cm-gate-input"
                  style={{ background: t.bg2, borderColor: t.border, color: t.text }}
                  type="number"
                  value={openFloat}
                  onChange={e => setOpenFloat(e.target.value)}
                  placeholder="100.00"
                  autoFocus
                />
              </div>

              <button className="cm-gate-open-btn" onClick={openTill}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </svg>
                Open Shift
              </button>
            </div>

            {lastBalance > 0 && (
              <div className="cm-gate-last" style={{ color: t.text3 }}>
                Last shift closed at <strong style={{ color: t.text2 }}>{fmt(lastBalance, sym)}</strong>
              </div>
            )}

            {history?.length > 0 && (
              <button className="cm-gate-history-link" style={{ color: t.text3 }} onClick={() => setShowHistory(true)}>
                View Shift History
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════ */
        /*  STATE: SESSION ACTIVE → Premium POS Terminal             */
        /* ══════════════════════════════════════════════════════════ */
        <div className="cm-main">

          {/* ── HERO BALANCE ── */}
          <div className="cm-hero">
            <div className="cm-hero-bg" />
            <div className="cm-hero-content">
              <div className="cm-hero-label">Expected Balance</div>
              <div className="cm-hero-amount">{fmt(balance, sym)}</div>
              <div className="cm-hero-meta">
                <span className="cm-hero-meta-item">
                  <span className="cm-hero-meta-dot cm-dot--green" />
                  Float {fmt(session.openFloat, sym)}
                </span>
                <span className="cm-hero-meta-divider">·</span>
                <span className="cm-hero-meta-item">
                  <span className="cm-hero-meta-dot cm-dot--blue" />
                  In {fmt(cashIn, sym)}
                </span>
                <span className="cm-hero-meta-divider">·</span>
                <span className="cm-hero-meta-item">
                  <span className="cm-hero-meta-dot cm-dot--red" />
                  Out {fmt(cashOut, sym)}
                </span>
              </div>
              {countedCash && (
                <div className="cm-hero-counted">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Counted: {fmt(countedNum, sym)}
                </div>
              )}
            </div>
          </div>

          {/* ── ACTION GRID ── */}
          <div className="cm-grid-wrap">
            <div className="cm-grid">

              {/* Row 1: Cash Drop + Cash Lift */}
              <button
                className="cm-card cm-card--secondary"
                style={{ background: t.bg2, color: t.text }}
                onClick={() => { setDropAmt(''); setShowDrop(true) }}
                id="cash-drop-btn"
              >
                <div className="cm-card-icon cm-card-icon--orange">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 7l-5 5-5-5" />
                  </svg>
                </div>
                <div className="cm-card-label">Cash Drop</div>
                <div className="cm-card-hint" style={{ color: t.text3 }}>Remove to safe</div>
              </button>

              <button
                className="cm-card cm-card--secondary"
                style={{ background: t.bg2, color: t.text }}
                onClick={() => { setLiftAmt(''); setShowLift(true) }}
                id="cash-lift-btn"
              >
                <div className="cm-card-icon cm-card-icon--blue">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22V2M17 17l-5-5-5 5" />
                  </svg>
                </div>
                <div className="cm-card-label">Cash Lift</div>
                <div className="cm-card-hint" style={{ color: t.text3 }}>Add to till</div>
              </button>

              {/* Row 2: Count Cash — Primary */}
              <button
                className="cm-card cm-card--primary"
                onClick={() => { setCountDraft(countedCash || ''); setShowCountCash(true) }}
                id="count-cash-btn"
              >
                <div className="cm-card-icon cm-card-icon--white">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div className="cm-card-label">Count Cash</div>
                <div className="cm-card-hint cm-card-hint--white">Physically count your drawer</div>
                {countedCash && (
                  <span className="cm-count-badge">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {fmt(countedNum, sym)}
                  </span>
                )}
              </button>

              {/* Row 3: Close Shift — Danger */}
              <button
                className={`cm-card cm-card--danger ${canCloseShift ? '' : 'cm-card--muted'}`}
                onClick={handleCloseShiftTile}
                id="close-shift-btn"
              >
                <div className="cm-card-icon cm-card-icon--red">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div className="cm-card-body">
                  <div className="cm-card-label">Close Shift</div>
                  <div className="cm-card-hint cm-card-hint--red">
                    {canCloseShift ? 'End shift and submit' : 'Count cash first'}
                  </div>
                </div>
                {!canCloseShift && (
                  <div className="cm-card-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                )}
              </button>

            </div>

            {/* View History — Tertiary */}
            <button
              className="cm-history-btn"
              style={{ color: t.text3 }}
              onClick={() => setShowHistory(true)}
              id="view-history-btn"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              View Shift History
            </button>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════ */}
      {/*  MODALS                        */}
      {/* ═══════════════════════════════ */}

      {/* Cash Drop Modal */}
      {showDrop && session && (
        <Modal
          t={t}
          title="Cash Drop"
          subtitle="Remove cash from the till to the safe"
          onClose={() => { setShowDrop(false); setDropAmt('') }}
          width={420}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="cash-hint" style={{ background: t.bg3, color: t.text2 }}>
              <span>Expected Balance</span>
              <span style={{ color: t.blue, fontWeight: 1000, fontSize: 16 }}>{fmt(expected, sym)}</span>
            </div>
            <Input t={t} label="Drop Amount" value={dropAmt} onChange={setDropAmt} placeholder="0.00" type="number" />
            <div className="cash-modalActions">
              <button className="cash-modalBtn cash-modalBtn--secondary" style={{ color: t.text2, borderColor: t.border }} onClick={() => { setShowDrop(false); setDropAmt('') }}>
                Cancel
              </button>
              <button className="cash-modalBtn cash-modalBtn--danger" onClick={doCashDrop}>
                Confirm Drop
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cash Lift Modal */}
      {showLift && session && (
        <Modal
          t={t}
          title="Cash Lift"
          subtitle="Add cash into the till drawer"
          onClose={() => { setShowLift(false); setLiftAmt('') }}
          width={420}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input t={t} label="Lift Amount" value={liftAmt} onChange={setLiftAmt} placeholder="0.00" type="number" />
            <div className="cash-modalActions">
              <button className="cash-modalBtn cash-modalBtn--secondary" style={{ color: t.text2, borderColor: t.border }} onClick={() => { setShowLift(false); setLiftAmt('') }}>
                Cancel
              </button>
              <button className="cash-modalBtn cash-modalBtn--success" onClick={doCashLift}>
                Confirm Lift
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Count Cash Modal */}
      {showCountCash && session && (
        <Modal
          t={t}
          title="Count Cash"
          subtitle="Enter the actual cash in your drawer"
          onClose={() => setShowCountCash(false)}
          width={420}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="cash-hint" style={{ background: t.bg3, color: t.text2 }}>
              <span>System Expected</span>
              <span style={{ color: t.blue, fontWeight: 1000, fontSize: 16 }}>{fmt(expected, sym)}</span>
            </div>
            <Input t={t} label="Actual Cash in Drawer" value={countDraft} onChange={setCountDraft} placeholder="0.00" type="number" />
            {countDraft && !isNaN(parseFloat(countDraft)) && (
              <div
                className="variance-display"
                style={{
                  background: (parseFloat(countDraft) - expected) === 0 ? t.greenBg : (parseFloat(countDraft) - expected) > 0 ? t.blueBg : t.redBg,
                  border: `1px solid ${(parseFloat(countDraft) - expected) === 0 ? t.greenBorder : (parseFloat(countDraft) - expected) > 0 ? t.blueBorder : t.redBorder}`,
                }}
              >
                <span className="variance-label" style={{ color: t.text2 }}>Variance</span>
                <span
                  className="variance-value"
                  style={{ color: (parseFloat(countDraft) - expected) === 0 ? t.green : (parseFloat(countDraft) - expected) > 0 ? t.blue : t.red }}
                >
                  {(parseFloat(countDraft) - expected) >= 0 ? '+' : ''}
                  {fmt(Math.round((parseFloat(countDraft) - expected) * 100) / 100, sym)}
                </span>
              </div>
            )}
            <div className="cash-modalActions">
              <button className="cash-modalBtn cash-modalBtn--secondary" style={{ color: t.text2, borderColor: t.border }} onClick={() => setShowCountCash(false)}>
                Cancel
              </button>
              <button className="cash-modalBtn cash-modalBtn--blue" onClick={saveCountCash}>
                Save Count
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Close Shift Confirmation Modal */}
      {showCloseConfirm && session && (
        <Modal
          t={t}
          title="Close Shift"
          subtitle="Review your count and confirm to close"
          onClose={() => setShowCloseConfirm(false)}
          width={440}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="cash-hint" style={{ background: t.bg3, color: t.text2 }}>
              <span>Your Count</span>
              <span style={{ color: t.text, fontWeight: 1000, fontSize: 16 }}>{fmt(countedNum, sym)}</span>
            </div>
            <div className="cash-hint" style={{ background: t.bg3, color: t.text2 }}>
              <span>System Expected</span>
              <span style={{ color: t.blue, fontWeight: 1000, fontSize: 16 }}>{fmt(expected, sym)}</span>
            </div>

            <div
              className="variance-display"
              style={{
                background: (countedNum - expected) === 0 ? t.greenBg : (countedNum - expected) > 0 ? t.blueBg : t.redBg,
                border: `1px solid ${(countedNum - expected) === 0 ? t.greenBorder : (countedNum - expected) > 0 ? t.blueBorder : t.redBorder}`,
              }}
            >
              <span className="variance-label" style={{ color: t.text2 }}>Variance</span>
              <span
                className="variance-value"
                style={{ color: (countedNum - expected) === 0 ? t.green : (countedNum - expected) > 0 ? t.blue : t.red }}
              >
                {(countedNum - expected) >= 0 ? '+' : ''}
                {fmt(Math.round((countedNum - expected) * 100) / 100, sym)}
              </span>
            </div>

            <div className="cash-modalActions">
              <button className="cash-modalBtn cash-modalBtn--secondary" style={{ color: t.text2, borderColor: t.border }} onClick={() => setShowCloseConfirm(false)}>
                Cancel
              </button>
              <button className="cash-modalBtn cash-modalBtn--danger" onClick={() => closeTill(countedNum)}>
                Close Shift
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Shift History Modal */}
      {showHistory && (
        <Modal
          t={t}
          title="Shift History"
          subtitle="Recent closed sessions"
          onClose={() => setShowHistory(false)}
          width={480}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Show current movements if session active */}
            {session && movements.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.4, marginBottom: 10, color: t.text3 }}>
                  Current Shift Activity
                </div>
                {movements.slice(0, 10).map(m => {
                  const meta = MOVE_META[m.type] || { label: m.type, icon: '•', color: t.text3, bg: 'rgba(0,0,0,0.04)' }
                  const isOutflow = ['drop', 'cash-out', 'refund'].includes(m.type)
                  return (
                    <div key={m.id} className="cash-movement-item" style={{ background: meta.bg, marginBottom: 6 }}>
                      <div className="cash-movement-icon" style={{ background: meta.bg, color: meta.color }}>{meta.icon}</div>
                      <div className="cash-movement-info">
                        <div className="cash-movement-type" style={{ color: t.text }}>{meta.label}</div>
                        <div className="cash-movement-time" style={{ color: t.text3 }}>{m.time} · {m.by}</div>
                      </div>
                      <div className="cash-movement-amount" style={{ color: isOutflow ? t.red : t.green }}>
                        {isOutflow ? '−' : '+'}{fmt(m.amount, sym)}
                      </div>
                    </div>
                  )
                })}
                {(history?.length > 0) && (
                  <div style={{ height: 1, background: t.border, margin: '12px 0' }} />
                )}
              </div>
            )}

            {/* Past shift history */}
            {(history || []).slice(0, 8).map((h) => {
              const v = h?.variance ?? 0
              const vColor = v === 0 ? t.green : v > 0 ? t.blue : t.red
              return (
                <div
                  key={h.id}
                  className="history-card"
                  style={{ background: t.bg3, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderColor: t.border }}
                >
                  <div className="history-card-row">
                    <div className="history-card-label" style={{ color: t.text2 }}>{h.closedBy || 'Cashier'}</div>
                    <div className="history-card-variance" style={{ color: vColor }}>{v >= 0 ? '+' : ''}{fmt(v, sym)}</div>
                  </div>
                  <div className="history-card-date" style={{ color: t.text3 }}>{h.closedAt || h.openedAt || '—'}</div>
                  <div className="history-card-detail" style={{ color: t.text3 }}>
                    <span>Float: {fmt(h.openFloat ?? 0, sym)}</span>
                    <span>Actual: {fmt(h.actualCash ?? 0, sym)}</span>
                    <span>Expected: {fmt(h.expectedCash ?? 0, sym)}</span>
                  </div>
                </div>
              )
            })}
            {(!history || history.length === 0) && (!session || movements.length === 0) && (
              <div style={{ fontSize: 14, color: t.text3, fontWeight: 700, textAlign: 'center', padding: 24 }}>
                No shift history yet
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
