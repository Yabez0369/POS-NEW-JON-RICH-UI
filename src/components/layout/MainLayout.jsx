import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useTheme } from '@/context/ThemeContext'
import { useAppStore } from '@/stores/appStore'

export function MainLayout() {
  const { t } = useTheme()
  const { sidebarOpen, closeSidebar } = useAppStore()

  return (
    <div
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
        className="main-content"
        style={{
          marginLeft: 220,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Topbar />
        <div
          style={{
            padding: 'clamp(10px,2vw,24px)',
            flex: 1,
            minWidth: 0,
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  )
}
