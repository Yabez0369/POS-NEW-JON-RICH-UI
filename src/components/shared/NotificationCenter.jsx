import { useState, useEffect, useRef, useCallback } from 'react'

let _notif = null
export const notify = (msg, type = 'info', duration = 3500) => _notif && _notif(msg, type, duration)

/* ─── Premium Notification Center ─── */
export function NotificationCenter({ t }) {
  const [ns, setNs] = useState([])
  const timersRef = useRef({})

  const dismiss = useCallback((id) => {
    setNs(n => n.map(x => x.id === id ? { ...x, leaving: true } : x))
    setTimeout(() => setNs(n => n.filter(x => x.id !== id)), 340)
  }, [])

  useEffect(() => {
    _notif = (msg, type, dur = 3500) => {
      const id = Date.now() + Math.random()
      setNs(n => [{ id, msg, type, dur, leaving: false, ts: Date.now() }, ...n.slice(0, 4)])
      timersRef.current[id] = setTimeout(() => dismiss(id), dur)
    }
    return () => { Object.values(timersRef.current).forEach(clearTimeout) }
  }, [dismiss])

  const pauseTimer = (id) => {
    clearTimeout(timersRef.current[id])
  }

  const resumeTimer = (id) => {
    const item = ns.find(x => x.id === id)
    if (!item) return
    const elapsed = Date.now() - item.ts
    const remaining = Math.max(item.dur - elapsed, 600)
    timersRef.current[id] = setTimeout(() => dismiss(id), remaining)
  }

  // Config per type — refined indigo palette
  const cfg = {
    success: {
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="10" fill="#059669" fillOpacity="0.15"/>
          <path d="M6 10.5L8.5 13L14 7.5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      accent: '#059669',
      glow: 'rgba(5,150,105,0.12)',
      label: 'Success',
    },
    error: {
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="10" fill="#DC2626" fillOpacity="0.15"/>
          <path d="M7 7L13 13M13 7L7 13" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      accent: '#DC2626',
      glow: 'rgba(220,38,38,0.12)',
      label: 'Error',
    },
    warning: {
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="10" fill="#D97706" fillOpacity="0.15"/>
          <path d="M10 6V11M10 13.5V14" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      accent: '#D97706',
      glow: 'rgba(217,119,6,0.12)',
      label: 'Warning',
    },
    info: {
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="10" fill="#6366F1" fillOpacity="0.15"/>
          <path d="M10 9V14M10 6.5V7" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      accent: '#6366F1',
      glow: 'rgba(99,102,241,0.12)',
      label: 'Info',
    },
  }

  if (ns.length === 0) return null

  return (
    <>
      {/* Inject keyframes once */}
      <style>{`
        @keyframes notif-enter {
          0% { transform: translateX(120%) scale(0.85); opacity: 0; }
          60% { transform: translateX(-6px) scale(1.02); opacity: 1; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes notif-leave {
          0% { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateX(120%) scale(0.85); opacity: 0; }
        }
        @keyframes notif-progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        @keyframes notif-icon-pop {
          0% { transform: scale(0); }
          60% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        @keyframes notif-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: 370,
        maxWidth: 'calc(100vw - 32px)',
        pointerEvents: 'none',
      }}>
        {ns.map((n) => {
          const c = cfg[n.type] || cfg.info
          return (
            <div
              key={n.id}
              onMouseEnter={() => pauseTimer(n.id)}
              onMouseLeave={() => resumeTimer(n.id)}
              style={{
                pointerEvents: 'auto',
                animation: n.leaving
                  ? 'notif-leave 0.32s cubic-bezier(0.55, 0, 1, 0.45) forwards'
                  : 'notif-enter 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                position: 'relative',
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={() => dismiss(n.id)}
            >
              {/* Glass card */}
              <div style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.92) 100%)`,
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: `1px solid rgba(255,255,255,0.6)`,
                boxShadow: `
                  0 1px 2px rgba(0,0,0,0.04),
                  0 4px 12px rgba(0,0,0,0.06),
                  0 12px 36px ${c.glow},
                  inset 0 1px 0 rgba(255,255,255,0.8)
                `,
                borderRadius: 16,
                padding: '14px 16px 12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Left accent line */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: `linear-gradient(180deg, ${c.accent}, ${c.accent}88)`,
                  borderRadius: '16px 0 0 16px',
                }} />

                {/* Icon with pop animation */}
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: `${c.accent}0D`,
                  border: `1.5px solid ${c.accent}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  animation: 'notif-icon-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both',
                }}>
                  {c.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: c.accent,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 3,
                    opacity: 0.85,
                  }}>
                    {c.label}
                  </div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1E293B',
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                  }}>
                    {n.msg}
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(n.id) }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 4,
                    cursor: 'pointer',
                    color: '#94A3B8',
                    fontSize: 12,
                    lineHeight: 1,
                    borderRadius: 6,
                    transition: 'all 0.15s',
                    flexShrink: 0,
                    marginTop: -2,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94A3B8' }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>

                {/* Bottom shimmer bar — progress indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: `${c.accent}10`,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${c.accent}60, ${c.accent}20)`,
                    transformOrigin: 'left',
                    animation: n.leaving ? 'none' : `notif-progress ${n.dur}ms linear forwards`,
                    borderRadius: 2,
                  }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
