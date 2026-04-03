import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useAppStore } from '@/stores/appStore'

export function ManagerTopbar() {
  const { currentUser } = useAuth()
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const { notifications, markAllRead, clearNotifications } = useAppStore()
  const [showNotifs, setShowNotifs] = useState(false)
  const dropdownRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownRef])

  const handleToggleNotifs = () => {
    setShowNotifs(!showNotifs)
    if (!showNotifs && unreadCount > 0) {
      // Mark as read after a delay or when closing? 
      // For now, let's just show them.
    }
  }

  return (
    <div style={{
      height: 72, background: 'rgba(245, 247, 250, 0.8)', padding: '0 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.04)',
      position: 'sticky', top: 0, zIndex: 100, transition: 'all 0.3s'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="mobile-toggle" onClick={toggleSidebar} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#475569'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div style={{
          background: '#fff', borderRadius: 99, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)', width: 550
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input placeholder="Search manager tools..." style={{
            border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: '#334155', width: '100%', fontFamily: 'inherit'
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Notification Button & Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={handleToggleNotifs}
            style={{
              background: '#fff', border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer',
              width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: showNotifs ? '#0F172A' : '#64748B',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)', position: 'relative', transition: 'all 0.2s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 8, right: 10, width: 10, height: 10,
                background: '#EF4444', borderRadius: '50%', border: '2px solid #fff',
                fontSize: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}></span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: 360,
              background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)',
              borderRadius: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.06)',
              overflow: 'hidden', zIndex: 1000, animation: 'fadeInScale 0.2s ease-out'
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Notifications</span>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Mark all read</button>
                  <button onClick={clearNotifications} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Clear</button>
                </div>
              </div>

              <div style={{ maxHeight: 400, overflowY: 'auto', padding: '8px 0' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🔔</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>No new alerts</div>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} style={{
                      padding: '12px 20px', borderBottom: '1px solid rgba(0,0,0,0.02)', display: 'flex', gap: 14,
                      background: n.read ? 'transparent' : 'rgba(59, 130, 246, 0.04)', transition: 'background 0.2s',
                      cursor: 'pointer'
                    }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'} onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(59, 130, 246, 0.04)'}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, background: n.type === 'error' ? '#FEF2F2' : n.type === 'warning' ? '#FFFBEB' : '#F0F9FF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0
                      }}>
                        {n.icon || (n.category === 'stock' ? '📦' : '🔔')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{n.msg}</span>
                          <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>{n.time}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {n.subtitle}
                        </div>
                      </div>
                      {!n.read && (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', marginTop: 6 }}></div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div style={{ padding: '12px 20px', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', background: '#F8FAFC' }}>
                  <button style={{ background: 'none', border: 'none', color: '#475569', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View Activity Log</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '6px 12px', borderRadius: 99, background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #0F172A, #1E293B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', fontWeight: 'bold' }}>
            {currentUser?.avatar || 'M'}
          </div>
          <div style={{ display: 'none' }} className="d-md-block">
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{currentUser?.name || 'Admin'}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>
    </div>
  )
}
