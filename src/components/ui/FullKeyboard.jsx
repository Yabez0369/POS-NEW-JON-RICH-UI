import { useState, useEffect, useRef } from 'react'
import { Search, Delete, Space, DeleteIcon, ArrowBigRightDash, X, ChevronLeft, ChevronRight, CornerDownLeft } from 'lucide-react'

/* ═══════════════════════════════════════════════════════ */
/*  PREMIUM POS KEYBOARD — Apple/Square/Lightspeed Style   */
/* ═══════════════════════════════════════════════════════ */

export const FullKeyboard = ({ initialValue = '', onClose, onSave, onChange, t, isInline = false, hidePreview = false }) => {
  const [val, setVal] = useState(String(initialValue))
  const [layout, setLayout] = useState('ABC') // ABC or 123
  const [pressedKey, setPressedKey] = useState(null)
  
  // Drag State
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const keyboardRef = useRef(null)

  // Sync val with initialValue if needed, but usually it's managed internally
  useEffect(() => {
    if (initialValue !== undefined && initialValue !== val) {
      // setVal(String(initialValue)) // Optional: sync from parent
    }
  }, [initialValue])

  // Handle Physical Keyboard & Dragging
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose()
      if (e.key === "Enter") onSave(val)

      if (e.key && e.key.length === 1) {
        handleKey(e.key.toUpperCase())
      } else if (e.key === "Backspace") {
        handleKey('⌫')
      } else if (e.key === " ") {
        handleKey('SPACE')
      }
    }

    const handleMouseMove = (e) => {
      if (!isDragging) return
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      setPos({ x: pos.x + dx, y: pos.y + dy })
      setDragStart({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleClickOutside = (e) => {
      if (isInline) return
      if (keyboardRef.current && !keyboardRef.current.contains(e.target) && !isDragging) {
        onClose()
      }
    }

    window.addEventListener("keydown", h)
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      window.addEventListener("touchmove", (e) => {
        const touch = e.touches[0]
        handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY })
      }, { passive: false })
      window.addEventListener("touchend", handleMouseUp)
    }
    document.addEventListener("mousedown", handleClickOutside, true)
    
    return () => {
      window.removeEventListener("keydown", h)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchmove", handleMouseMove)
      window.removeEventListener("touchend", handleMouseUp)
      document.removeEventListener("mousedown", handleClickOutside, true)
    }
  }, [onClose, onSave, val, isDragging, dragStart, pos, isInline])

  const startDrag = (e) => {
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY
    setIsDragging(true)
    setDragStart({ x: clientX, y: clientY })
  }

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
    } else if (key === 'DONE' || key === 'SEARCH') {
      onSave(val); return
    } else {
      newVal = val + key
    }
    setVal(newVal)
    if (onChange) onChange(newVal)

    // Haptic Feedback
    if (window.navigator.vibrate) window.navigator.vibrate(40)

    // Pulse feedback
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 150)
  }

  const rows = layout === 'ABC' ? [
    ['Q', 'W', 'E', 'R', 'T'],
    ['Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G'],
    ['H', 'J', 'K', 'L', 'M'],
    ['N', 'B', 'V', 'C', 'X'],
    ['Z', '⌫']
  ] : [
    ['1', '2', '3', '4', '5'],
    ['6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '('],
    [')', '$', '&', '@', '"'],
    ['.', '?', '!', "'", ','],
    ['⌫']
  ]

  return (
    <div style={isInline ? inlineOverlayStyle : overlayStyle}>
      <div
        ref={keyboardRef}
        style={{
          ...(isInline ? inlineContainerStyle : keyboardContainerStyle),
          transform: isInline ? 'none' : `translate(${pos.x}px, ${pos.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* — Close Button (Always visible now) — */}
        <button onClick={onClose} style={topCloseBtnStyle}>
          <X size={24} />
        </button>

        {/* — Input Preview Bar — */}
        {!hidePreview && (
          <div 
            style={{ ...previewBarStyle, cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
          >
            <div style={previewLabel}>INPUT PREVIEW</div>
            <div style={previewValueBox}>
              <span style={previewText}>{val || '...'}</span>
              <span style={cursorStyle} />
            </div>
          </div>
        )}

        {/* — Key Grid — */}
        <div style={keysWrapper}>
          {rows.map((row, i) => (
            <div key={i} style={rowStyle}>
              {row.map(k => (
                <Key
                  key={k}
                  label={k}
                  onClick={() => handleKey(k)}
                  isPressed={pressedKey === k}
                  type={k === '⌫' ? 'functional' : 'standard'}
                />
              ))}
            </div>
          ))}

          {/* — Bottom Row — */}
          <div style={rowStyle}>
            <button
              onClick={() => handleKey(layout === 'ABC' ? '123' : 'ABC')}
              style={functionalKeyStyle}
            >
              {layout === 'ABC' ? '123' : 'ABC'}
            </button>
            <button
              onClick={() => handleKey('SPACE')}
              style={spaceKeyStyle}
            >
              <Space size={24} />
            </button>
            <button
              onClick={() => onSave(val)}
              style={searchBtnStyle}
            >
              <span style={{ marginRight: 8 }}>SEARCH</span>
              <CornerDownLeft size={20} />
            </button>
          </div>
        </div>

        {/* — Footer Simplified — */}
        <div style={{ height: '8px' }} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: animations }} />
    </div>
  )
}

const Key = ({ label, onClick, isPressed, type }) => {
  const [active, setActive] = useState(false)

  const handleStart = (e) => {
    e.preventDefault()
    setActive(true)
    onClick()
  }

  const handleEnd = () => setActive(false)

  const isIcon = label === '⌫'
  const isSpecial = type === 'functional'

  return (
    <div style={{ position: 'relative', flex: isSpecial ? 1.5 : 1, minWidth: 0 }}>
      {/* iOS Style Pop-up Preview */}
      {active && !isIcon && (
        <div style={keyPopupStyle}>{label}</div>
      )}

      <button
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        style={{
          ...keyBaseStyle,
          ...(isSpecial ? functionalKeyStyles : {}),
          ...(active ? keyPressStyle : {}),
          ...(isPressed ? keyFlashStyle : {}),
        }}
      >
        {isIcon ? <Delete size={28} /> : label}
      </button>
    </div>
  )
}

/* ── Styles ── */

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 20000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  background: 'rgba(0,0,0,0.1)',
  animation: 'overlayFade 0.4s ease'
}

const inlineOverlayStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto'
}

const inlineContainerStyle = {
  width: '100%',
  height: '100%',
  background: 'rgba(15, 23, 42, 0.98)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '16px',
  boxShadow: 'none'
}

const keyboardContainerStyle = {
  pointerEvents: 'auto',
  width: '90%',
  maxWidth: '580px',
  background: 'rgba(15, 23, 42, 0.95)',
  backdropFilter: 'blur(30px) saturate(150%)',
  borderRadius: '32px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: '0 50px 120px rgba(0,0,0,0.8), inset 0 0 40px rgba(255,255,255,0.02)',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
}

const previewBarStyle = {
  background: 'rgba(255, 255, 255, 0.04)',
  borderRadius: '16px',
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  padding: '0 20px',
  position: 'relative',
  border: '1px solid rgba(255,255,255,0.05)',
  userSelect: 'none'
}

const previewLabel = {
  position: 'absolute',
  top: '8px',
  left: '30px',
  fontSize: '10px',
  fontWeight: '800',
  color: 'rgba(255,255,255,0.3)',
  letterSpacing: '1.5px',
  textTransform: 'uppercase'
}

const previewValueBox = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px'
}

const previewText = {
  fontSize: '20px',
  fontWeight: '900',
  color: '#fff',
  letterSpacing: '1px',
  textShadow: '0 0 20px rgba(255,255,255,0.2)'
}

const cursorStyle = {
  width: '3px',
  height: '32px',
  background: 'var(--terminal-indigo, #4F46E5)',
  borderRadius: '4px',
  animation: 'blink 1.2s infinite ease'
}

const closeBtnStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.06)',
  border: 'none',
  color: 'rgba(255,255,255,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
}

const topCloseBtnStyle = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  width: '44px',
  height: '44px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 100,
  transition: 'all 0.2s'
}

const keysWrapper = {
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  marginTop: '20px'
}

const rowStyle = {
  display: 'flex',
  gap: '16px',
  justifyContent: 'center'
}

const keyBaseStyle = {
  width: '64px',
  height: '64px',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '50%', // PERFECT CIRCLE
  color: '#fff',
  fontSize: '24px',
  fontWeight: '800',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  userSelect: 'none',
  touchAction: 'manipulation'
}

const functionalKeyStyles = {
  background: 'rgba(255, 255, 255, 0.18)',
  boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
}

const keyPressStyle = {
  transform: 'scale(0.9)',
  background: 'rgba(255, 255, 255, 0.25)',
  boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
}

const keyFlashStyle = {
  background: 'rgba(79, 70, 229, 0.5)',
  boxShadow: '0 0 20px rgba(79, 70, 229, 0.7)',
}

const keyPopupStyle = {
  position: 'absolute',
  bottom: '120%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '70px',
  height: '70px',
  background: '#fff',
  borderRadius: '50%', // Circle feedback
  color: '#0F172A',
  fontSize: '32px',
  fontWeight: '900',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
  zIndex: 10,
  animation: 'popIn 0.1s ease-out'
}

const functionalKeyStyle = {
  ...keyBaseStyle,
  width: '80px',
  borderRadius: '40px',
  background: 'rgba(255, 255, 255, 0.15)',
  fontSize: '16px',
  fontWeight: '900'
}

const spaceKeyStyle = {
  ...keyBaseStyle,
  flex: 1,
  maxWidth: '240px',
  borderRadius: '40px',
  background: 'rgba(255, 255, 255, 0.1)',
}

const searchBtnStyle = {
  ...keyBaseStyle,
  flex: 1.5,
  borderRadius: '40px',
  background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
  border: 'none',
  fontSize: '16px',
  fontWeight: '900',
  boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
}

const footerStyle = {
  paddingTop: '16px',
  textAlign: 'center',
  fontSize: '10px',
  fontWeight: '900',
  color: 'rgba(255,255,255,0.2)',
  letterSpacing: '4px',
  textTransform: 'uppercase'
}

const animations = `
  @keyframes overlayFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes popIn {
    0% { transform: translateX(-50%) scale(0.6) translateY(20px); opacity: 0; }
    100% { transform: translateX(-50%) scale(1.1) translateY(0); opacity: 1; }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`
