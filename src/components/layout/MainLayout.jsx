import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useTheme } from '@/context/ThemeContext'
import { useAppStore } from '@/stores/appStore'
import { venuesService } from '@/services'

export function MainLayout() {
  const { t } = useTheme()
  const { sidebarOpen, closeSidebar } = useAppStore()
  const [venues, setVenues] = useState([])
  const location = useLocation()
  const isPos = location.pathname.includes('/app/pos') || location.pathname.includes('/app/home')

  useEffect(() => {
    venuesService.fetchVenuesWithSites().then(setVenues)
  }, [])

  return (
    <div
      className={isPos ? 'is-pos' : ''}
      style={{
        fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
        background: t.bg,
        minHeight: '100vh',
        color: t.text,
      }}
    >
      <div className={`sidebar-wrap${sidebarOpen ? ' open' : ''}`}>
        <Sidebar />
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
        {!isPos && <Topbar venues={venues} />}
        <div
          style={{
            padding: isPos ? 0 : 'clamp(10px,2vw,24px)',
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
