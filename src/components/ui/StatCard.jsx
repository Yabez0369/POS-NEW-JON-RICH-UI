import { Card } from './Card'
import { THEMES } from '@/lib/theme'
import { useAuth } from '@/context/AuthContext'

export const StatCard = ({ title, value, sub, color, icon, t, trend, centered, style = {} }) => {
  const theme = t || THEMES.light

  let isManager = false;
  try {
    const auth = useAuth();
    if (auth?.currentUser?.role === 'manager') isManager = true;
  } catch (e) { }

  if (isManager) {
    const isCentered = true; 
    return (
      <Card t={t} style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        height: '100%',
        background: 'linear-gradient(135deg, #C4E8E7 0%, #FFFFFF 100%)',
        border: '1px solid #B0E0DF',
        minHeight: 160, 
        justifyContent: 'center',
        ...style
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`, filter: 'blur(30px)' }}></div>
        <div style={{
          display: "flex",
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: "center",
          position: 'relative',
          zIndex: 2,
          width: '100%',
          gap: 12
        }}>
          <div style={{ 
            width: 44, height: 44, borderRadius: 14, 
            background: 'rgba(0,0,0,0.04)', 
            display: "flex", alignItems: "center", justifyContent: "center", 
            fontSize: 22, color: color
          }}>{icon}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 14, color: '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#0F172A', letterSpacing: -1 }}>{value}</div>
            {sub && <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{sub}</div>}
          </div>
        </div>
        {trend !== undefined && (
          <div style={{ 
            fontSize: 11, color: trend > 0 ? '#10B981' : '#EF4444', 
            marginTop: 10, fontWeight: 700, display: 'flex', 
            alignItems: 'center', gap: 6, position: 'relative', zIndex: 2 
          }}>
            <span style={{ 
              display: 'inline-block', padding: '2px 6px', 
              background: trend > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
              borderRadius: 4 
            }}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
            <span style={{ color: '#64748B', fontWeight: 500 }}>vs last week</span>
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card t={t} style={style}>
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
