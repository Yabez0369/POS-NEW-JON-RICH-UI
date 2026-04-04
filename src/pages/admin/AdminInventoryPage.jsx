import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Badge, Btn, Select, Modal } from '@/components/ui'
import { fmt } from '@/lib/utils'
import { Package, Search, AlertCircle, CheckCircle, ArrowRight, TrendingDown, LayoutGrid, List, Edit2, Camera, X } from 'lucide-react'
import { BarcodeScanner, ImgWithFallback } from '@/components/shared'
import { PRODUCT_IMAGES } from '@/lib/seed-data'

export const AdminInventoryPage = ({ products = [], settings, t }) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [viewMode, setViewMode] = useState('list') // list, grid
  const [showScanner, setShowScanner] = useState(false)
  
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: t.text, margin: 0 }}>Inventory Hub</h1>
          <p style={{ fontSize: 13, color: t.text3, marginTop: 4 }}>Track stock levels, manage alerts, and optimize inventory.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn t={t} variant="outline" style={{ borderRadius: 10, display: 'flex', gap: 8, alignItems: 'center' }} onClick={() => setShowScanner(true)}>
             <Camera size={16} /> Scan Barcode
          </Btn>
          <Btn t={t} style={{ borderRadius: 10, background: t.accent, color: '#fff' }} onClick={() => navigate('/app/products')}>
            + Add/Edit Products
          </Btn>
        </div>
      </div>

      {/* Stock Health Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <Card t={t} style={{ borderLeft: `6px solid ${t.red}`, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${t.red}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle color={t.red} size={20} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{stockStats.out}</div>
            <div style={{ fontSize: 11, color: t.text4, fontWeight: 800 }}>OUT OF STOCK</div>
          </div>
        </Card>
        <Card t={t} style={{ borderLeft: `6px solid ${t.yellow}`, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${t.yellow}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown color={t.yellow} size={20} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{stockStats.low}</div>
            <div style={{ fontSize: 11, color: t.text4, fontWeight: 800 }}>LOW STOCK RISK</div>
          </div>
        </Card>
        <Card t={t} style={{ borderLeft: `6px solid ${t.green}`, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${t.green}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle color={t.green} size={20} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{stockStats.total - stockStats.low - stockStats.out}</div>
            <div style={{ fontSize: 11, color: t.text4, fontWeight: 800 }}>HEALTHY STOCK</div>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <Card t={t} style={{ padding: '16px 20px', borderRadius: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.text4 }} />
          <input 
            type="text" 
            placeholder="Search Products or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 12px 10px 40px', 
              borderRadius: 12, 
              border: `1px solid ${t.border}`, 
              background: t.bg, 
              color: t.text,
              fontSize: 13,
              outline: 'none'
            }}
          />
        </div>
        
        <Select 
          t={t} 
          label="" 
          value={filterCategory} 
          onChange={setFilterCategory} 
          options={categories.map(c => ({ label: c === 'all' ? 'All Categories' : c, value: c }))} 
          style={{ width: 160 }}
        />

        <div style={{ display: 'flex', background: t.bg3, padding: 4, borderRadius: 10, gap: 4 }}>
           <Btn t={t} variant="ghost" onClick={() => setViewMode('list')} style={{ padding: 6, borderRadius: 8, background: viewMode === 'list' ? t.bg : 'transparent', color: viewMode === 'list' ? t.accent : t.text4 }}>
             <List size={16} />
           </Btn>
           <Btn t={t} variant="ghost" onClick={() => setViewMode('grid')} style={{ padding: 6, borderRadius: 8, background: viewMode === 'grid' ? t.bg : 'transparent', color: viewMode === 'grid' ? t.accent : t.text4 }}>
             <LayoutGrid size={16} />
           </Btn>
        </div>
      </Card>

      {/* Products List/Grid */}
      {viewMode === 'list' ? (
        <Card t={t} style={{ padding: 0, overflow: 'hidden', borderRadius: 20 }}>
          <Table 
            t={t}
            cols={['Product', 'SKU', 'Category', 'Price', 'Stock Level', 'Status', 'Action']}
            rows={filteredProducts.map(p => [
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, overflow: 'hidden', background: t.bg3, flexShrink: 0, border: `1px solid ${t.border}` }}>
                  <ImgWithFallback src={p.image || PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 13, color: t.text }}>{p.name}</span>
              </div>,
              <span style={{ fontSize: 12, color: t.text4, fontWeight: 700 }}>{p.sku}</span>,
              <Badge t={t} text={p.category} color="blue" />,
              <span style={{ fontWeight: 800 }}>{fmt(p.price, settings?.sym || '£')}</span>,
              <div style={{ width: 120 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: t.text3 }}>{p.stock} units</span>
                </div>
                <div style={{ height: 6, background: t.bg4, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(p.stock, 100)}%`, background: getStockColor(p.stock), borderRadius: 3 }} />
                </div>
              </div>,
              <Badge t={t} text={getStockLabel(p.stock)} color={p.stock <= 0 ? 'red' : p.stock < 10 ? 'yellow' : 'green'} />,
              <Btn t={t} variant="ghost" style={{ padding: 6, color: t.accent }} onClick={() => navigate('/app/products')}>
                <Edit2 size={14} />
              </Btn>
            ])}
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {filteredProducts.map(p => (
            <Card key={p.id} t={t} style={{ borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden', padding: 0 }}>
              <div style={{ height: 140, width: '100%', background: t.bg3, borderBottom: `1px solid ${t.border}` }}>
                <ImgWithFallback src={p.image || PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '0 16px 16px' }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: t.text4 }}>{p.category}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: 11, color: t.text4, fontWeight: 700 }}>STOCK</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: getStockColor(p.stock) }}>{p.stock}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{fmt(p.price, settings?.sym || '£')}</div>
                </div>
              </div>
            </Card>
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
    </div>
  )
}
