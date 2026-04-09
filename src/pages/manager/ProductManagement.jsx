import { useState, useEffect, useCallback } from 'react'
import { Btn, Input, Badge, Card, Modal, Table, Select } from '@/components/ui'
import { ImgWithFallback, notify } from '@/components/shared'
import { fmt } from '@/lib/utils'
import { fetchCategories, fetchSubCategories } from '@/services/categories'
import { createProduct, updateProduct, deleteProduct } from '@/services/products'
import { isSupabaseConfigured } from '@/lib/supabase'
import { PRODUCT_IMAGES } from '@/lib/seed-data'

const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS', '6', '7', '8', '9', '10', '11', '12']
const COLOR_PRESETS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Grey', 'Navy', 'Purple', 'Orange']
const MATERIAL_PRESETS = ['Cotton', 'Polyester', 'Nylon', 'Wool', 'Denim', 'Leather', 'Fleece', 'Mesh', 'Spandex']

function ChipSelect({ t, label, values = [], onChange, presets = [] }) {
  const [custom, setCustom] = useState('')
  const toggle = (v) => {
    const next = values.includes(v) ? values.filter(x => x !== v) : [...values, v]
    onChange(next)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
      <label style={{ fontSize: 15, fontWeight: 800, color: t.text3, textTransform: 'uppercase', letterSpacing: 0.7 }}>{label}</label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {presets.map(p => {
          const sel = values.includes(p)
          return (
            <button key={p} type="button" onClick={() => toggle(p)}
              style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                border: `1px solid ${sel ? t.accent : t.border}`,
                background: sel ? t.accent + '20' : 'transparent',
                color: sel ? t.accent : t.text,
              }}>
              {p}
            </button>
          )
        })}
        {values.filter(v => !presets.includes(v)).map(v => (
          <button key={v} type="button" onClick={() => toggle(v)}
            style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              border: `1px solid ${t.accent}`,
              background: t.accent + '20',
              color: t.accent,
            }}>
            {v}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <input
          value={custom} onChange={e => setCustom(e.target.value)}
          placeholder={`Add custom ${label.toLowerCase()}...`}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (custom.trim()) { toggle(custom.trim()); setCustom('') } } }}
          style={{ flex: 1, background: t.input, border: `1px solid ${t.border}`, borderRadius: 8, padding: '7px 12px', color: t.text, fontSize: 16, outline: 'none' }}
        />
        <Btn t={t} size="sm" onClick={() => { if (custom.trim()) { toggle(custom.trim()); setCustom('') } }}>+</Btn>
      </div>
    </div>
  )
}

const ActionBtn = ({ t, variant, onClick, children, disabled }) => {
  const [hov, setHov] = useState(false)
  return (
    <Btn
      t={t}
      variant={variant}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '6px 10px',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hov ? `0 4px 12px ${variant === 'danger' ? t.red : t.accent}40` : 'none'
      }}
    >
      {children}
    </Btn>
  )
}

