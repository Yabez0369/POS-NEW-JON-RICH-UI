import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Input, Btn } from '@/components/ui'
import { fmt } from '@/lib/utils'
import { 
  Search, AlertTriangle, Eye, Trash2, Package, Layers, 
  ArrowUpRight, Sparkles, Filter, MoreHorizontal, Edit3 
} from 'lucide-react'
import { ImgWithFallback } from '@/components/shared'
import { PRODUCT_IMAGES } from '@/lib/seed-data'

export const AdminInventoryPage = ({ products = [], settings, t }) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const handleEditProduct = (product = null) => {
    setEditingProduct(product)
    setShowProductModal(true)
  }

  const handleDeleteProduct = (product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      console.log('Deleting product:', product.id)
    }
  }

  const categories = useMemo(() => {
    const cats = new Set((products || []).map(p => p.category).filter(Boolean))
    return ['All', ...Array.from(cats)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return (products || []).filter(p => {
      const matchSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchCat = filterCategory === 'All' || p.category === filterCategory
      return matchSearch && matchCat
    })
  }, [products, searchTerm, filterCategory])

  const stockStats = useMemo(() => {
    const low = (products || []).filter(p => (p.stock || 0) < 10 && (p.stock || 0) > 0).length
    const out = (products || []).filter(p => (p.stock || 0) <= 0).length
    const totalStock = (products || []).reduce((acc, p) => acc + (p.stock || 0), 0)
    const total = (products || []).length
    return { low, out, totalStock, total }
  }, [products])

  return (
    <div className="admin-inventory-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .admin-inventory-root {
          --primary: #6366F1;
          --primary-dark: #4F46E5;
          --bg-main: #F4F7FE;
          --text-deep: #0F172A;
          --text-muted: #64748B;
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(226, 232, 240, 0.8);
          
          background: var(--bg-main);
          min-height: calc(100vh - 64px);
          margin: -24px;
          padding: 32px 40px;
          font-family: 'Outfit', sans-serif;
          color: var(--text-deep);
        }

        /* Header Section */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }
        .header-title-box h1 {
          font-size: 36px;
          font-weight: 900;
          letter-spacing: -0.04em;
          margin: 0;
          color: var(--text-deep);
        }
        .header-breadcrumb {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        /* KPI Bento Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }
        .kpi-card {
          border-radius: 32px;
          padding: 32px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 180px;
          transition: transform 0.3s;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05);
        }
        .kpi-card:hover { transform: translateY(-4px); }

        .kpi-card.primary { background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%); color: white; }
        .kpi-card.warning { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; }
        .kpi-card.success { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; }

        .kpi-label { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8; margin-bottom: 6px; }
        .kpi-value { font-size: 52px; font-weight: 900; letter-spacing: -0.04em; line-height: 1; }
        .kpi-footer { display: flex; align-items: center; gap: 8px; margin-top: 16px; font-size: 14px; font-weight: 700; }
        .kpi-icon-overlay { position: absolute; top: -10px; right: -10px; opacity: 0.1; }

        /* Toolbar */
        .inventory-toolbar {
          background: white;
          border-radius: 24px;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
        }
        .search-box {
          position: relative;
          flex: 1;
        }
        .search-box input {
          width: 100%;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 14px 16px 14px 48px;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          transition: 0.2s;
        }
        .search-box input:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }

        .filter-group { display: flex; gap: 8px; background: #F1F5F9; padding: 6px; border-radius: 16px; overflow-x: auto; }
        .filter-btn {
          border: none;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          background: transparent;
          color: var(--text-muted);
        }
        .filter-btn.active { background: white; color: var(--text-deep); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }

        .add-product-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s;
          box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.3);
        }
        .add-product-btn:hover { transform: translateY(-2px); background: var(--primary-dark); }

        /* Product List */
        .inventory-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .product-ticket {
          background: white;
          border-radius: 24px;
          padding: 20px 32px;
          display: flex;
          align-items: center;
          gap: 32px;
          border: 1px solid var(--glass-border);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .product-ticket:hover {
          transform: scale(1.005);
          border-color: #C7D2FE;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08);
        }
        
        .product-img {
          width: 80px; height: 80px;
          border-radius: 20px;
          background: #F8FAFC;
          padding: 12px;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid #F1F5F9;
        }
        .product-img img { width: 100%; height: 100%; object-fit: contain; }

        .product-info { flex: 1; }
        .product-name { font-size: 18px; font-weight: 800; margin: 0 0 4px 0; color: var(--text-deep); }
        .product-meta { display: flex; align-items: center; gap: 12px; }
        .product-sku { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: var(--text-muted); background: #F1F5F9; padding: 2px 8px; border-radius: 6px; }
        
        .product-category-pill {
          padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 800; background: #EEF2FF; color: var(--primary);
          display: inline-flex; align-items: center; gap: 6px;
        }

        .product-stats {
          display: flex;
          align-items: center;
          gap: 40px;
          margin: 0 40px;
        }
        .stat-col { display: flex; flex-direction: column; align-items: center; min-width: 80px; }
        .stat-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; }
        .stat-value { font-size: 18px; font-weight: 900; color: var(--text-deep); }
        .stat-value.price { color: var(--primary); }
        
        .stock-indicator {
          display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800;
          padding: 6px 16px; border-radius: 12px;
        }
        .stock-indicator.high { background: #DCFCE7; color: #166534; }
        .stock-indicator.low { background: #FEF3C7; color: #92400E; }
        .stock-indicator.out { background: #FEE2E2; color: #991B1B; }

        .action-hub {
          display: flex;
          gap: 12px;
        }
        .action-circular-btn {
          width: 44px; height: 44px; border-radius: 14px; border: 1px solid #E2E8F0;
          display: flex; align-items: center; justify-content: center; background: white;
          color: var(--text-muted); cursor: pointer; transition: 0.2s;
        }
        .action-circular-btn:hover { border-color: var(--primary); color: var(--primary); background: #EEF2FF; }
        .action-circular-btn.delete:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>

      {/* Header */}
      <div className="page-header animate-fade">
        <div className="header-title-box">
          <div className="header-breadcrumb">Catalog Management</div>
          <h1>System Inventory Hub</h1>
        </div>
        <button className="add-product-btn" onClick={() => handleEditProduct(null)}>
          <Plus size={18} strokeWidth={3} /> Add New Asset
        </button>
      </div>

      {/* KPI Section */}
      <div className="kpi-grid">
        <div className="kpi-card primary animate-fade" style={{ animationDelay: '0.1s' }}>
          <Package size={80} className="kpi-icon-overlay" />
          <div>
            <div className="kpi-label">Active Listing</div>
            <div className="kpi-value">{stockStats.total}</div>
          </div>
          <div className="kpi-footer">
            <Sparkles size={16} /> Fully Cataloged Nodes
          </div>
        </div>
        
        <div className="kpi-card success animate-fade" style={{ animationDelay: '0.2s' }}>
          <Layers size={80} className="kpi-icon-overlay" />
          <div>
            <div className="kpi-label">Aggregated Stock</div>
            <div className="kpi-value">{stockStats.totalStock.toLocaleString()}</div>
          </div>
          <div className="kpi-footer">
            <ArrowUpRight size={16} /> Real-time Warehouse Sync
          </div>
        </div>

        <div className="kpi-card warning animate-fade" style={{ animationDelay: '0.3s' }}>
          <AlertTriangle size={80} className="kpi-icon-overlay" />
          <div>
            <div className="kpi-label">Risk Inventory</div>
            <div className="kpi-value">{stockStats.low + stockStats.out}</div>
          </div>
          <div className="kpi-footer">
            {stockStats.out} Depleted · {stockStats.low} Critical
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="inventory-toolbar animate-fade" style={{ animationDelay: '0.4s' }}>
        <div className="search-box">
          <Search size={18} className="search-icon" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search by name, SKU or brand..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {categories.map(cat => (
            <button 
              key={cat}
              className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="inventory-list">
        {filteredProducts.map((p, idx) => {
          const isLow = (p.stock || 0) < 10 && (p.stock || 0) > 0;
          const isOut = (p.stock || 0) <= 0;
          
          return (
            <div key={p.id} className="product-ticket animate-fade" style={{ animationDelay: `${0.5 + idx * 0.05}s` }}>
              <div className="product-img">
                <ImgWithFallback src={p.image || PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji || '📦'} />
              </div>

              <div className="product-info">
                <h3 className="product-name">{p.name}</h3>
                <div className="product-meta">
                  <span className="product-sku">{p.sku || 'NO-SKU'}</span>
                  <span className="product-category-pill">{p.category || 'General'}</span>
                </div>
              </div>

              <div className="product-stats">
                <div className="stat-col">
                  <span className="stat-label">Market Value</span>
                  <span className="stat-value price">{fmt(p.price, settings?.sym)}</span>
                </div>
                <div className="stat-col">
                  <span className="stat-label">Stock Unit</span>
                  <div className={`stock-indicator ${isOut ? 'out' : isLow ? 'low' : 'high'}`}>
                    {isOut ? 'Depleted' : isLow ? 'Low Stock' : 'Optimized'}
                    <span style={{ marginLeft: 4 }}>({p.stock || 0})</span>
                  </div>
                </div>
              </div>

              <div className="action-hub">
                <button className="action-circular-btn" title="View Intelligence">
                  <Eye size={18} strokeWidth={2.5} />
                </button>
                <button className="action-circular-btn" onClick={() => handleEditProduct(p)} title="Modify Node">
                  <Edit3 size={18} strokeWidth={2.5} />
                </button>
                <button className="action-circular-btn delete" onClick={() => handleDeleteProduct(p)} title="Purge Record">
                  <Trash2 size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )
        })}

        {filteredProducts.length === 0 && (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="animate-fade">
              <Package size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <p style={{ fontSize: 18, fontWeight: 700 }}>No matching assets discovered.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Redesign Integration */}
      {showProductModal && (
        <Modal t={t} title={editingProduct ? "Revise Asset Parameters" : "Initialize New Asset"} onClose={() => setShowProductModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '10px 0' }}>
            <Input t={t} label="Asset Identity" defaultValue={editingProduct?.name || ''} placeholder="e.g. Quantum X1 Scarf" />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Input t={t} label="Reference SKU" defaultValue={editingProduct?.sku || ''} placeholder="SKU-XXXX" />
              <Input t={t} label="Classification" defaultValue={editingProduct?.category || ''} placeholder="e.g. Apparel" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Input t={t} type="number" label="Unit Valuation" defaultValue={editingProduct?.price || ''} placeholder="0.00" />
              <Input t={t} type="number" label="Current Availability" defaultValue={editingProduct?.stock || 0} placeholder="0" />
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <Btn t={t} variant="outline" style={{ flex: 1, borderRadius: 16, height: 50, fontWeight: 700 }} onClick={() => setShowProductModal(false)}>Abort</Btn>
              <Btn 
                t={t} 
                style={{ flex: 1, background: 'var(--primary)', color: '#fff', borderRadius: 16, height: 50, fontWeight: 800, border: 'none' }} 
                onClick={() => setShowProductModal(false)}
              >
                {editingProduct ? "Update Record" : "Commit Asset"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}

const Plus = ({ size = 24, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)
