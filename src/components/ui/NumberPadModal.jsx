import { useState, useEffect, useRef } from 'react'
import { X, Delete, CornerDownLeft, ChevronLeft } from 'lucide-react'

/* ═══════════════════════════════════════════════════════ */
/*  PREMIUM NUMBER PAD — Consistent with FullKeyboard Style */
/* ═══════════════════════════════════════════════════════ */

export const NumberPadModal = ({
  title = "Enter Amount",
  subtitle = "",
  initialValue = '',
  onClose,
  onSave,
  onChange,
  t,
  isDecimal = true,
  saveLabel = 'DONE',
  currencySym = '£',
  showCurrency = true
}) => {
  const [val, setVal] = useState(String(initialValue))
  const [isFirstKey, setIsFirstKey] = useState(true)
  const [pressedKey, setPressedKey] = useState(null)
  
  // Drag State
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const numpadRef = useRef(null)

  // Handle Physical Keyboard & Dragging
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose()
      if (e.key === "Enter") onSave(val)
      if (/[0-9]/.test(e.key)) handleKey(e.key)
      if (e.key === "." || e.key === ",") handleKey(".")
      if (e.key === "Backspace") handleKey('⌫')
      if (e.key === "Delete" || e.key.toLowerCase() === "c") handleKey('C')
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
      if (numpadRef.current && !numpadRef.current.contains(e.target) && !isDragging) onClose()
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
  }, [onClose, onSave, val, isDragging, dragStart, pos])

  const startDrag = (e) => {
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY
    setIsDragging(true)
    setDragStart({ x: clientX, y: clientY })
  }

  const handleKey = (key) => {
    let newVal = val
    
    // Pulse feedback
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 150)

    if (key === '⌫') {
      newVal = val.slice(0, -1)
      setIsFirstKey(false)
    } else if (key === 'C') {
      newVal = ''
      setIsFirstKey(false)
    } else if (key === '.') {
      if (isDecimal) {
        if (isFirstKey || !val) newVal = '0.'
        else if (!val.includes('.')) newVal = val + '.'
      }
      setIsFirstKey(false)
    } else if (key === 'DONE') {
       onSave(val); return
    } else {
      if (isFirstKey) newVal = key
      else newVal = val + key
      setIsFirstKey(false)
    }

    setVal(newVal)
    if (onChange) onChange(newVal)

    // Haptic Feedback
    if (window.navigator.vibrate) window.navigator.vibrate(40)
  }

  return (
    <div style={overlayStyle}>
      <div
        ref={numpadRef}
        style={{
          ...keyboardContainerStyle,
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* — Input Preview Bar — */}
        <div 
          style={{ ...previewBarStyle, cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          <div style={previewLabel}>{title.toUpperCase()}</div>
          <div style={previewValueBox}>
            {showCurrency && <span style={currencyPrefix}>{currencySym}</span>}
            <span style={previewText}>{val || (showCurrency ? '0.00' : '')}</span>
            <span style={cursorStyle} />
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X size={18} /></button>
        </div>

        {/* — Tactical Key Grid — */}
        <div style={keysWrapper}>
          <div style={rowStyle}>
            {['1', '2', '3'].map(k => <PadButton key={k} label={k} onClick={() => handleKey(k)} isPressed={pressedKey === k} />)}
          </div>
          <div style={rowStyle}>
            {['4', '5', '6'].map(k => <PadButton key={k} label={k} onClick={() => handleKey(k)} isPressed={pressedKey === k} />)}
          </div>
          <div style={rowStyle}>
            {['7', '8', '9'].map(k => <PadButton key={k} label={k} onClick={() => handleKey(k)} isPressed={pressedKey === k} />)}
          </div>
          <div style={rowStyle}>
            <PadButton label="C" onClick={() => handleKey('C')} isPressed={pressedKey === 'C'} type="functional" />
            <PadButton label="0" onClick={() => handleKey('0')} isPressed={pressedKey === '0'} />
            <PadButton label="⌫" onClick={() => handleKey('⌫')} isPressed={pressedKey === '⌫'} type="functional" />
          </div>

          {/* — Bottom Row — */}
          <div style={rowStyle}>
            {isDecimal && (
              <button
                onClick={() => handleKey('.')}
                style={dotButtonStyle}
              >.</button>
            )}
            <button
              onClick={() => onSave(val)}
              style={saveBtnStyle}
            >
              <span style={{ marginRight: 8 }}>{saveLabel.toUpperCase()}</span>
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

const PadButton = ({ label, onClick, isPressed, type }) => {
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
    <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
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
  zIndex: 10000,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  paddingBottom: '2vh',
  pointerEvents: 'none',
  background: 'rgba(0,0,0,0.1)',
  animation: 'overlayFade 0.4s ease'
}

const keyboardContainerStyle = {
  pointerEvents: 'auto',
  width: '94%',
  maxWidth: '440px',
  background: 'rgba(15, 23, 42, 0.85)', // Deep Slate Navy
  backdropFilter: 'blur(30px) saturate(150%)',
  borderRadius: '40px',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 40px 100px rgba(0,0,0,0.7), inset 0 0 40px rgba(255,255,255,0.02)',
  padding: '30px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
}

const previewBarStyle = {
  background: 'rgba(255, 255, 255, 0.04)',
  borderRadius: '24px',
  height: '90px',
  display: 'flex',
  alignItems: 'center',
  padding: '0 30px',
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
  gap: '6px'
}

const currencyPrefix = {
  fontSize: '20px',
  fontWeight: '700',
  color: 'rgba(255,255,255,0.4)',
  marginTop: '4px'
}

const previewText = {
  fontSize: '36px',
  fontWeight: '900',
  color: '#fff',
  letterSpacing: '1px',
  textShadow: '0 0 20px rgba(255,255,255,0.2)'
}

const cursorStyle = {
  width: '3px',
  height: '32px',
  background: '#4F46E5', // Indigo
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
  marginTop: '10px'
}

const rowStyle = {
  display: 'flex',
  gap: '16px',
  justifyContent: 'center'
}

const keyBaseStyle = {
  width: '74px',
  height: '74px',
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
  borderRadius: '50%',
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

const dotButtonStyle = {
  ...keyBaseStyle,
  width: '74px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.15)',
  fontSize: '24px'
}

const saveBtnStyle = {
  ...keyBaseStyle,
  width: '160px',
  borderRadius: '40px',
  background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
  border: 'none',
  fontSize: '16px',
  fontWeight: '900',
  boxShadow: '0 10px 30px rgba(79, 70, 229, 0.4)',
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

