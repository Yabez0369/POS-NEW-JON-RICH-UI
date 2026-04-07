import { useState } from 'react'
import { THEMES } from '@/lib/theme'
import { useAuth } from '@/context/AuthContext'

export const Card = ({ children, t, style = {}, onClick, hover = false }) => {
  const [hov, setHov] = useState(false)
  const theme = t || THEMES.light

  // Safe useAuth destructuring in case it's used outside provider
  let isManager = false;
  try {
    const auth = useAuth();
    if (auth?.currentUser?.role === 'manager') isManager = true;
  } catch (e) { }

  const baseStyle = isManager ? {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: onClick ? 'pointer' : 'default',
    color: '#0F172A',
    transform: hov && hover ? 'translateY(-4px)' : 'translateY(0)',
  } : {
    background: hov ? theme.cardHover : theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: 14,
    padding: 20,
    boxShadow: theme.shadow,
    transition: 'all 0.15s',
    cursor: onClick ? 'pointer' : 'default'
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ ...baseStyle, ...style }}
    >
      {children}
    </div>
  )
}