const ProductIdentityCard = ({ p, t, settings }) => {
  return (
    <div style={{
      width: '100%',
      background: '#fff',
      borderRadius: 24,
      overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
      fontFamily: "'Inter', sans-serif",
      position: 'relative'
    }}>
      {/* Top Dark Header */}
      <div style={{
        height: 180,
        background: '#1f2937',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 24
      }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#f59e0b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Product ID</div>
        <div style={{ width: 40, height: 2, background: '#f59e0b', borderRadius: 1 }} />
      </div>

      {/* Main Wave Transition */}
      <div style={{
        position: 'absolute',
        top: 140,
        left: 0,
        width: '100%',
        height: 80,
        zIndex: 5
      }}>
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ height: '100%', width: '100%' }}>
          <path d="M0.00,49.98 C149.99,150.00 349.20,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" style={{ stroke: 'none', fill: '#fff' }}></path>
          <path d="M0,50 C150,150 350,-50 500,50" style={{ fill: 'none', stroke: '#f59e0b', strokeWidth: 10, strokeLinecap: 'round' }}></path>
        </svg>
      </div>

      {/* Hero Avatar */}
      <div style={{
        width: 130,
        height: 130,
        borderRadius: '50%',
        background: '#fff',
        border: '6px solid #f59e0b',
        position: 'absolute',
        top: 75,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        overflow: 'hidden',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
      }}>
        <ImgWithFallback src={p.image || PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Content Area */}
      <div style={{ padding: '90px 40px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 6px 0', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
          {p.name.split(' ').slice(0, 1)} <span style={{ color: '#f59e0b' }}>{p.name.split(' ').slice(1).join(' ')}</span>
        </h2>

        <div style={{ fontSize: 15, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 32 }}>
          {p.category} Pro Edition
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>Price</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{fmt(p.price, settings?.sym)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>SKU Code</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#111827', fontFamily: 'monospace' }}>{p.sku?.substring(0, 8)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>Available</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: p.stock < 10 ? '#ef4444' : '#111827' }}>{p.stock} Units</span>
          </div>
        </div>

        {/* Barcode Section */}
        <div style={{
          padding: '20px 24px',
          background: '#f9fafb',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{ display: 'flex', gap: 3, height: 40, alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
            {[1, 2, 4, 2, 1, 3, 2, 1, 4, 3, 1, 2, 4, 1, 2, 3].map((w, i) => (
              <div key={i} style={{ width: w, height: '100%', background: '#374151', borderRadius: 1 }} />
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', fontFamily: 'monospace', letterSpacing: 3 }}>
            {p.sku || '00000000'}
          </div>
        </div>
      </div>

      {/* Bottom Corner Waves */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, opacity: 0.1 }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: '#f59e0b' }}>
          <path d="M0,0 C50,0 50,50 100,50 L100,100 L0,100 Z" />
        </svg>
      </div>
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, opacity: 0.1, transform: 'scaleX(-1)' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: '#f59e0b' }}>
          <path d="M0,0 C50,0 50,50 100,50 L100,100 L0,100 Z" />
        </svg>
      </div>
    </div>
  )
}


export const ProductManagement = ({ products, setProducts, addAudit, currentUser, t: globalT, settings }) => {
  const blueT = {
    ...globalT,
    accent: '#3b82f6',
    accent2: '#2563eb',
    accentLight: 'rgba(59, 130, 246, 0.2)'
  }
  const isAdmin = currentUser?.role === 'admin'
  const t = blueT

  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editP, setEditP] = useState(null)
  const [allCats, setAllCats] = useState([])
  const [allSubs, setAllSubs] = useState([])
  const [loading, setLoading] = useState(true)

  const empty = {
    name: '', sku: '', barcodes: [], category_id: '', subcategory_id: '', category: '', subcategory: '', price: '', costPrice: '',
    stock: '',
    emoji: '📦', description: '', shortDescription: '', longDescription: '',
    image: '', taxPct: 20, status: 'active',
    brand: '', supplier: '', isSeasonal: false,
    returnable: true,
    dynamic_attributes: {}
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

  // Dynamic Presets from DB
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
      if (isSupabaseConfigured()) {
        await deleteProduct(p.id)
      }
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

  return (
    <div style={{ 
      background: 'transparent',
      minHeight: '100%', padding: '32px', borderRadius: 24,
      display: 'flex', flexDirection: 'column', gap: 20 
    }}>
      <div style={{ fontSize: 26, fontWeight: 900, color: t.text }}>Product Management</div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          style={{ flex: 1, minWidth: 180, background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, padding: '9px 14px', color: t.text, fontSize: 17, outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <button onClick={() => setCat('All')} style={{ padding: '7px 13px', borderRadius: 20, border: `1px solid ${cat === 'All' ? t.accent : t.border}`, background: cat === 'All' ? t.accent + '15' : 'transparent', color: cat === 'All' ? t.accent : t.text3, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>All</button>
          {parentCats.map(c => (
            <button key={c.id} onClick={() => setCat(c.name)} style={{ padding: '7px 13px', borderRadius: 20, border: `1px solid ${cat === c.name ? t.accent : t.border}`, background: cat === c.name ? t.accent + '15' : 'transparent', color: cat === c.name ? t.accent : t.text3, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>{c.name}</button>
          ))}
        </div>
        {isAdmin && <Btn t={t} onClick={() => { setEditP(null); setForm(empty); setShowForm(true) }}>+ Add</Btn>}

      </div>

      <Card t={t} style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          t={t}
          cols={['', 'Name', 'SKU', 'Category', 'Price', 'Stock', 'Actions']}
          rows={fil.map(p => [
            <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden' }}>
              <ImgWithFallback src={p.image || PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>,
            <span style={{ fontWeight: 700, color: t.text }}>{p.name}</span>,
            <span style={{ fontSize: 14, fontFamily: 'monospace', color: t.text3 }}>{p.sku}</span>,
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Badge t={t} text={p.category} color="blue" />
              {p.subcategory && <span style={{ fontSize: 14, color: t.text3 }}>{p.subcategory}</span>}
            </div>,
            <span style={{ fontWeight: 800, color: t.green }}>{fmt(p.price, settings?.sym)}</span>,
            <Badge t={t} text={String(p.stock || 0)} color={(p.stock || 0) < 10 ? 'red' : (p.stock || 0) < 20 ? 'yellow' : 'green'} />,
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <ActionBtn t={t} variant={isAdmin ? "ghost" : "primary"} onClick={() => {
                setEditP(p)
                setForm({
                  ...p,
                  price: p.price ?? p.base_price ?? '',
                  costPrice: p.costPrice ?? '',
                  stock: p.stock ?? '',
                  sku: p.sku || '',
                  barcodes: p.barcodes?.length ? [...p.barcodes] : (p.barcode ? [p.barcode] : []),
                  category: p.category,
                  category_id: p.category_id || '',
                  subcategory: p.subcategory || '',
                  subcategory_id: p.subcategory_id || '',
                  emoji: p.emoji || '📦',
                  shortDescription: p.shortDescription || p.description || '',
                  longDescription: p.longDescription || '',
                  image: p.image || p.image_url || '',
                  taxPct: p.taxPct ?? p.tax_pct ?? 20,
                  status: p.status || 'active',
                  brand: p.brand || '',
                  supplier: p.supplier || '',
                  isSeasonal: !!p.isSeasonal,
                  returnable: p.returnable !== false,
                  track_serial: !!p.track_serial,
                  dynamic_attributes: p.dynamic_attributes || {}
                })
                setShowForm(true)
              }}>
                {isAdmin ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </ActionBtn>
              {isAdmin && (
                <ActionBtn t={t} variant="danger" onClick={() => handleDelete(p)} disabled={saving}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </ActionBtn>
              )}
            </div>,
          ])}
        />
      </Card>

      {showForm && (
        <Modal 
          t={t} 
          title={isAdmin ? (editP ? 'Edit Product' : 'Add Product') : null} 
          width={isAdmin ? 580 : 450}
          onClose={() => { setShowForm(false); setEditP(null) }}
        >
          {isAdmin ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                <Input t={t} label="Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required readOnly={!isAdmin} />
                <Input t={t} label="SKU / Item Code" value={form.sku} onChange={v => setForm(f => ({ ...f, sku: v }))} readOnly={!isAdmin} />
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: t.text3, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 6 }}>Barcodes</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(form.barcodes || []).map((bc, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input value={bc} onChange={e => isAdmin && setForm(f => ({ ...f, barcodes: f.barcodes.map((b, j) => j === i ? e.target.value : b) }))} placeholder="Barcode" readOnly={!isAdmin} style={{ flex: 1, background: !isAdmin ? t.bg4 : t.input, border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 12px', color: t.text, fontSize: 16, outline: 'none' }} />
                        {isAdmin && <button type="button" onClick={() => setForm(f => ({ ...f, barcodes: f.barcodes.filter((_, j) => j !== i) }))} style={{ padding: '6px 12px', background: t.redBg || '#fef2f2', border: `1px solid ${t.redBorder || '#fecaca'}`, borderRadius: 8, color: t.red || '#dc2626', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Remove</button>}
                      </div>
                    ))}
                    {isAdmin && <button type="button" onClick={() => setForm(f => ({ ...f, barcodes: [...(f.barcodes || []), ''] }))} style={{ padding: '8px 12px', background: t.accent + '20', border: `1px solid ${t.accent}`, borderRadius: 8, color: t.accent, fontSize: 16, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>+ Add barcode</button>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 13 }}>
                  <Input t={t} label={`Retail Price (${settings?.sym || '£'})`} value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} type="number" required style={{ flex: 1 }} readOnly={!isAdmin} />
                  <Input t={t} label={`Cost Price (${settings?.sym || '£'})`} value={form.costPrice} onChange={v => setForm(f => ({ ...f, costPrice: v }))} type="number" style={{ flex: 1 }} readOnly={!isAdmin} />
                </div>
                <Input t={t} label="Stock" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} type="number" required readOnly={!isAdmin} />
                <Select t={t} label="Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} disabled={!isAdmin} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                <Select
                  t={t} label="Category"
                  value={form.category_id || form.category}
                  disabled={!isAdmin}
                  onChange={v => {
                    const c = allCats.find(x => x.id === v || x.name === v)
                    setForm(f => ({ ...f, category_id: c?.id, category: c?.name, subcategory_id: '', subcategory: '', dynamic_attributes: {} }))
                  }}
                  options={[
                    { value: '', label: 'Select Category' },
                    ...parentCats.map(c => ({ value: c.id, label: c.name }))
                  ]}
                />
                {subCats.length > 0 && (
                  <Select
                    t={t} label="Subcategory"
                    disabled={!isAdmin}
                    value={form.subcategory_id || form.subcategory}
                    onChange={v => {
                      const s = allSubs.find(x => x.id === v || x.name === v)
                      setForm(f => ({ ...f, subcategory_id: s?.id, subcategory: s?.name, dynamic_attributes: {} }))
                    }}
                    options={[
                      { value: '', label: 'Select Subcategory' },
                      ...subCats.map(s => ({ value: s.id, label: s.name }))
                    ]}
                  />
                )}
              </div>

              {activeConfig.length > 0 && (form.subcategory_id || (form.category_id && subCats.length === 0)) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14, background: t.bg2 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: t.text3, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 5 }}>Dynamic Attributes</div>

                  {activeConfig.includes('Size') && (
                    <ChipSelect
                      t={t} label="Size"
                      values={form.dynamic_attributes?.Size || []}
                      presets={getPresets('Size')}
                      onChange={v => isAdmin && setForm(f => ({ ...f, dynamic_attributes: { ...f.dynamic_attributes, Size: v } }))}
                    />
                  )}

                  {activeConfig.includes('Color') && (
                    <ChipSelect
                      t={t} label="Color"
                      values={form.dynamic_attributes?.Color || []}
                      presets={getPresets('Color')}
                      onChange={v => isAdmin && setForm(f => ({ ...f, dynamic_attributes: { ...f.dynamic_attributes, Color: v } }))}
                    />
                  )}

                  {activeConfig.includes('Material') && (
                    <ChipSelect
                      t={t} label="Material"
                      values={form.dynamic_attributes?.Material || []}
                      presets={getPresets('Material')}
                      onChange={v => isAdmin && setForm(f => ({ ...f, dynamic_attributes: { ...f.dynamic_attributes, Material: v } }))}
                    />
                  )}

                  {activeConfig.includes('Length') && (
                    <ChipSelect
                      t={t} label="Length"
                      values={form.dynamic_attributes?.Length || []}
                      presets={getPresets('Length')}
                      onChange={v => isAdmin && setForm(f => ({ ...f, dynamic_attributes: { ...f.dynamic_attributes, Length: v } }))}
                    />
                  )}

                  {activeConfig.filter(a => !['Size', 'Color', 'Material', 'Length'].includes(a)).map(attr => (
                    <ChipSelect
                      key={attr}
                      t={t} label={attr}
                      values={form.dynamic_attributes?.[attr] || []}
                      presets={[]}
                      onChange={v => isAdmin && setForm(f => ({ ...f, dynamic_attributes: { ...f.dynamic_attributes, [attr]: v } }))}
                    />
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                <Input t={t} label="Brand" value={form.brand} onChange={v => setForm(f => ({ ...f, brand: v }))} readOnly={!isAdmin} />
                <Input t={t} label="Supplier" value={form.supplier} onChange={v => setForm(f => ({ ...f, supplier: v }))} readOnly={!isAdmin} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                <Input t={t} label="Short Description" value={form.shortDescription} onChange={v => setForm(f => ({ ...f, shortDescription: v }))} readOnly={!isAdmin} />
                <Input t={t} label="Emoji" value={form.emoji} onChange={v => setForm(f => ({ ...f, emoji: v }))} readOnly={!isAdmin} />
              </div>
              <textarea
                placeholder="Long Description..."
                value={form.longDescription}
                readOnly={!isAdmin}
                onChange={e => isAdmin && setForm(f => ({ ...f, longDescription: e.target.value }))}
                style={{ width: '100%', background: !isAdmin ? t.bg4 : t.input, border: `1px solid ${t.border}`, borderRadius: 9, padding: '12px 14px', color: t.text, fontSize: 17, outline: 'none', minHeight: 80, fontFamily: 'inherit' }}
              />

              <Input t={t} label="Tax %" type="number" value={form.taxPct} onChange={v => setForm(f => ({ ...f, taxPct: v }))} placeholder="20" readOnly={!isAdmin} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: isAdmin ? 'pointer' : 'default', fontSize: 17, color: t.text }}>
                  <input type="checkbox" checked={!!form.returnable} onChange={e => isAdmin && setForm(f => ({ ...f, returnable: e.target.checked }))} disabled={!isAdmin} />
                  Returnable
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: isAdmin ? 'pointer' : 'default', fontSize: 17, color: t.text }}>
                  <input type="checkbox" checked={!!form.isSeasonal} onChange={e => isAdmin && setForm(f => ({ ...f, isSeasonal: e.target.checked }))} disabled={!isAdmin} />
                  Seasonal / Limited Edition
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: isAdmin ? 'pointer' : 'default', fontSize: 17, color: t.text }}>
                  <input type="checkbox" checked={!!form.track_serial} onChange={e => isAdmin && setForm(f => ({ ...f, track_serial: e.target.checked }))} disabled={!isAdmin} />
                  Track serial numbers
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 15, color: t.text3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7 }}>Product Image</label>
                {isAdmin && <input type="file" accept="image/*" onChange={handleImageUpload} style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, padding: '10px 14px', color: t.text, fontSize: 17, outline: 'none' }} />}
                {form.image && (
                  <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.border}` }}>
                    <img src={form.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
              {isAdmin && <Btn t={t} onClick={save} disabled={!form.name || !form.price || saving}>{editP ? 'Update' : 'Add Product'}</Btn>}
            </div>
          ) : (
            <ProductIdentityCard p={editP} t={t} settings={settings} />
          )}
        </Modal>

      )}
    </div>
  )
}
