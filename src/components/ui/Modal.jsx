import { useEffect } from 'react'
import { THEMES } from '@/lib/theme'

export const Modal = ({ title, onClose, children, t, width = 580, subtitle, position = 'center', style = {} }) => {
  const theme = t || THEMES.light
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [onClose])
  
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(10, 15, 30, 0.6)",
    backdropFilter: "blur(8px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center',
    padding: "40px",
    animation: 'modalFadeIn 0.3s ease-out'
  }

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose() }} data-modal-overlay="true">
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media(max-width:600px){
          [data-modal-overlay=true]{
            align-items: flex-end !important;
            padding: 0 !important;
          }
        }
      `}</style>
      <div style={{ 
        background: theme.bg2, 
        border: `1px solid ${theme.border}`, 
        borderRadius: "28px", 
        width: "100%", 
        maxWidth: width, 
        maxHeight: "90vh", 
        overflow: "hidden", 
        boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}>
        {(title || subtitle) && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            padding: "24px 30px", 
            borderBottom: `1px solid ${theme.border}`, 
            background: theme.bg2,
            cursor: 'default'
          }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: theme.text, letterSpacing: '-0.5px' }}>{title}</div>
              {subtitle && <div style={{ fontSize: 13, color: theme.text3, marginTop: 4, fontWeight: 600 }}>{subtitle}</div>}
            </div>
            <button 
              onClick={onClose} 
              style={{ 
                background: theme.bg3, 
                border: `1px solid ${theme.border}`, 
                color: theme.text3, 
                cursor: "pointer", 
                width: 36, 
                height: 36, 
                borderRadius: 12, 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16, 
                fontWeight: 700,
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = theme.border}
              onMouseOut={e => e.currentTarget.style.background = theme.bg3}
            >✕</button>
          </div>
        )}
        <div style={{ padding: 30, overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  )
}
