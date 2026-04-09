import { useState, useEffect, useCallback } from 'react'
import { Input, Modal, Select } from '@/components/ui'
import { ImgWithFallback, notify } from '@/components/shared'
import { fmt } from '@/lib/utils'
import { fetchCategories, fetchSubCategories } from '@/services/categories'
import { createProduct, updateProduct, deleteProduct } from '@/services/products'
import { isSupabaseConfigured } from '@/lib/supabase'
import { PRODUCT_IMAGES } from '@/lib/seed-data'
import {
  Search, Plus, Edit2, Trash2, Box, PackageOpen, Info,
  ChevronLeft, ChevronRight, Activity, ShoppingBag, Eye
} from 'lucide-react'

const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS', '6', '7', '8', '9', '10', '11', '12']
const COLOR_PRESETS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Grey', 'Navy', 'Purple', 'Orange']
const MATERIAL_PRESETS = ['Cotton', 'Polyester', 'Nylon', 'Wool', 'Denim', 'Leather', 'Fleece', 'Mesh', 'Spandex']

// Helper to deduce a soft color for different categories
const getCategoryColors = (catName) => {
  const name = (catName || '').toLowerCase();
  if (name.includes('jersey') || name.includes('apparel') || name.includes('shirt')) return { bg: '#EFF6FF', text: '#2563EB', dot: '#3B82F6' };
  if (name.includes('cup') || name.includes('mug') || name.includes('home')) return { bg: '#ECFDF5', text: '#059669', dot: '#10B981' };
  if (name.includes('collect') || name.includes('souvenir')) return { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' };
  if (name.includes('access') || name.includes('hat') || name.includes('cap')) return { bg: '#F5F3FF', text: '#7C3AED', dot: '#8B5CF6' };
  return { bg: '#F1F5F9', text: '#475569', dot: '#64748B' };
}

function ChipSelect({ label, values = [], onChange, presets = [] }) {
  const [custom, setCustom] = useState('')
  const toggle = (v) => {
    const next = values.includes(v) ? values.filter(x => x !== v) : [...values, v]
    onChange(next)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {presets.map(p => {
          const sel = values.includes(p)
          return (
            <button key={p} type="button" onClick={() => toggle(p)}
              style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${sel ? '#2563EB' : '#E2E8F0'}`,
                background: sel ? '#EFF6FF' : 'transparent',
                color: sel ? '#2563EB' : '#475569',
              }}>
              {p}
            </button>
          )
        })}
        {values.filter(v => !presets.includes(v)).map(v => (
          <button key={v} type="button" onClick={() => toggle(v)}
            style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: `1px solid #2563EB`, background: '#EFF6FF', color: '#2563EB',
            }}>
            {v}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <input
          value={custom} onChange={e => setCustom(e.target.value)}
          placeholder={`Custom ${label.toLowerCase()}...`}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (custom.trim()) { toggle(custom.trim()); setCustom('') } } }}
          style={{ flex: 1, background: '#F8FAFC', border: `1px solid #E2E8F0`, borderRadius: 8, padding: '7px 12px', color: '#0F172A', fontSize: 14, outline: 'none' }}
        />
        <button type="button" style={{ background: '#2563EB', border: 'none', color: '#fff', borderRadius: 8, width: 34, cursor: 'pointer' }} onClick={() => { if (custom.trim()) { toggle(custom.trim()); setCustom('') } }}>+</button>
      </div>
    </div>
  )
}

