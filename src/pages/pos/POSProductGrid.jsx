import { useState } from 'react'
import { ImgWithFallback } from '@/components/shared'
import { fmt } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

export function POSProductGrid({
  search, setSearch, cat, setCat, filteredProds, favProds,
  getItemDiscount, addToCart, scanMsg,
  parkBill, parked, recallBill, showParkedDropdown, setShowParkedDropdown,
  setShowBarcodeInput, setShowReprint, setShowReturnModal,
  loadOrderInput, setLoadOrderInput, loadOrderForReturn, loadOrderLoading, loadedOrderForReturn,
  returnProcessMode,
  settings, t,
}) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  // Use all products when search is empty, filtered when searching
  const displayProds = filteredProds

  return (
    <div style={{
      flex: '0 0 60%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: '#F2F3F8',
      position: 'relative',
    }} className="pos-left">

      {/* ─── TOP BAR: Home + More ─── */}
      <div style={{
        padding: '14px 20px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E9EF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        flexShrink: 0,
      }}>
        {/* Home button */}
        <button
          onClick={() => navigate('/app')}
          style={{
            padding: '10px 20px',
            background: '#F2F3F8',
            border: 'none',
            borderRadius: 12,
            color: '#1A1A2E',
            fontSize: 15,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'background 0.15s',
          }}
        >
          🏠 <span>Home</span>
        </button>

        {/* Scan feedback pill (center) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {scanMsg && (
            <div style={{
              padding: '10px 24px',
              borderRadius: 100,
              background: scanMsg.includes('❌') ? '#FEE2E2' : '#DCFCE7',
              color: scanMsg.includes('❌') ? '#B91C1C' : '#15803D',
              fontSize: 15,
              fontWeight: 800,
              animation: 'fadeIn 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              {scanMsg}
            </div>
          )}
          {loadedOrderForReturn && !scanMsg && (
            <div style={{
              padding: '10px 24px',
              borderRadius: 100,
              background: '#FEF9C3',
              color: '#92400E',
              fontSize: 14,
              fontWeight: 800,
            }}>
              {returnProcessMode === 'exchange'
                ? '↔ Exchange Mode — Add replacement items'
                : `↩️ Return: ${loadedOrderForReturn.order_number || loadedOrderForReturn.id}`}
            </div>
          )}
        </div>

        {/* ⋯ More menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(v => !v)}
            style={{
              padding: '10px 20px',
              background: showMenu ? '#1A1A2E' : '#F2F3F8',
              border: 'none',
              borderRadius: 12,
              color: showMenu ? '#FFFFFF' : '#6B7280',
              fontSize: 20,
              fontWeight: 900,
              cursor: 'pointer',
              letterSpacing: 2,
              transition: 'all 0.15s',
              lineHeight: 1,
            }}
          >
            ···
          </button>

          {showMenu && (
            <>
              {/* Backdrop */}
              <div
                onClick={() => setShowMenu(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
              />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                background: '#FFFFFF',
                borderRadius: 20,
                padding: '10px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                minWidth: 240,
                zIndex: 50,
                border: '1px solid #F0F0F0',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#9CA3AF', padding: '4px 12px', textTransform: 'uppercase', letterSpacing: 1 }}>Actions</div>
                <button
                  onClick={() => { parkBill(); setShowMenu(false) }}
                  style={{ width: '100%', padding: '14px 16px', textAlign: 'left', background: '#F9FAFB', border: 'none', fontSize: 15, fontWeight: 700, borderRadius: 12, cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  ⏸ Park Sale
                </button>
                {parked.length > 0 && (
                  <button
                    onClick={() => { setShowParkedDropdown(true); setShowMenu(false) }}
                    style={{ width: '100%', padding: '14px 16px', textAlign: 'left', background: '#EEF2FF', border: 'none', fontSize: 15, fontWeight: 700, borderRadius: 12, cursor: 'pointer', color: '#4338CA', display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    📋 Recall Sale ({parked.length})
                  </button>
                )}
                {setShowReprint && (
                  <button
                    onClick={() => { setShowReprint(true); setShowMenu(false) }}
                    style={{ width: '100%', padding: '14px 16px', textAlign: 'left', background: '#F9FAFB', border: 'none', fontSize: 15, fontWeight: 700, borderRadius: 12, cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    🖨️ Reprint Receipt
                  </button>
                )}
              </div>
            </>
          )}
        </div>
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
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
      `}</style>
    </div>
  )
}
