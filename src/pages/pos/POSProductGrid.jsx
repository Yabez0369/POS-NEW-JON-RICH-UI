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
  const [showMenu, setShowMenu] = useState(false)

  // Use all products when search is empty, filtered when searching
  const displayProds = filteredProds

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

      {/* ─── SEARCH BAR (top, below header) ─── */}
      <div style={{
        padding: '12px 20px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E9EF',
        flexShrink: 0,
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 18, top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 18, color: '#9CA3AF', pointerEvents: 'none',
          }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search product name or SKU..."
            autoFocus
            style={{
              width: '100%',
              background: '#F2F3F8',
              border: '2px solid transparent',
              borderRadius: 14,
              padding: '16px 44px 16px 48px',
              color: '#1A1A2E',
              fontSize: 17,
              fontWeight: 600,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#6366F1'}
            onBlur={e => e.target.style.borderColor = 'transparent'}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: '#9CA3AF', color: '#fff', border: 'none',
                borderRadius: '50%', width: 26, height: 26, cursor: 'pointer',
                fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Parked bills dropdown */}
      {showParkedDropdown && parked.length > 0 && (
        <>
          <div onClick={() => setShowParkedDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }} />
          <div style={{ position: 'absolute', top: 62, right: 20, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: 10, zIndex: 40, minWidth: 260, boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>
            {parked.map(pb => (
              <button
                key={pb.id}
                onClick={() => { recallBill(pb); setShowParkedDropdown(false) }}
                style={{ display: 'block', width: '100%', padding: '12px 14px', background: 'none', border: 'none', color: '#111827', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 700, borderRadius: 10, marginBottom: 4 }}
              >
                📋 {pb.id} — {pb.cart.length} items · {pb.ts}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ─── PRODUCT GRID (always visible) ─── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 14,
        alignContent: 'start',
      }} className="pos-products-grid">
        {displayProds.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px', color: '#9CA3AF' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>No products found</div>
          </div>
        ) : displayProds.map(p => {
          const disc = getItemDiscount(p)
          const isOOS = p.stock === 0
          return (
            <div
              key={p.id}
              onClick={() => !isOOS && addToCart(p)}
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                overflow: 'hidden',
                cursor: isOOS ? 'not-allowed' : 'pointer',
                opacity: isOOS ? 0.45 : 1,
                transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                border: '2px solid transparent',
                minHeight: 210,
              }}
              onMouseEnter={e => {
                if (!isOOS) {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.1)'
                  e.currentTarget.style.borderColor = '#6366F1'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              {/* Discount badge */}
              {disc > 0 && (
                <div style={{
                  position: 'absolute', top: 10, left: 10, zIndex: 1,
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  color: '#fff', borderRadius: 8, padding: '3px 8px',
                  fontSize: 11, fontWeight: 900,
                  boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                }}>
                  -{disc}%
                </div>
              )}

              {/* Out of stock badge */}
              {isOOS && (
                <div style={{
                  position: 'absolute', top: 10, right: 10, zIndex: 1,
                  background: '#374151', color: '#fff', borderRadius: 8,
                  padding: '3px 8px', fontSize: 10, fontWeight: 800,
                }}>
                  OUT
                </div>
              )}

              {/* Product image */}
              <div style={{
                height: 130,
                background: 'linear-gradient(135deg, #F8FAFF, #F0F2FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', padding: 12, flexShrink: 0,
              }}>
                <ImgWithFallback
                  src={p.image_url || p.image}
                  alt={p.name}
                  emoji={p.emoji}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              {/* Product info */}
              <div style={{
                padding: '12px 14px 14px',
                flex: 1, display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: '#1A1A2E', lineHeight: 1.3,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {p.name}
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    {disc > 0 ? (
                      <>
                        <div style={{ fontSize: 11, color: '#9CA3AF', textDecoration: 'line-through' }}>{fmt(p.price, settings?.sym)}</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#16A34A', letterSpacing: -0.5 }}>{fmt(p.price * (1 - disc / 100), settings?.sym)}</div>
                      </>
                    ) : (
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#1A1A2E', letterSpacing: -0.5 }}>{fmt(p.price, settings?.sym)}</div>
                    )}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700,
                    color: p.stock <= 5 ? '#DC2626' : '#6B7280',
                    background: p.stock <= 5 ? '#FEF2F2' : '#F3F4F6',
                    padding: '3px 8px', borderRadius: 8,
                  }}>
                    {p.stock}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>


      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }

        /* Match POSFlow grid: 3 per row (responsive fallback) */
        @media (max-width: 1100px) {
          .pos-products-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 640px) {
          .pos-products-grid { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
        }
      `}</style>
    </div>
  )
}
