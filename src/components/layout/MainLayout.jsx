import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ManagerSidebar } from './ManagerSidebar'
import { ManagerTopbar } from './ManagerTopbar'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useAppStore } from '@/stores/appStore'
import { venuesService } from '@/services'

export function MainLayout() {
  const { t } = useTheme()
  const { currentUser } = useAuth()
  const { sidebarOpen, closeSidebar } = useAppStore()
  const [venues, setVenues] = useState([])
  const location = useLocation()
  const isPos = location.pathname.includes('/app/pos') || 
                location.pathname.includes('/app/home') || 
                location.pathname.includes('/app/cash') || 
                location.pathname.includes('/app/pickup') ||
                location.pathname.includes('/app/hardware')

  const isManager = currentUser?.role === 'manager'

  useEffect(() => {
    venuesService.fetchVenuesWithSites().then(setVenues)
  }, [])

  return (
    <div
      className={isPos ? 'is-pos' : ''}
      style={{
        fontFamily: isManager ? "'Inter', system-ui, sans-serif" : "'Plus Jakarta Sans',system-ui,sans-serif",
        background: isManager ? '#F5F7FA' : t.bg,
        minHeight: '100vh',
        color: isManager ? '#1E293B' : t.text,
      }}
    >
      <div className={`sidebar-wrap${sidebarOpen ? ' open' : ''}`}>
        {isManager ? <ManagerSidebar /> : <Sidebar />}
      </div>
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.4)',
            zIndex: 290,
          }}
        />
      )}
      <div
        className={`main-content ${isPos ? 'pos-main-content' : ''}`}
        style={{
          marginLeft: isPos ? 0 : 220,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left .25s ease'
        }}
      >
        {!isPos && (isManager ? <ManagerTopbar /> : <Topbar venues={venues} />)}
        <div
          style={{
            padding: isPos ? 0 : (isManager ? 'clamp(16px, 3vw, 32px)' : 'clamp(10px,2vw,24px)'),
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  )
}
