import { useAuth } from '@/context/AuthContext'
import { useAppStore } from '@/stores/appStore'

export function ManagerTopbar() {
  const { currentUser } = useAuth()
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

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
          background: '#fff', borderRadius: 99, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', width: 300
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input placeholder="Search manager tools..." style={{
            border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#334155', width: '100%', fontFamily: 'inherit'
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <button style={{
          background: '#fff', border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer',
          width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)', position: 'relative'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span style={{ position: 'absolute', top: 8, right: 10, width: 8, height: 8, background: '#EF4444', borderRadius: '50%', border: '2px solid #fff' }}></span>
        </button>

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
