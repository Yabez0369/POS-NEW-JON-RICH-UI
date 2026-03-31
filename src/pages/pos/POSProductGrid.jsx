import { ImgWithFallback } from '@/components/shared'
import { fmt } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

export function POSProductGrid({
  search, setSearch, filteredProds,
  getItemDiscount, addToCart, scanMsg,
  loadedOrderForReturn,
  returnProcessMode,
  settings, t,
}) {
  const navigate = useNavigate()
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: t.bg || '#F5F5F7', borderRight: 'none' }} className="pos-left">
      <div style={{ padding: '16px 20px', background: t.card || '#FFFFFF', borderBottom: `1px solid ${t.border}`, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        {loadedOrderForReturn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 200, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: t.yellow, background: t.yellowBg, padding: '6px 10px', borderRadius: 8, border: `1px solid ${t.yellowBorder}` }}>
              {returnProcessMode === 'exchange' ? '↔ Exchange: Add replacement items below' : `↩️ Return: ${loadedOrderForReturn.order_number || loadedOrderForReturn.id}`}
            </span>
          </div>
        ) : (
          <div style={{ flex: 1 }} />
        )}
      </div>

      {search.trim() === '' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: t.bg || '#F5F5F7', padding: 40, textAlign: 'center' }}>
          <style>{`
            @keyframes breathe {
              0% { opacity: 0.3; transform: scale(0.95); }
              50% { opacity: 1; transform: scale(1.05); }
              100% { opacity: 0.3; transform: scale(0.95); }
            }
          `}</style>
          <div style={{ width: 140, height: 140, marginBottom: 40, position: 'relative', animation: 'breathe 2.5s infinite ease-in-out' }}>
            {/* Top Left Corner */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 36, height: 36, borderTop: '5px solid #007AFF', borderLeft: '5px solid #007AFF', borderRadius: '16px 0 0 0' }} />
            {/* Top Right Corner */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 36, height: 36, borderTop: '5px solid #007AFF', borderRight: '5px solid #007AFF', borderRadius: '0 16px 0 0' }} />
            {/* Bottom Left Corner */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 36, height: 36, borderBottom: '5px solid #007AFF', borderLeft: '5px solid #007AFF', borderRadius: '0 0 0 16px' }} />
            {/* Bottom Right Corner */}
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderBottom: '5px solid #007AFF', borderRight: '5px solid #007AFF', borderRadius: '0 0 16px 0' }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: t.text, marginBottom: 12, letterSpacing: -0.5 }}>Ready to Scan</div>
          <div style={{ fontSize: 16, color: t.text3, fontWeight: 500, maxWidth: 400, lineHeight: 1.6 }}>Point scanner at a barcode, or manually type a product name into the search bar above.</div>
        </div>
      ) : (
        <div className="pos-products-grid" style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, alignContent: 'start', background: t.bg || '#F5F5F7' }}>
          {filteredProds.map(p => {
            const disc = getItemDiscount(p)
            return (
              <div key={p.id} onClick={() => addToCart(p)} style={{ background: '#FFFFFF', border: 'none', borderRadius: 20, overflow: 'hidden', cursor: p.stock === 0 ? 'not-allowed' : 'pointer', opacity: p.stock === 0 ? 0.45 : 1, transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)', boxShadow: '0 4px 12px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 200 }}
                onMouseEnter={e => { if (p.stock > 0) { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)'; }}>
                {disc > 0 && <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1, background: '#FF3B30', color: '#fff', borderRadius: 10, padding: '4px 8px', fontSize: 11, fontWeight: 900, boxShadow: '0 2px 8px rgba(255,59,48,0.3)' }}>-{disc}% OFF</div>}
                <div style={{ height: 130, background: '#FAFAFA', borderBottom: '1px solid #F0F0F0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 12 }}>
                  <ImgWithFallback src={p.image_url || p.image} alt={p.name} emoji={p.emoji} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>{p.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                    <div>
                      {disc > 0 ? <><div style={{ fontSize: 12, color: t.text4, textDecoration: 'line-through' }}>{fmt(p.price, settings?.sym)}</div><div style={{ fontSize: 18, fontWeight: 900, color: '#34C759', letterSpacing: -0.5 }}>{fmt(p.price * (1 - disc / 100), settings?.sym)}</div></> : <div style={{ fontSize: 18, fontWeight: 900, color: t.text, letterSpacing: -0.5 }}>{fmt(p.price, settings?.sym)}</div>}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: p.stock <= 5 ? '#FF3B30' : t.text4, background: p.stock <= 5 ? '#FF3B3015' : t.bg3, padding: '4px 8px', borderRadius: 8 }}>{p.stock} left</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
