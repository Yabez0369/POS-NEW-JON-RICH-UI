import { Card } from './Card'
import { THEMES } from '@/lib/theme'
import { useAuth } from '@/context/AuthContext'

export const StatCard = ({ title, value, sub, color, icon, t, trend }) => {
  const theme = t || THEMES.light

  let isManager = false;
  try {
    const auth = useAuth();
    if (auth?.currentUser?.role === 'manager') isManager = true;
  } catch (e) { }

  if (isManager) {
    return (
      <Card t={t} style={{ position: 'relative', overflow: 'hidden', padding: '12px 16px' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`, filter: 'blur(30px)' }}></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>{value}</div>
            {sub && <div style={{ fontSize: 11, color: '#64748B' }}>{sub}</div>}
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
        </div>
        {trend !== undefined && (
          <div style={{ fontSize: 10, color: typeof trend === 'number' ? (trend > 0 ? '#10B981' : '#EF4444') : '#f59e0b', marginTop: 6, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, position: 'relative', zIndex: 1 }}>
            {typeof trend === 'number' ? (
              <>
                <span style={{ display: 'inline-block', padding: '1px 5px', background: trend > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: 3 }}>
                  {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
                </span>
                <span style={{ color: '#64748B', fontWeight: 500 }}>vs last week</span>
              </>
            ) : (
                <span style={{ display: 'inline-block', padding: '2px 6px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 4 }}>
                  {trend}
                </span>
            )}
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card t={t}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: theme.text3, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.7 }}>{title}</div>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: color || theme.accent, letterSpacing: -0.5, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: theme.text4 }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ fontSize: 12, color: typeof trend === 'number' ? (trend > 0 ? theme.green : theme.red) : theme.yellow, marginTop: 4, fontWeight: 700 }}>
          {typeof trend === 'number' ? `${trend > 0 ? "↑" : "↓"} ${Math.abs(trend)}% vs last week` : trend}
        </div>
      )}
    </Card>
  )
}
