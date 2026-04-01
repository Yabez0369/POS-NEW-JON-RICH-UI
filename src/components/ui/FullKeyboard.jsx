import { useState, useEffect, useRef } from 'react'

export const FullKeyboard = ({ initialValue = '', onClose, onSave, onChange, t }) => {
  const [val, setVal] = useState(String(initialValue))
  const [layout, setLayout] = useState('ABC') // ABC or 123
  const keyboardRef = useRef(null)

  // Close on Escape and Handle physical keyboard input + Click Outside
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose()
      if (e.key === "Enter") onSave(val)

      // Handle Typing
      if (e.key && e.key.length === 1) { // Single character (A-Z, 0-9, symbols)
        handleKey(e.key.toUpperCase())
      } else if (e.key === "Backspace") {
        handleKey('⌫')
      } else if (e.key === "Delete") {
        handleKey('C')
      } else if (e.key === " ") {
        handleKey('SPACE')
      }
    }

    const handleClickOutside = (e) => {
      // If the keyboard is open and we click outside it
      if (keyboardRef.current && !keyboardRef.current.contains(e.target)) {
        // Closing immediately with no event.stopPropagation() allows the click to reach its target
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
    let newVal = val
    if (key === '⌫') {
      newVal = val.slice(0, -1)
    } else if (key === 'C') {
      newVal = ''
    } else if (key === 'SPACE') {
      newVal = val + ' '
    } else if (key === '123') {
      setLayout('123'); return
    } else if (key === 'ABC') {
      setLayout('ABC'); return
    } else {
      newVal = val + key
    }
    setVal(newVal)
    if (onChange) onChange(newVal)
  }

  const rows = layout === 'ABC' ? [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
  ] : [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
    ['.', ',', '?', '!', "'", '⌫']
  ]

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'flex-end', // Pop from bottom
      justifyContent: 'center',
      paddingBottom: 20,
      pointerEvents: 'none'
    }}>
      <div
        ref={keyboardRef}
        style={{
          pointerEvents: 'auto',
          background: 'rgba(17, 24, 39, 0.75)', // Glass Background
          backdropFilter: 'blur(20px) saturate(180%)', // Glass Blur
          border: '1px solid rgba(255, 255, 255, 0.15)', // Glass Border
          borderRadius: 32,
          width: '90%',
          maxWidth: 800,
          boxShadow: '0 30px 100px rgba(0,0,0,0.6)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, padding: '0 10px' }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>SEARCH KEYBOARD</div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '8px 16px', borderRadius: 12, fontSize: 11, fontWeight: 900, letterSpacing: '1px' }}>CLOSE</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {row.map(k => (
                <KeyBtn
                  key={k}
                  label={k}
                  onClick={() => handleKey(k)}
                  color={k === '⌫' ? '#F59E0B' : null}
                  isWide={k === '⌫'}
                />
              ))}
            </div>
          ))}

          {/* Bottom Row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 4 }}>
            <button
              onClick={() => handleKey(layout === 'ABC' ? '123' : 'ABC')}
              style={sideBtnStyle(t)}
            >
              {layout === 'ABC' ? '123' : 'ABC'}
            </button>
            <button
              onClick={() => handleKey('SPACE')}
              style={{ ...sideBtnStyle(t), flex: 2, minWidth: 200 }}
            >
              SPACE
            </button>
            <button
              onClick={() => onSave(val)}
              style={{ ...sideBtnStyle(t), background: '#16A34A', color: 'white', border: 'none' }}
            >
              SEARCH
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const KeyBtn = ({ label, onClick, color, isWide }) => (
  <button
    onClick={onClick}
    style={{
      background: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: color || '#fff',
      width: isWide ? 85 : 65,
      height: 65,
      borderRadius: 16,
      fontSize: 22,
      fontWeight: 900,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      outline: 'none',
      userSelect: 'none',
      touchAction: 'manipulation'
    }}
    onMouseDown={e => {
      e.currentTarget.style.transform = 'scale(0.92)';
      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.4)'; // Blue glow on press
      e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.6)';
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

const sideBtnStyle = (t) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'white',
  padding: '16px 24px',
  borderRadius: 14,
  fontSize: 16,
  fontWeight: 800,
  cursor: 'pointer',
  minWidth: 80,
  transition: 'all 0.1s'
})
