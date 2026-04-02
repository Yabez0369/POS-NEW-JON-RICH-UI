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
  } catch (e) {}

  const baseStyle = isManager ? {
    background: hov ? 'linear-gradient(145deg, #1E293B, #0F172A)' : 'linear-gradient(135deg, #0F172A, #1E293B)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0 20px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: onClick ? 'pointer' : 'default',
    color: '#fff',
    transform: hov && hover ? 'scale(1.02)' : 'scale(1)',
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