export function ProductManagement({ products, setProducts, addAudit, currentUser, settings, t: globalT }) {
  const t = globalT || { bg: '#fff', text: '#000', border: '#e2e8f0' } // Fallback
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editP, setEditP] = useState(null)
  const [allCats, setAllCats] = useState([])
  const [allSubs, setAllSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const empty = {
    name: '', sku: '', barcodes: [], category_id: '', subcategory_id: '', category: '', subcategory: '', price: '', costPrice: '', stock: '',
    emoji: '🏷️', description: '', shortDescription: '', longDescription: '', image: '', taxPct: 20, status: 'active',
    brand: '', supplier: '', isSeasonal: false, returnable: true, dynamic_attributes: {}
  }
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const loadCats = useCallback(async () => {
    try {
      const [cats, subs] = await Promise.all([fetchCategories(), fetchSubCategories()])
      setAllCats(cats || [])
      setAllSubs(subs || [])
    } catch (e) {
      notify('Failed to load categories', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCats() }, [loadCats])

  const parentCats = allCats
  const currentCategory = parentCats.find(c => c.name === form.category || c.id === form.category_id)
  const subCats = currentCategory ? allSubs.filter(s => s.category_id === currentCategory.id) : []
  const currentSub = subCats.find(s => s.name === form.subcategory || s.id === form.subcategory_id)
  const activeConfig = currentSub?.attribute_config || currentCategory?.attribute_config || []

  const getPresets = (name) => {
    const source = currentSub || currentCategory
    if (!source) return []
    if (name === 'Size') return source.sizes || SIZE_PRESETS
    if (name === 'Color') return source.colors || COLOR_PRESETS
    if (name === 'Material') return source.materials || MATERIAL_PRESETS
    if (name === 'Length') return source.lengths || []
    return []
  }

  const fil = products.filter(p =>
    (cat === 'All' || p.category === cat) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase()))
  )

  const itemsPerPage = 8
  const totalPages = Math.ceil(fil.length / itemsPerPage)
  const currentItems = fil.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => { setCurrentPage(1) }, [cat, search])

  const save = async () => {
    const payload = {
      name: form.name,
      sku: form.sku || form.name?.replace(/\s/g, '-').toUpperCase(),
      barcodes: Array.isArray(form.barcodes) ? form.barcodes.filter(Boolean) : [],
      category: currentCategory?.name || form.category,
      category_id: currentCategory?.id || form.category_id,
      subcategory: currentSub?.name || form.subcategory,
      subcategory_id: currentSub?.id || form.subcategory_id,
      price: +form.price,
      costPrice: form.costPrice ? +form.costPrice : null,
      stock: +form.stock,
      taxPct: form.taxPct != null ? +form.taxPct : 20,
      status: form.status || 'active',
      brand: form.brand || null,
      supplier: form.supplier || null,
      track_serial: !!form.track_serial,
      description: form.shortDescription || form.longDescription || form.description || null,
      shortDescription: form.shortDescription || null,
      longDescription: form.longDescription || null,
      image: form.image || null,
      emoji: form.emoji || '📦',
      isSeasonal: !!form.isSeasonal,
      returnable: form.returnable !== false,
      dynamic_attributes: form.dynamic_attributes || {}
    }
    setSaving(true)
    try {
      if (isSupabaseConfigured()) {
        if (editP) {
          const updated = await updateProduct(editP.id, payload)
          setProducts(ps => ps.map(p => p.id === editP.id ? { ...p, ...updated, category: payload.category, subcategory: payload.subcategory } : p))
          notify('Product updated!', 'success')
        } else {
          const created = await createProduct(payload)
          setProducts(ps => [...ps, { ...created, category: payload.category, subcategory: payload.subcategory, stock: payload.stock || 0 }])
          notify('Product added!', 'success')
        }
      } else {
        if (editP) {
          setProducts(ps => ps.map(p => p.id === editP.id ? { ...p, ...payload } : p))
          notify('Product updated!', 'success')
        } else {
          setProducts(ps => [...ps, { id: Date.now(), ...payload }])
          notify('Product added!', 'success')
        }
      }
      addAudit(currentUser, editP ? 'Product Updated' : 'Product Created', 'Inventory', form.name)
      setShowForm(false)
      setEditP(null)
      setForm(empty)
    } catch (err) {
      notify(err?.message || 'Failed to save product', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return
    setSaving(true)
    try {
      if (isSupabaseConfigured()) { await deleteProduct(p.id) }
      setProducts(ps => ps.filter(x => x.id !== p.id))
      addAudit(currentUser, 'Product Deleted', 'Inventory', p.name)
      notify('Product deleted', 'warning')
    } catch (err) {
      notify(err?.message || 'Failed to delete product', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setForm(f => ({ ...f, image: ev.target.result }))
      reader.readAsDataURL(file)
    }
  }

  const totalProds = products.length
  const totalStock = products.reduce((a, b) => a + (b.stock || 0), 0)
  const lowStockCount = products.filter(p => (p.stock || 0) < 10).length

  return (
    <div className="lux-root">
      <style>{`
        .lux-root {
          background: #FAFAF8; /* very faint warm off-white */
          min-height: calc(100vh - 64px);
          padding: 32px 40px;
          margin: -24px;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #0F172A;
        }

        /* Header block */
        .lux-header {
          display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;
        }
        .lux-breadcrumb {
          font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
          display: flex; gap: 8px; align-items: center;
        }
        .lux-breadcrumb span:first-child { color: #4F46E5; }
        
        .lux-subhead { font-size: 11px; color: #94A3B8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .lux-title { font-size: 28px; font-weight: 900; letter-spacing: -0.04em; margin: 0; color: #0F172A; }
        
        .lux-stats { display: flex; gap: 16px; align-items: center; }
        .lux-stat-pill {
          background: #FFFFFF; border-radius: 12px; padding: 12px 20px; 
          box-shadow: 0 4px 14px rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.03);
          display: flex; align-items: center; gap: 16px;
        }
        .lux-stat-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .lux-stat-info { display: flex; flex-direction: column; }
        .lux-stat-label { font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        .lux-stat-val { font-size: 20px; font-weight: 900; line-height: 1; letter-spacing: -0.03em; color: #0F172A; }

        /* Filter bar */
        .lux-filter-bar {
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.03);
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          border-radius: 16px;
          padding: 12px 16px;
          display: flex; gap: 20px; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
          position: sticky;
          top: 0px;
          z-index: 50;
        }
        
        .lux-search-cont { position: relative; width: 280px; }
        .lux-search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #CBD5E1; pointer-events: none; }
        .lux-search-inp {
          width: 100%; background: #F8FAFC; border: transparent; border-radius: 12px;
          padding: 10px 16px 10px 42px; font-size: 13px; color: #0F172A; outline: none; transition: 0.3s; font-weight: 500;
        }
        .lux-search-inp::placeholder { color: #94A3B8; }
        .lux-search-inp:focus { background: #FFFFFF; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); border-color: #3B82F6; border: 1px solid #3B82F6; }

        .lux-cat-list { display: flex; gap: 8px; flex-wrap: wrap; flex: 1; justify-content: center;}
        .lux-cat-btn {
          padding: 6px 16px; border-radius: 99px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background: #F8FAFC; color: #64748B; border: none;
        }
        .lux-cat-btn:hover:not(.active) { background: #F1F5F9; color: #1E293B; }
        .lux-cat-btn.active {
          background: linear-gradient(135deg, #4F46E5, #3B82F6); color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }

        .lux-add-btn {
          background: linear-gradient(135deg, #4F46E5, #3B82F6); color: white;
          padding: 10px 20px; border-radius: 12px; font-weight: 700; font-size: 13px; border: none;
          cursor: pointer; box-shadow: 0 4px 14px rgba(37,99,235,0.25); transition: 0.3s;
          display: flex; align-items: center; gap: 6px; flex-shrink: 0;
        }
        .lux-add-btn:hover { box-shadow: 0 6px 18px rgba(37,99,235,0.35); transform: translateY(-1px); }

        /* Card List */
        .lux-list { display: flex; flex-direction: column; gap: 12px; }
        .lux-card {
          background: #FFFFFF; border-radius: 16px; padding: 16px 24px;
          display: grid; grid-template-columns: 56px 4fr 1.5fr 1.5fr 1fr 100px; gap: 24px; align-items: center; position: relative; overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.03);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, box-shadow;
        }
        .lux-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.05); }

        /* Staggered animation */
        .lux-card { animation: fadeSlideUp 0.5s ease backwards; }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

        /* Avatar */
        .lux-avatar {
          width: 56px; height: 56px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05);
          display: flex; align-items: center; justify-content: center; background: #FAFAFA;
          font-size: 24px; transition: 0.3s; overflow: hidden; flex-shrink: 0;
        }
        .lux-card:hover .lux-avatar { border-color: #BFDBFE; background: #EFF6FF; }
        .lux-avatar img { width: 100%; height: 100%; object-fit: cover; }

        /* Name block */
        .lux-name-block { display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
        
        .lux-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .lux-c-name { font-size: 14px; font-weight: 800; color: #1E3A8A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
        .lux-c-name:hover { text-decoration: underline; }
        
        .cat-badge {
          display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 99px;
          font-size: 10px; font-weight: 800; letter-spacing: 0.2px;
        }
        .cat-badge-dot { width: 4px; height: 4px; border-radius: 50%; }

        .lux-sub { font-size: 12px; color: #94A3B8; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }

        /* Small columns */
        .lux-col { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .lux-col-label { font-size: 9px; font-weight: 800; color: #CBD5E1; text-transform: uppercase; letter-spacing: 1px; }

        .lux-sku { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 11px; font-weight: 600; color: #64748B; background: #F8FAFC; padding: 4px 10px; border-radius: 99px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; border: 1px solid #F1F5F9; }
        .lux-price { font-size: 14px; font-weight: 800; color: #0F172A; }
        .lux-price span { font-size: 11px; color: #94A3B8; font-weight: 600; margin-right: 2px; }

        /* Stock Badge */
        .stock-badge {
          display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 800; border: 1px solid transparent;
        }
        .stock-dot { width: 5px; height: 5px; border-radius: 50%; }
        .stock-healthy { color: #10B981; background: #ECFDF5; border-color: #D1FAE5; }
        .stock-low { color: #D97706; background: #FFFBEB; border-color: #FEF3C7; }
        .stock-out { color: #EF4444; background: #FEF2F2; border-color: #FEE2E2; }
        @keyframes pulseDot { 0% { box-shadow: 0 0 0 0px rgba(245, 158, 11, 0.4); } 100% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); } }

        /* Hover Actions */
        .lux-actions {
          display: flex; gap: 12px; justify-content: flex-end; align-items: center;
          opacity: 0.3; transition: opacity 0.3s;
        }
        .lux-card:hover .lux-actions { opacity: 1; }
        .act-btn {
          background: transparent; border: none; color: #94A3B8; cursor: pointer; transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 4px; display: flex; align-items: center; justify-content: center;
        }
        .act-btn:hover { color: #1E293B; transform: scale(1.1); }
        .act-btn-red:hover { color: #EF4444; }

        /* Stock Progress Bar */
        .lux-prog-wrap { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: transparent; }
        .lux-prog-bar { height: 100%; background: linear-gradient(90deg, #4F46E5, #3B82F6); transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1); width: 0; opacity: 0; }
        .lux-card:hover .lux-prog-bar { opacity: 1; width: var(--stock-pct); }

        /* Empty State */
        .lux-empty {
          background: #FFFFFF; border-radius: 24px; padding: 60px 40px; text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02); margin-top: 20px;
        }

        /* Pagination */
        .lux-pagination {
          display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding: 0 8px;
        }
        .lux-p-text { font-size: 13px; font-weight: 600; color: #64748B; }
        .lux-p-btn { border: 1px solid #E2E8F0; background: white; color: #0F172A; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; transition: 0.2s; }
        .lux-p-btn:hover:not(:disabled) { background: #F8FAFC; border-color: #CBD5E1; }
        .lux-p-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .lux-p-btn.active { background: linear-gradient(135deg, #1E1B4B, #4F46E5); color: white; border-color: transparent; }
      `}</style>

      {/* HEADER SECTION */}
      <div className="lux-header">
        <div>
          <div className="lux-breadcrumb"><span>HOME</span> / <span style={{ color: '#94A3B8' }}>Products</span></div>
          <div className="lux-subhead">INVENTORY</div>
          <h1 className="lux-title">Product Management</h1>
        </div>

        <div className="lux-stats">
          <div className="lux-stat-pill">
            <div className="lux-stat-icon" style={{ background: '#F5F5FF', color: '#4F46E5' }}><PackageOpen size={18} /></div>
            <div className="lux-stat-info">
              <div className="lux-stat-label">Products</div>
              <div className="lux-stat-val">{totalProds}</div>
            </div>
          </div>
          <div className="lux-stat-pill">
            <div className="lux-stat-icon" style={{ background: '#ECFDF5', color: '#10B981' }}><Box size={18} /></div>
            <div className="lux-stat-info">
              <div className="lux-stat-label">Total Stock</div>
              <div className="lux-stat-val">{fmt(totalStock, '').trim()}</div>
            </div>
          </div>
          <div className="lux-stat-pill" style={{ border: lowStockCount > 0 ? '1px solid #FEF08A' : '' }}>
            <div className="lux-stat-icon" style={{ background: '#FFFBEB', color: '#F59E0B' }}><Activity size={18} /></div>
            <div className="lux-stat-info">
              <div className="lux-stat-label">Low Stock</div>
              <div className="lux-stat-val" style={{ color: '#D97706' }}>{lowStockCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="lux-filter-bar">
        <div className="lux-search-cont">
          <Search size={16} className="lux-search-icon" strokeWidth={2.5} />
          <input
            className="lux-search-inp"
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
          />
        </div>

        <div className="lux-cat-list">
          <button className={`lux-cat-btn ${cat === 'All' ? 'active' : ''}`} onClick={() => setCat('All')}>All</button>
          {parentCats.map(c => (
            <button key={c.id} className={`lux-cat-btn ${cat === c.name ? 'active' : ''}`} onClick={() => setCat(c.name)}>
              {c.name}
            </button>
          ))}
        </div>

        <button className="lux-add-btn" onClick={() => { setEditP(null); setForm(empty); setShowForm(true) }}>
          <Plus size={16} strokeWidth={2.5} /> Add Product
        </button>
      </div>

      {/* PRODUCT LIST */}
      {currentItems.length === 0 ? (
        <div className="lux-empty">
          <div style={{ fontSize: 64, marginBottom: 16 }}>✨</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', marginBottom: 8, letterSpacing: '-0.02em' }}>No products found</h2>
          <p style={{ color: '#64748B', fontSize: 16 }}>Try adjusting your search criteria or add a new luxury product.</p>
        </div>
      ) : (
        <div className="lux-list">
          {currentItems.map((p, idx) => {
            const colors = getCategoryColors(p.category);
            const stockLevel = p.stock || 0;
            let stockStatus = 'In Stock';
            let stockClass = 'stock-healthy';
            let dotStyle = {};

            if (stockLevel <= 0) {
              stockStatus = 'Out of Stock';
              stockClass = 'stock-out';
            } else if (stockLevel < 10) {
              stockStatus = 'Low Stock';
              stockClass = 'stock-low';
              dotStyle = { animation: 'pulseDot 2s infinite' };
            }

            const imgUrl = p.image || PRODUCT_IMAGES[p.name];
            const stockPct = Math.min(100, stockLevel * 2);

            return (
              <div key={p.id} className="lux-card" style={{ animationDelay: `${idx * 0.05}s`, '--stock-pct': `${stockPct}%` }}>
                
                <div className="lux-avatar">
                  {imgUrl ? <ImgWithFallback src={imgUrl} alt={p.name} emoji={p.emoji} style={{ width: '100%', height: '100%' }} /> : p.emoji || '🏷️'}
                </div>

                <div className="lux-name-block">
                  <div className="lux-title-row">
                    <h3 className="lux-c-name">{p.name}</h3>
                    <span className="cat-badge" style={{ background: colors.bg, color: colors.text }}>
                      <div className="cat-badge-dot" style={{ background: colors.dot }} />
                      {p.category || 'Uncategorized'}
                    </span>
                  </div>
                  <div className="lux-sub">{p.shortDescription || p.description || p.subcategory || 'Luxury Edition Product'}</div>
                </div>

                <div className="lux-col">
                  <div className="lux-col-label">SKU</div>
                  <div className="lux-sku">{p.sku || `#ITM-${String(p.id).slice(-4)}`}</div>
                </div>
                
                <div className="lux-col">
                  <div className="lux-col-label">Price</div>
                  <div className="lux-price"><span>{settings?.sym || '£'}</span>{fmt(p.price, '').trim()}</div>
                </div>

                <div className="lux-col">
                  <div className="lux-col-label">Stock</div>
                  <span className={`stock-badge ${stockClass}`}>
                    <div className="stock-dot" style={{ background: 'currentColor', ...dotStyle }} />
                    {stockStatus !== 'In Stock' ? stockStatus : stockLevel}
                  </span>
                </div>

                {/* Progress bar line visible on hover */}
                <div className="lux-prog-wrap">
                  <div className="lux-prog-bar" />
                </div>

                {/* Inline Actions */}
                <div className="lux-actions">
                  <button className="act-btn">
                    <Eye size={18} strokeWidth={2.5} />
                  </button>
                  <button className="act-btn" onClick={() => {
                    setEditP(p)
                    setForm({
                      ...p,
                      price: p.price ?? p.base_price ?? '', costPrice: p.costPrice ?? '', stock: p.stock ?? '',
                      sku: p.sku || '', barcodes: p.barcodes?.length ? [...p.barcodes] : (p.barcode ? [p.barcode] : []),
                      category: p.category, category_id: p.category_id || '', subcategory: p.subcategory || '', subcategory_id: p.subcategory_id || '',
                      emoji: p.emoji || '📦', shortDescription: p.shortDescription || p.description || '', longDescription: p.longDescription || '',
                      image: p.image || p.image_url || '', taxPct: p.taxPct ?? p.tax_pct ?? 20, status: p.status || 'active',
                      brand: p.brand || '', supplier: p.supplier || '', isSeasonal: !!p.isSeasonal, returnable: p.returnable !== false,
                      track_serial: !!p.track_serial, dynamic_attributes: p.dynamic_attributes || {}
                    })
                    setShowForm(true)
                  }}>
                    <Edit2 size={18} strokeWidth={2.5} />
                  </button>
                  <button className="act-btn act-btn-red" onClick={() => handleDelete(p)}>
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="lux-pagination">
          <div className="lux-p-text">
            Showing <span style={{ color: '#0F172A', fontWeight: 800 }}>{(currentPage - 1) * itemsPerPage + 1}</span> to <span style={{ color: '#0F172A', fontWeight: 800 }}>{Math.min(currentPage * itemsPerPage, fil.length)}</span> of <span style={{ color: '#0F172A', fontWeight: 800 }}>{fil.length}</span> products
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="lux-p-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18} /></button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} className={`lux-p-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button className="lux-p-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18} /></button>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <Modal t={t} title={editP ? 'Edit Product Configuration' : 'Create Luxury Product'} onClose={() => { setShowForm(false); setEditP(null) }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input t={t} label="Product Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
              <Input t={t} label="Reference SKU" value={form.sku} onChange={v => setForm(f => ({ ...f, sku: v }))} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <Input t={t} label={`Retail Price (${settings?.sym || '£'})`} value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} type="number" required />
              <Input t={t} label={`Cost Price (${settings?.sym || '£'})`} value={form.costPrice} onChange={v => setForm(f => ({ ...f, costPrice: v }))} type="number" />
              <Input t={t} label="Current Stock" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} type="number" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Select
                t={t} label="Category Group"
                value={form.category_id || form.category}
                onChange={v => {
                  const c = allCats.find(x => x.id === v || x.name === v)
                  setForm(f => ({ ...f, category_id: c?.id, category: c?.name, subcategory_id: '', subcategory: '', dynamic_attributes: {} }))
                }}
                options={[ { value: '', label: 'Select Classification' }, ...parentCats.map(c => ({ value: c.id, label: c.name })) ]}
              />
              {subCats.length > 0 && (
                <Select
                  t={t} label="Subclassification"
                  value={form.subcategory_id || form.subcategory}
                  onChange={v => {
                    const s = allSubs.find(x => x.id === v || x.name === v)
                    setForm(f => ({ ...f, subcategory_id: s?.id, subcategory: s?.name, dynamic_attributes: {} }))
                  }}
                  options={[{ value: '', label: 'Select Spec' }, ...subCats.map(s => ({ value: s.id, label: s.name }))]}
                />
              )}
            </div>

            {/* Dynamic Attributes Block */}
            {activeConfig.length > 0 && (form.subcategory_id || (form.category_id && subCats.length === 0)) && (
              <div style={{ border: '1px solid #E2E8F0', background: '#F8FAFC', borderRadius: 16, padding: '20px' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>Variation Configuration</div>
                {['Size', 'Color', 'Material', 'Length'].map(attr => activeConfig.includes(attr) && (
                  <ChipSelect key={attr} label={attr} values={form.dynamic_attributes?.[attr] || []} presets={getPresets(attr)} onChange={v => setForm(f => ({ ...f, dynamic_attributes: { ...f.dynamic_attributes, [attr]: v } }))} />
                ))}
                {activeConfig.filter(a => !['Size', 'Color', 'Material', 'Length'].includes(a)).map(attr => (
                  <ChipSelect key={attr} label={attr} values={form.dynamic_attributes?.[attr] || []} presets={[]} onChange={v => setForm(f => ({ ...f, dynamic_attributes: { ...f.dynamic_attributes, [attr]: v } }))} />
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input t={t} label="Brand Label" value={form.brand} onChange={v => setForm(f => ({ ...f, brand: v }))} />
              <Input t={t} label="Primary Supplier" value={form.supplier} onChange={v => setForm(f => ({ ...f, supplier: v }))} />
            </div>

            <textarea
              placeholder="Detailed product story..."
              value={form.longDescription} onChange={e => setForm(f => ({ ...f, longDescription: e.target.value }))}
              style={{ width: '100%', background: '#F8FAFC', border: `1px solid #E2E8F0`, borderRadius: 12, padding: '16px', color: '#0F172A', fontSize: 15, outline: 'none', minHeight: 100, fontFamily: 'inherit' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                <input type="checkbox" checked={!!form.returnable} onChange={e => setForm(f => ({ ...f, returnable: e.target.checked }))} style={{ width: 16, height: 16 }} /> Eligible for Return
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                <input type="checkbox" checked={!!form.isSeasonal} onChange={e => setForm(f => ({ ...f, isSeasonal: e.target.checked }))} style={{ width: 16, height: 16 }} /> Limited Edition
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Product Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ background: '#F8FAFC', border: `1px solid #E2E8F0`, borderRadius: 9, padding: '10px 14px', color: '#0F172A', fontSize: 14, outline: 'none' }} />
              {form.image && (
                <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: `1px solid #E2E8F0` }}>
                  <img src={form.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <button
              onClick={save} disabled={!form.name || !form.price || saving}
              style={{
                marginTop: 16, background: 'linear-gradient(135deg, #1E1B4B, #4F46E5)', color: 'white', padding: '16px', borderRadius: 14, fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', opacity: (!form.name || !form.price || saving) ? 0.5 : 1
              }}
            >
              {editP ? 'Save Changes' : 'Initialize Product'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
