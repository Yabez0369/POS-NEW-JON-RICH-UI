import { useState, useEffect, useRef } from 'react'

export const NumberPadModal = ({ title, subtitle, initialValue = '', onClose, onSave, t, isDecimal = false, saveLabel = 'DONE', position = 'center' }) => {
  const [val, setVal] = useState(String(initialValue))
  const [isFirstKey, setIsFirstKey] = useState(true)
  const numpadRef = useRef(null)

  // Close on Escape and Handle physical keyboard input + Click Outside
  useEffect(() => {
    const h = (e) => { 
      if (e.key === "Escape") onClose() 
      if (e.key === "Enter") onSave(val)
      
      // Handle Typing
      if (/[0-9]/.test(e.key)) {
        handleKey(e.key)
      } else if (e.key === ".") {
        handleKey(".")
      } else if (e.key === "Backspace") {
        handleKey('⌫')
      } else if (e.key === "Delete" || e.key === "c" || e.key === "C") {
        handleKey('C')
      }
    }

    const handleClickOutside = (e) => {
      if (numpadRef.current && !numpadRef.current.contains(e.target)) {
        onClose()
      }
    }

    window.addEventListener("keydown", h)
    document.addEventListener("mousedown", handleClickOutside, true)
    return () => {
      window.removeEventListener("keydown", h)
      document.removeEventListener("mousedown", handleClickOutside, true)
    }
  }, [onClose, onSave, val])

  const handleKey = (key) => {
    if (key === '⌫') {
      setVal(v => v.slice(0, -1))
      setIsFirstKey(false)
    } else if (key === 'C') {
      setVal('')
      setIsFirstKey(false)
    } else if (key === '.') {
      if (isDecimal) {
        if (isFirstKey) {
          setVal('0.')
        } else if (!val.includes('.')) {
          setVal(v => v + '.')
        }
      }
      setIsFirstKey(false)
    } else {
      if (isFirstKey) {
        setVal(key)
      } else {
        setVal(v => v + key)
      }
      setIsFirstKey(false)
    }
  }

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 2000, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: position === 'left' ? 'flex-start' : 'center',
      paddingLeft: position === 'left' ? 40 : 0,
      pointerEvents: 'none'
    }}>
      <div 
        ref={numpadRef}
        style={{ 
          pointerEvents: 'auto', 
          background: 'rgba(17, 24, 39, 0.75)', 
          backdropFilter: 'blur(20px) saturate(180%)', 
          border: '1px solid rgba(255, 255, 255, 0.15)', 
          borderRadius: 32, 
          width: 380, 
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)', 
          padding: '32px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 24 
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 4 }}>{title || 'Enter Value'}</div>
            {subtitle && <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '8px 12px', borderRadius: 12, fontSize: 11, fontWeight: 900 }}>CLOSE</button>
        </div>

        <div style={{ 
          background: 'rgba(0, 0, 0, 0.2)', 
          padding: '24px', 
          borderRadius: 20, 
          fontSize: 48, 
          fontWeight: 900, 
          textAlign: 'right', 
          color: '#fff',
          minHeight: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          border: '1px solid rgba(255,255,255,0.05)',
          transition: 'all 0.2s'
        }}>
          <span style={{ 
            background: isFirstKey ? 'rgba(59, 130, 246, 0.3)' : 'transparent', 
            color: '#fff',
            padding: '0 8px',
            borderRadius: 8,
            transition: 'all 0.2s'
          }}>
            {val || '0'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, width: '100%' }}>
          {['1','2','3','4','5','6','7','8','9','C','0','⌫'].map(k => (
            <div key={k} style={{ display: 'flex', justifyContent: 'center' }}>
              <NumpadBtn label={k} onClick={() => handleKey(k)} color={k === '⌫' ? '#F59E0B' : k === 'C' ? '#EF4444' : null} />
            </div>
          ))}
          {isDecimal && (
            <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'center', marginTop: 4 }}>
              <button 
                onClick={() => handleKey('.')}
                style={{ 
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  color: '#fff', 
                  padding: '12px', 
                  borderRadius: 16, 
                  fontSize: 22, 
                  fontWeight: 900, 
                  cursor: 'pointer',
                  transition: 'all 0.1s'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >.</button>
            </div>
          )}
        </div>

        <button 
          onClick={() => onSave(val)}
          style={{ 
            background: '#16A34A', 
            color: '#fff', 
            border: 'none', 
            padding: '20px', 
            borderRadius: 20, 
            fontSize: 18, 
            fontWeight: 900, 
            cursor: 'pointer',
            marginTop: 8,
            boxShadow: '0 10px 20px rgba(22, 163, 74, 0.3)',
            transition: 'all 0.1s'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          ✓ {saveLabel}
        </button>
      </div>
    </div>
  )
}

const NumpadBtn = ({ label, onClick, color }) => (
  <button 
    onClick={onClick}
    style={{ 
      background: 'rgba(255, 255, 255, 0.08)', 
      border: '1px solid rgba(255, 255, 255, 0.1)', 
      color: color || '#fff', 
      width: 75,
      height: 75,
      borderRadius: '50%', 
      fontSize: 28, 
      fontWeight: 900, 
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      userSelect: 'none',
      touchAction: 'manipulation'
    }}
    onMouseDown={e => { 
      e.currentTarget.style.transform = 'scale(0.88)'; 
      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.4)';
      e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.7)';
    }}
    onMouseUp={e => { 
      e.currentTarget.style.transform = 'scale(1)'; 
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    }}
    onMouseLeave={e => { 
      e.currentTarget.style.transform = 'scale(1)'; 
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    }}
  >
    {label}
  </button>
)
