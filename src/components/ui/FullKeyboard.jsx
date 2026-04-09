import { useState, useEffect, useRef } from 'react'
import { X, Space, CornerDownLeft, Delete } from 'lucide-react'

/* ═══════════════════════════════════════════════════════ */
/*  PREMIUM POS KEYBOARD — Rapoo Style, Draggable & Compact */
/* ═══════════════════════════════════════════════════════ */

export const FullKeyboard = ({ initialValue = '', onClose, onSave, onChange, t, isInline = false, hidePreview = false, position = 'center' }) => {
  const [val, setVal] = useState(String(initialValue))
  const [layout, setLayout] = useState('ABC') // ABC or 123
  const [pressedKey, setPressedKey] = useState(null)
  
  // Drag State
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const keyboardRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
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
      setPos(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      setDragStart({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleTouchMove = (e) => {
      if (!isDragging) return
      const touch = e.touches[0]
      const dx = touch.clientX - dragStart.x
      const dy = touch.clientY - dragStart.y
      setPos(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      setDragStart({ x: touch.clientX, y: touch.clientY })
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
    }

    const handleClickOutside = (e) => {
      if (isInline) return
      if (keyboardRef.current && !keyboardRef.current.contains(e.target) && !isDragging) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      window.addEventListener("touchmove", handleTouchMove, { passive: false })
      window.addEventListener("touchend", handleTouchEnd)
    }
    document.addEventListener("mousedown", handleClickOutside, true)
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      document.removeEventListener("mousedown", handleClickOutside, true)
    }
  }, [onClose, onSave, val, isDragging, dragStart, isInline])

  const startDrag = (e) => {
    // Only drag from the handle or non-button areas
    if (e.target.closest('button')) return
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY
    setIsDragging(true)
    setDragStart({ x: clientX, y: clientY })
  }

  const handleKey = (key) => {
    let newVal = val
    if (key === '⌫') {
      newVal = val.slice(0, -1)
    } else if (key === 'SPACE') {
      newVal = val + ' '
    } else if (key === '123') {
      setLayout('123'); return
    } else if (key === 'ABC') {
      setLayout('ABC'); return
    } else if (key === 'SEARCH') {
      onSave(val); return
    } else {
      newVal = val + key
    }
    setVal(newVal)
    if (onChange) onChange(newVal)

    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 100)
  }

  const rows = layout === 'ABC' ? [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '⌫'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '.', ',', '?']
  ] : [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
    ['-', '=', '+', '[', ']', '{', '}', ';', ':', '⌫']
  ]

  const finalOverlayStyle = isInline ? inlineOverlayStyle : {
    ...overlayStyle,
    justifyContent: position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center',
    paddingLeft: position === 'left' ? '40px' : '0',
    paddingRight: position === 'right' ? '40px' : '0',
  }

  return (
    <div style={finalOverlayStyle}>
      <div style={{
        animation: 'keyboardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div
          ref={keyboardRef}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          style={{
            ...keyboardContainerStyle,
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            cursor: isDragging ? 'grabbing' : 'grab',
            pointerEvents: 'auto'
          }}
        >
          <div style={dragHandle}>
            <div style={dragHandleBar} />
            <button 
              onMouseDown={(e) => { e.stopPropagation(); }}
              onClick={onClose} 
              style={closeBtnStyle}
            >
              <X size={22} />
            </button>
          </div>

          {!hidePreview && (
            <div style={previewBox}>
              <span style={previewText}>{val || 'Search...'}</span>
              <span style={cursorStyle} />
            </div>
          )}

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

            <div style={rowStyle}>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => handleKey(layout === 'ABC' ? '123' : 'ABC')}
                style={modeBtnStyle}
              >
                {layout === 'ABC' ? '123' : 'ABC'}
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => handleKey('SPACE')}
                style={spaceKeyStyle}
              >
                <Space size={28} />
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => onSave(val)}
                style={searchBtnStyle}
              >
                <span>SEARCH</span>
                <CornerDownLeft size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: animations }} />
    </div>
  )
}

const Key = ({ label, onClick, isPressed, type }) => {
  const isIcon = label === '⌫'
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      style={{
        ...keyStyle,
        ...(isPressed ? keyPressStyle : {}),
        ...(type === 'functional' ? functionalKeyStyle : {}),
      }}
    >
      {isIcon ? <Delete size={24} /> : label}
    </button>
  )
}

/* ── Styles ── */

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none'
}

const inlineOverlayStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto'
}

const keyboardContainerStyle = {
  pointerEvents: 'auto',
  width: '690px',
  background: '#14161C',
  borderRadius: '28px',
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.08)',
  border: 'none',
  userSelect: 'none'
}

const dragHandle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  padding: '4px 0 8px'
}

const dragHandleBar = {
  width: '60px',
  height: '5px',
  background: 'rgba(255,255,255,0.2)',
  borderRadius: '3px'
}

const closeBtnStyle = {
  position: 'absolute',
  right: '0',
  top: '0',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.08)',
  border: 'none',
  color: 'rgba(255,255,255,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
}

const previewBox = {
  background: 'rgba(0,0,0,0.2)',
  borderRadius: '12px',
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid rgba(255,255,255,0.05)',
  marginBottom: '4px'
}

const previewText = {
  color: '#fff',
  fontSize: '20px',
  fontWeight: '600',
  flex: 1
}

const cursorStyle = {
  width: '2px',
  height: '22px',
  background: '#4f46e5',
  animation: 'blink 1s step-end infinite'
}

const keysWrapper = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
}

const rowStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center'
}

const keyStyle = {
  width: '58px',
  height: '58px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.05)',
  color: '#fff',
  fontSize: '18px',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.1s',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
}

const keyPressStyle = {
  transform: 'scale(0.9)',
  background: 'rgba(255,255,255,0.2)',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
}

const functionalKeyStyle = {
  background: 'rgba(255,255,255,0.12)',
  color: 'rgba(255,255,255,0.8)'
}

const modeBtnStyle = {
  ...keyStyle,
  width: '80px',
  borderRadius: '20px',
  fontSize: '15px'
}

const spaceKeyStyle = {
  ...keyStyle,
  flex: 1,
  maxWidth: '300px',
  borderRadius: '20px'
}

const searchBtnStyle = {
  ...keyStyle,
  flex: 1,
  maxWidth: '180px',
  borderRadius: '20px',
  background: '#4f46e5',
  border: 'none',
  fontSize: '16px',
  gap: '8px'
}

const animations = `
  @keyframes blink {
    from, to { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes keyboardSlideIn {
    from { opacity: 0; transform: translateY(30px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`
