import { Card } from './Card'
import { THEMES } from '@/lib/theme'
import { useAuth } from '@/context/AuthContext'

export const StatCard = ({ title, value, sub, color, icon, t, trend }) => {
  const theme = t || THEMES.light
  
  let isManager = false;
  try {
    const auth = useAuth();
    if (auth?.currentUser?.role === 'manager') isManager = true;
  } catch (e) {}

  if (isManager) {
    return (
      <Card t={t} style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`, filter: 'blur(30px)' }}></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, letterSpacing: 0.2 }}>{title}</div>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: -1, marginBottom: 8, position: 'relative', zIndex: 1, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{value}</div>
        {sub && <div style={{ fontSize: 13, color: '#64748B', position: 'relative', zIndex: 1 }}>{sub}</div>}
        {trend !== undefined && (
          <div style={{ fontSize: 12, color: trend > 0 ? '#10B981' : '#EF4444', marginTop: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, position: 'relative', zIndex: 1 }}>
            <span style={{ display: 'inline-block', padding: '2px 6px', background: trend > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: 4 }}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
            <span style={{ color: '#64748B' }}>vs last week</span>
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
      {trend && <div style={{ fontSize: 12, color: trend > 0 ? theme.green : theme.red, marginTop: 4, fontWeight: 700 }}>{trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last week</div>}
    </Card>
  )
}
