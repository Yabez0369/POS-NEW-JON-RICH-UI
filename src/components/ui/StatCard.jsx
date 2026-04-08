import { THEMES } from '@/lib/theme'

export const StatCard = ({ title, value, sub, color, type, icon, t, trend, centered, style = {} }) => {
  const theme = t || THEMES.light

  // 1. Determine status type based on props or title
  let statusType = type || 'neutral';
  
  if (!type) {
    const lowerTitle = (title || '').toLowerCase();
    if (lowerTitle.includes('revenue') || lowerTitle.includes('sales') || lowerTitle.includes('money') || lowerTitle.includes('profit')) {
      statusType = 'revenue';
    } else if (trend > 0 || lowerTitle.includes('growth')) {
      statusType = 'growth';
    } else if (trend < 0 || lowerTitle.includes('loss')) {
      statusType = 'loss';
    } else if (lowerTitle.includes('alert') || lowerTitle.includes('warning') || lowerTitle.includes('low stock') || lowerTitle.includes('storage')) {
      statusType = 'warning';
    }
  }

  // 2. Map border colors per stat type
  const BORDER_COLORS = {
    revenue: '#2563EB', // Blue
    growth: '#10B981',  // Green
    warning: '#FBBF24', // Yellow
    loss: '#EF4444',    // Red
    neutral: '#1F2937'  // Dark Gray
  };

  const borderColor = BORDER_COLORS[statusType] || BORDER_COLORS.neutral;

  return (
    <div 
      className="stat-card"
      style={{
        background: '#FFFFFF',
        borderLeft: `5px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
        ...style
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{title}</div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${borderColor}15`, display: "flex", alignItems: "center", justifyContent: "center", color: borderColor }}>{icon}</div>
      </div>
      
      <div style={{ fontSize: 28, fontWeight: 900, color: '#111827', letterSpacing: -0.5, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{sub}</div>}
      
      {trend !== undefined && (
        <div style={{ 
          fontSize: 12, 
          color: trend > 0 ? '#10B981' : '#EF4444', 
          marginTop: 12, 
          fontWeight: 700, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6 
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
            background: trend > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderRadius: 6
          }}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
          <span style={{ color: '#64748B', fontWeight: 500 }}>vs last week</span>
        </div>
      )}
    </div>
  )
}
