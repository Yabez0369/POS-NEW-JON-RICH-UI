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
  showCurrency = true,
  position = 'center', // 'center' | 'left' | 'right'
  size = 'md', // 'sm' | 'md'
  hideOverlay = false,
  hidePreview = false,
  fullHeight = false,
  isInline = false,
  offsetX = 0,
  offsetY = 0
}) => {
  const [val, setVal] = useState(String(initialValue))
  const [isFirstKey, setIsFirstKey] = useState(true)
  const [pressedKey, setPressedKey] = useState(null)

  // Drag State
  const [pos, setPos] = useState({ x: offsetX, y: offsetY })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const numpadRef = useRef(null)

  // Handle Physical Keyboard & Dragging
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose()
      if (e.key === "Enter") handleKey('DONE')
      if (/[0-9]/.test(e.key)) handleKey(e.key)
      if (e.key === "." || e.key === ",") handleKey(".")
      if (e.key === "Backspace") handleKey('⌫')
      if (e.key === "Delete") handleKey('C')
    }

    const handleMouseMove = (e) => {
      if (!isDragging) return
      const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX
      const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY
      
      setPos(prev => ({
        x: prev.x + (clientX - dragStart.x),
        y: prev.y + (clientY - dragStart.y)
      }))
      setDragStart({ x: clientX, y: clientY })
    }

    const handleMouseUp = () => setIsDragging(false)

    window.addEventListener("keydown", h)
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      window.addEventListener("touchmove", handleMouseMove, { passive: false })
      window.addEventListener("touchend", handleMouseUp)
    }

    const handleClickOutside = (e) => {
      if (isInline) return
      if (numpadRef.current && !numpadRef.current.contains(e.target) && !isDragging) onClose()
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
  }, [onClose, onSave, val, isDragging, dragStart, isInline])

  // Scroll Lock
  useEffect(() => {
    if (!isInline) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      if (!isInline) document.body.style.overflow = 'auto'
    }
  }, [isInline])

  const startDrag = (e) => {
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY
    setIsDragging(true)
    setDragStart({ x: clientX, y: clientY })
  }

  const handleKey = (key) => {
    // Pulse feedback
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 150)

    if (key === 'DONE' || key === 'Enter') {
      onSave(val); return
    }

    setVal(prev => {
      let newVal = prev
      if (key === '⌫' || key === 'Backspace') {
        newVal = prev.slice(0, -1)
        setIsFirstKey(false)
      } else if (key === 'C' || key === 'Delete') {
        newVal = ''
        setIsFirstKey(false)
      } else if (key === '.') {
        if (isDecimal) {
          if (isFirstKey || !prev) newVal = '0.'
          else if (!prev.includes('.')) newVal = prev + '.'
        }
        setIsFirstKey(false)
      } else {
        // Numeric keys
        if (isFirstKey) newVal = key
        else newVal = prev + key
        setIsFirstKey(false)
      }
      
      if (onChange) onChange(newVal)
      return newVal
    })

    // Haptic Feedback
    if (window.navigator.vibrate) window.navigator.vibrate(40)
  }

  const isSm = size === 'sm'

  const customOverlayStyle = {
    ...overlayStyle,
    justifyContent: position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center',
    paddingLeft: position === 'left' ? '40px' : '0',
    paddingRight: position === 'right' ? '40px' : '0',
    background: hideOverlay ? 'transparent' : overlayStyle.background,
    backdropFilter: hideOverlay ? 'none' : overlayStyle.backdropFilter,
    pointerEvents: hideOverlay ? 'none' : 'auto' // Important: overlay shouldn't block clicks if invisible
  }

  const customContainerStyle = {
    ...keyboardContainerStyle,
    pointerEvents: 'auto',
    maxWidth: isInline ? '100%' : (isSm ? '310px' : '380px'),
    width: isInline ? '100%' : '94%',
    padding: isSm ? '18px 22px' : '32px',
    gap: isSm ? '16px' : '24px',
    borderRadius: isSm ? '24px' : '32px',
    transform: `translate(${pos.x}px, ${pos.y}px)`,
    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
    paddingTop: hidePreview ? (isSm ? '4px' : '8px') : undefined,
    border: isSm ? '1px solid rgba(255, 255, 255, 0.15)' : keyboardContainerStyle.border,
    height: fullHeight ? '100%' : 'auto',
    justifyContent: (fullHeight && !isInline) ? 'center' : 'flex-start',
    margin: isInline ? 0 : undefined,
    position: isInline ? 'relative' : 'fixed', // Override fixed if inline
    cursor: isDragging ? 'grabbing' : 'grab'
  }

  const content = (
    <div
      ref={numpadRef}
      style={customContainerStyle}
      onClick={e => e.stopPropagation()}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
    >

      {/* — Input Preview Bar — */}
      {!hidePreview && (
        <div
          style={{ 
            ...previewBarStyle, 
            height: isSm ? '60px' : '74px',
            borderRadius: isSm ? '16px' : '20px',
            padding: isSm ? '0 16px' : '0 24px',
            cursor: isDragging ? 'grabbing' : 'grab' 
          }}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          <div style={{ ...previewLabel, top: isSm ? '4px' : '6px', left: isSm ? '16px' : '24px', fontSize: isSm ? '9px' : '10px' }}>{title.toUpperCase()}</div>
          
          {/* Drag Handle Indicator */}
          <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '3px', opacity: 0.3 }}>
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#fff' }} />
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#fff' }} />
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#fff' }} />
          </div>

          <div style={previewValueBox}>
            {showCurrency && <span style={{ ...currencyPrefix, fontSize: isSm ? '16px' : '18px' }}>{currencySym}</span>}
            <span style={{ ...previewText, fontSize: isSm ? '24px' : '30px' }}>{val || (showCurrency ? '0.00' : '')}</span>
            <span style={{ ...cursorStyle, height: isSm ? '22px' : '28px' }} />
          </div>
          <button onClick={onClose} style={{ ...closeBtnStyle, width: isSm ? '36px' : '40px', height: isSm ? '36px' : '40px', borderRadius: isSm ? '12px' : '14px' }}><X size={isSm ? 16 : 18} /></button>
        </div>
      )}

      {/* — Tactical Key Grid — */}
      <div style={{ ...keysWrapper, gap: isSm ? '24px' : '32px' }}>
        <div style={{ ...rowStyle, gap: isSm ? '18px' : '24px' }}>
          {['1', '2', '3'].map(k => <PadButton key={k} label={k} onClick={() => handleKey(k)} isPressed={pressedKey === k} isSm={isSm} />)}
        </div>
        <div style={{ ...rowStyle, gap: isSm ? '18px' : '24px' }}>
          {['4', '5', '6'].map(k => <PadButton key={k} label={k} onClick={() => handleKey(k)} isPressed={pressedKey === k} isSm={isSm} />)}
        </div>
        <div style={{ ...rowStyle, gap: isSm ? '18px' : '24px' }}>
          {['7', '8', '9'].map(k => <PadButton key={k} label={k} onClick={() => handleKey(k)} isPressed={pressedKey === k} isSm={isSm} />)}
        </div>
        <div style={{ ...rowStyle, gap: isSm ? '18px' : '24px' }}>
          <PadButton label="C" onClick={() => handleKey('C')} isPressed={pressedKey === 'C'} type="functional" isSm={isSm} />
          <PadButton label="0" onClick={() => handleKey('0')} isPressed={pressedKey === '0'} isSm={isSm} />
          <PadButton label="⌫" onClick={() => handleKey('⌫')} isPressed={pressedKey === '⌫'} type="functional" isSm={isSm} />
        </div>

        {/* — Bottom Row (DONE Button) — */}
        <div style={{ ...rowStyle, gap: isSm ? '18px' : '24px', marginTop: 'auto', paddingBottom: '4px' }}>
          {isDecimal && (
            <button
              onClick={() => handleKey('.')}
              style={{ ...dotButtonStyle, width: isSm ? '60px' : '68px', height: isSm ? '60px' : '68px', fontSize: isSm ? '20px' : '22px' }}
            >.</button>
          )}
          <button
            onClick={() => onSave(val)}
            style={{ 
              ...saveBtnStyle, 
              width: isDecimal ? (isSm ? '120px' : '160px') : '100%',
              height: isSm ? '60px' : '68px',
              borderRadius: isSm ? '30px' : '34px',
              fontSize: isSm ? '13px' : '16px'
            }}
          >
            <span style={{ marginRight: 6 }}>{saveLabel.toUpperCase()}</span>
            <CornerDownLeft size={isSm ? 16 : 20} />
          </button>
        </div>
      </div>

      {/* — Footer Simplified — */}
      <div style={{ height: '4px' }} />
    </div>
  )

  if (isInline) {
    return (
      <>
        {content}
        <style dangerouslySetInnerHTML={{ __html: animations }} />
      </>
    )
  }

  return (
    <div style={customOverlayStyle}>
      {content}
      <style dangerouslySetInnerHTML={{ __html: animations }} />
    </div>
  )
}

const PadButton = ({ label, onClick, isPressed, type, isSm }) => {
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
          width: isSm ? '60px' : '68px',
          height: isSm ? '60px' : '68px',
          fontSize: isSm ? '18px' : '22px',
          ...(isSpecial ? functionalKeyStyles : {}),
          ...(active ? keyPressStyle : {}),
          ...(isPressed ? keyFlashStyle : {}),
        }}
      >
        {isIcon ? <Delete size={isSm ? 24 : 28} /> : label}
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
  alignItems: 'center', // Center vertically by default
  justifyContent: 'center',
  paddingTop: '4vh',
  paddingBottom: '4vh',
  pointerEvents: 'none',
  background: 'rgba(15, 23, 42, 0.4)', // Darker overlay for better focus
  backdropFilter: 'blur(4px)',
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
  gap: '12px',
  marginTop: '4px',
  flex: 1
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
  background: 'rgba(255, 255, 255, 0.12)',
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

