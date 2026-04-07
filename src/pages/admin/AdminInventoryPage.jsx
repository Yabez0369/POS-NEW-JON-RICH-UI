import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Badge, Btn, Select, Modal, Input } from '@/components/ui'
import { fmt } from '@/lib/utils'
import { Package, Search, AlertCircle, CheckCircle, ArrowRight, TrendingDown, LayoutGrid, List, Edit2, Camera, X, Trash2 } from 'lucide-react'
import { BarcodeScanner, ImgWithFallback } from '@/components/shared'
import { PRODUCT_IMAGES } from '@/lib/seed-data'

export const AdminInventoryPage = ({ products = [], settings, t }) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [viewMode, setViewMode] = useState('list') // list, grid
  const [showScanner, setShowScanner] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const handleEditProduct = (product = null) => {
    setEditingProduct(product)
    setShowProductModal(true)
  }

  const handleDeleteProduct = (product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      // In a real app, this would call an API/Supabase
      console.log('Deleting product:', product.id)
    }
  }
  
  // Hardware/USB Scanner Support
  const barcodeBuffer = useRef('')
  const lastKeyTime = useRef(0)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
      const now = Date.now()
      if (now - lastKeyTime.current > 80) barcodeBuffer.current = ''
      lastKeyTime.current = now

      if (e.key === 'Enter' && barcodeBuffer.current.length > 2) {
        setSearchTerm(barcodeBuffer.current)
        barcodeBuffer.current = ''
        return
      }
      if (e.key.length === 1) barcodeBuffer.current += e.key
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return ['all', ...Array.from(cats)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchCat = filterCategory === 'all' || p.category === filterCategory
      return matchSearch && matchCat
    })
  }, [products, searchTerm, filterCategory])

  const stockStats = useMemo(() => {
    const low = products.filter(p => (p.stock || 0) < 10).length
    const out = products.filter(p => (p.stock || 0) === 0).length
    const total = products.length
    return { low, out, total }
  }, [products])

  const getStockColor = (stock) => {
    if (stock <= 0) return t.red
    if (stock < 10) return t.yellow
    return t.green
  }

  const getStockLabel = (stock) => {
    if (stock <= 0) return 'OUT OF STOCK'
    if (stock < 10) return 'LOW STOCK'
    return 'HEALTHY'
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 32,
      background: '#f8fafc',
      margin: '-24px',
      padding: '32px',
      minHeight: 'calc(100vh - 64px)',
      animation: 'fadeIn 0.5s ease-out' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Inventory Hub</h1>
          <p style={{ fontSize: 16, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Track stock levels, manage alerts, and optimize inventory.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Btn t={t} variant="outline" style={{ borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 800, display: 'flex', gap: 8, alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', color: '#475569' }} onClick={() => setShowScanner(true)}>
             <Camera size={18} /> Scan Barcode
          </Btn>
          <Btn t={t} style={{ borderRadius: 12, padding: '10px 24px', fontSize: 14, fontWeight: 900, background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: '#fff', boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)', border: 'none' }} onClick={() => handleEditProduct(null)}>
            + Add/Edit Products
          </Btn>
        </div>
      </div>

      {/* Stock Health Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: '#ef4444' }} />
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
            <AlertCircle size={28} />
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{stockStats.out}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>OUT OF STOCK</div>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: '#f59e0b' }} />
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <TrendingDown size={28} />
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{stockStats.low}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>LOW STOCK RISK</div>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: '#22c55e' }} />
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{stockStats.total - stockStats.low - stockStats.out}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>HEALTHY STOCK</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search Products or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '14px 16px 14px 48px', 
              borderRadius: 16, 
              border: '1px solid #e2e8f0', 
              background: '#f8fafc', 
              color: '#0f172a',
              fontSize: 14,
              fontWeight: 600,
              outline: 'none',
              transition: 'all 0.2s'
            }}
          />
        </div>
        
        <Select 
          t={t} 
          label="" 
          value={filterCategory} 
          onChange={setFilterCategory} 
          options={categories.map(c => ({ label: c === 'all' ? 'All Categories' : c, value: c }))} 
          style={{ width: 180, height: 48 }}
        />

        <div style={{ display: 'flex', background: '#f1f5f9', padding: 6, borderRadius: 14, gap: 6 }}>
           <Btn t={t} variant="ghost" onClick={() => setViewMode('list')} style={{ width: 40, height: 40, padding: 0, borderRadius: 10, background: viewMode === 'list' ? '#fff' : 'transparent', color: viewMode === 'list' ? '#4f46e5' : '#64748b', boxShadow: viewMode === 'list' ? '0 4px 10px rgba(0,0,0,0.08)' : 'none' }}>
             <List size={20} />
           </Btn>
           <Btn t={t} variant="ghost" onClick={() => setViewMode('grid')} style={{ width: 40, height: 40, padding: 0, borderRadius: 10, background: viewMode === 'grid' ? '#fff' : 'transparent', color: viewMode === 'grid' ? '#4f46e5' : '#64748b', boxShadow: viewMode === 'grid' ? '0 4px 10px rgba(0,0,0,0.08)' : 'none' }}>
             <LayoutGrid size={20} />
           </Btn>
        </div>
      </div>

      {/* Products List/Grid */}
      {viewMode === 'list' ? (
        <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <Table 
            t={t}
            cols={['Product', 'SKU', 'Category', 'Price', 'Stock Level', 'Status', 'Action']}
            rows={filteredProducts.map(p => [
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', background: '#f8fafc', flexShrink: 0, border: '1px solid #e2e8f0' }}>
                  <ImgWithFallback src={p.image || PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{p.name}</span>
              </div>,
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>{p.sku}</span>,
              <Badge t={t} text={p.category?.toUpperCase()} color="blue" style={{ borderRadius: 8, fontWeight: 800, fontSize: 11 }} />,
              <span style={{ fontWeight: 900, color: '#0f172a', fontSize: 15 }}>{fmt(p.price, settings?.sym || '£')}</span>,
              <div style={{ width: 140 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, fontWeight: 700, color: '#475569' }}>
                  <span>{p.stock} units</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((p.stock / 200) * 100, 100)}%`, background: getStockColor(p.stock), borderRadius: 4 }} />
                </div>
              </div>,
              <Badge t={t} text={getStockLabel(p.stock)} color={p.stock <= 0 ? 'red' : p.stock < 10 ? 'yellow' : 'green'} style={{ fontWeight: 900, borderRadius: 8 }} />,
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn t={t} variant="ghost" style={{ width: 36, height: 36, padding: 0, color: '#4f46e5', background: '#eef2ff', borderRadius: 8 }} onClick={() => handleEditProduct(p)}>
                  <Edit2 size={16} />
                </Btn>
                <Btn t={t} variant="ghost" style={{ width: 36, height: 36, padding: 0, color: '#ef4444', background: '#fef2f2', borderRadius: 8 }} onClick={() => handleDeleteProduct(p)}>
                  <Trash2 size={16} />
                </Btn>
              </div>
            ])}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
          {filteredProducts.map(p => (
            <div key={p.id} style={{ background: '#fff', borderRadius: 28, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', overflow: 'hidden' }}>
              <div style={{ height: 180, width: '100%', background: '#f8fafc', position: 'relative' }}>
                <ImgWithFallback src={p.image || PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <Badge t={t} text={getStockLabel(p.stock)} color={p.stock <= 0 ? 'red' : p.stock < 10 ? 'yellow' : 'green'} style={{ fontWeight: 900, borderRadius: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 900, fontSize: 16, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{p.category}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>STOCK LEVEL</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: getStockColor(p.stock), marginTop: 2 }}>{p.stock} <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>units</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{fmt(p.price, settings?.sym || '£')}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <Btn t={t} variant="ghost" style={{ width: 32, height: 32, padding: 0, color: '#4f46e5', background: '#eef2ff', borderRadius: 8 }} onClick={() => handleEditProduct(p)}>
                        <Edit2 size={14} />
                      </Btn>
                      <Btn t={t} variant="ghost" style={{ width: 32, height: 32, padding: 0, color: '#ef4444', background: '#fef2f2', borderRadius: 8 }} onClick={() => handleDeleteProduct(p)}>
                        <Trash2 size={14} />
                      </Btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Barcode Scanner Modal */}
      {showScanner && (
        <Modal t={t} title="Hardware/Camera Scanner" onClose={() => setShowScanner(false)}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 13, color: t.text3, margin: 0 }}>Position a product barcode in the frame or use your USB handheld scanner.</p>
              <BarcodeScanner 
                t={t} 
                active={showScanner} 
                onDetected={(code) => {
                  setSearchTerm(code)
                  setShowScanner(false)
                }} 
              />
              <Btn t={t} variant="ghost" style={{ width: '100%', color: t.red }} onClick={() => setShowScanner(false)}>
                 <X size={16} /> Cancel Scanning
              </Btn>
           </div>
        </Modal>
      )}

      {/* Product Add/Edit Modal */}
      {showProductModal && (
        <Modal t={t} title={editingProduct ? "Edit Product" : "Add New Product"} onClose={() => setShowProductModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input t={t} label="Product Name" defaultValue={editingProduct?.name || ''} placeholder="e.g. Premium Scarf" />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input t={t} label="SKU" defaultValue={editingProduct?.sku || ''} placeholder="e.g. SC-002" />
              <Input t={t} label="Category" defaultValue={editingProduct?.category || ''} placeholder="e.g. Apparel" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input t={t} type="number" label="Price" defaultValue={editingProduct?.price || ''} placeholder="0.00" />
              <Input t={t} type="number" label="Stock Level" defaultValue={editingProduct?.stock || 0} placeholder="0" />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Btn t={t} variant="outline" style={{ flex: 1 }} onClick={() => setShowProductModal(false)}>Cancel</Btn>
              <Btn 
                t={t} 
                style={{ flex: 1, background: t.accent, color: '#fff' }} 
                onClick={() => {
                  // Note: Form values are not bound to state for this demo.
                  setShowProductModal(false)
                }}
              >
                {editingProduct ? "Save Changes" : "Create Product"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
