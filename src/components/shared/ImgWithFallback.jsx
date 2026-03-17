import { useState } from 'react'

export function ImgWithFallback({ src, alt, emoji, style }) {
  const [err, setErr] = useState(false)
  const h = typeof style?.height === 'number' ? style.height : parseInt(style?.height)
  const fontSize = !isNaN(h) ? Math.min(48, Math.round(h * 0.55)) : 32
  if (err || !src) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, background: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)', flexShrink: 0 }}>
        {emoji}
      </div>
    )
  }
  return <img src={src} alt={alt} referrerPolicy="no-referrer" onError={() => setErr(true)} style={style} />
}
