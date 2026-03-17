import { useState, useEffect, useCallback } from 'react'
import { Btn, Input, Badge, Card, Modal, Table, Select } from '@/components/ui'
import { ImgWithFallback, notify } from '@/components/shared'
import { fmt } from '@/lib/utils'
import { fetchCategories, fetchSubCategories } from '@/services/categories'
import { PRODUCT_IMAGES } from '@/lib/seed-data'

const SITES = ['Main Store', 'Outdoor Kiosk', 'Warehouse']

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
      <label style={{ fontSize: 11, fontWeight: 800, color: t.text3, textTransform: 'uppercase', letterSpacing: 0.7 }}>{label}</label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {presets.map(p => {
          const sel = values.includes(p)
          return (
            <button key={p} type="button" onClick={() => toggle(p)}
              style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer',
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
              padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer',
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
          style={{ flex: 1, background: t.input, border: `1px solid ${t.border}`, borderRadius: 8, padding: '7px 12px', color: t.text, fontSize: 12, outline: 'none' }} 
        />
        <Btn t={t} size="sm" onClick={() => { if (custom.trim()) { toggle(custom.trim()); setCustom('') } }}>+</Btn>
      </div>
    </div>
  )
}

export const ProductManagement = ({ products, setProducts, addAudit, currentUser, t, settings }) => {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editP, setEditP] = useState(null)
  const [allCats, setAllCats] = useState([])
  const [allSubs, setAllSubs] = useState([])
  const [loading, setLoading] = useState(true)

  const empty = {
    name: '', sku: '', barcode: '', category_id: '', subcategory_id: '', category: '', subcategory: '', price: '', costPrice: '',
    stock: '',
    emoji: '📦', description: '', shortDescription: '', longDescription: '',
    image: '', discount: 0, vatRate: 20, taxCode: '', status: 'active',
    brand: '', supplier: '', isSeasonal: false,
    priceOverrides: [],
    promo: { price: '', startDate: '', endDate: '', active: false },
    dynamic_attributes: {}
  }
  const [form, setForm] = useState(empty)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [bulkData, setBulkData] = useState('')
  const [importErrors, setImportErrors] = useState([])
  const [showPriceOverride, setShowPriceOverride] = useState(null)
  const [priceOverrideForm, setPriceOverrideForm] = useState({ newPrice: '', reason: '', pin: '' })

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

  const save = () => {
    const priceOverrides = (form.priceOverrides || []).filter(o => o.site && o.price != null && o.price !== '')
    const promo = form.promo?.active && form.promo?.price != null && form.promo?.price !== ''
      ? { price: +form.promo.price, startDate: form.promo.startDate || null, endDate: form.promo.endDate || null, active: true }
      : { price: null, startDate: null, endDate: null, active: false }
    const payload = {
      ...form,
      category: currentCategory?.name || form.category,
      category_id: currentCategory?.id || form.category_id,
      subcategory: currentSub?.name || form.subcategory,
      subcategory_id: currentSub?.id || form.subcategory_id,
      price: +form.price,
      costPrice: +form.costPrice,
      stock: +form.stock,
      discount: +(form.discount || 0),
      vatRate: +(form.vatRate || 0),
      priceOverrides,
      promo,
      dynamic_attributes: form.dynamic_attributes || {}
    }
    if (editP) {
      setProducts(ps => ps.map(p => p.id === editP.id ? { ...p, ...payload } : p))
      notify('Product updated!', 'success')
    } else {
      setProducts(ps => [...ps, { id: Date.now(), ...payload }])
      notify('Product added!', 'success')
    }
    addAudit(currentUser, editP ? 'Product Updated' : 'Product Created', 'Inventory', form.name)
    setShowForm(false)
    setEditP(null)
    setForm(empty)
  }

  const confirmPriceOverride = () => {
    const p = showPriceOverride
    if (!p || !priceOverrideForm.newPrice || !priceOverrideForm.reason || String(priceOverrideForm.pin).length !== 4) {
      notify('Enter new price, reason, and 4-digit PIN', 'error')
      return
    }
    const newPrice = parseFloat(priceOverrideForm.newPrice)
    if (isNaN(newPrice) || newPrice < 0) {
      notify('Invalid price', 'error')
      return
    }
    setProducts(ps => ps.map(x => x.id === p.id ? { ...x, price: newPrice } : x))
    addAudit(currentUser, 'Price Override', 'Inventory', `Price Override: ${p.name} from ${fmt(p.price, settings?.sym)} to ${fmt(newPrice, settings?.sym)}. Reason: ${priceOverrideForm.reason}`)
    notify('Price updated', 'success')
    setShowPriceOverride(null)
    setPriceOverrideForm({ newPrice: '', reason: '', pin: '' })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setForm(f => ({ ...f, image: ev.target.result }))
      reader.readAsDataURL(file)
    }
  }

  const bulkImport = () => {
    const lines = bulkData.trim().split('\n')
    const errors = []
    const newProducts = []

    lines.forEach((line, idx) => {
      const parts = line.split(',')
      if (parts.length < 5) {
        errors.push(`Line ${idx + 1}: Invalid format. Expected: Name,SKU,Category,Price,Stock[,Description]`)
        return
      }
      const [name, sku, category, priceStr, stockStr, ...descParts] = parts
      const price = parseFloat(priceStr)
      const stock = parseInt(stockStr)

      if (!name || isNaN(price) || isNaN(stock)) {
        errors.push(`Line ${idx + 1}: Invalid data - Name: "${name}", Price: "${priceStr}", Stock: "${stockStr}"`)
        return
      }
      if (!allCats.some(c => c.name === category && !c.parent_id)) {
        errors.push(`Line ${idx + 1}: Invalid category "${category}".`)
        return
      }

      newProducts.push({
        id: Date.now() + idx, name: name.trim(), sku: sku.trim(),
        category: category.trim(), price, stock, emoji: '📦',
        description: descParts.join(',').trim() || '', image: '',
        sizes: [], colors: [], // Initialize sizes and colors for bulk imported products
      })
    })

    if (errors.length > 0) { setImportErrors(errors); return }

    setProducts(ps => [...ps, ...newProducts])
    addAudit(currentUser, 'Bulk Import', 'Inventory', `${newProducts.length} products imported`)
    notify(`${newProducts.length} products imported!`, 'success')
    setShowBulkImport(false)
    setBulkData('')
    setImportErrors([])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: t.text }}>Product Management</div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          style={{ flex: 1, minWidth: 180, background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, padding: '9px 14px', color: t.text, fontSize: 13, outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <button onClick={() => setCat('All')} style={{ padding: '7px 13px', borderRadius: 20, border: `1px solid ${cat === 'All' ? t.accent : t.border}`, background: cat === 'All' ? t.accent + '15' : 'transparent', color: cat === 'All' ? t.accent : t.text3, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>All</button>
          {parentCats.map(c => (
            <button key={c.id} onClick={() => setCat(c.name)} style={{ padding: '7px 13px', borderRadius: 20, border: `1px solid ${cat === c.name ? t.accent : t.border}`, background: cat === c.name ? t.accent + '15' : 'transparent', color: cat === c.name ? t.accent : t.text3, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{c.name}</button>
          ))}
        </div>
        <Btn t={t} onClick={() => { setEditP(null); setForm(empty); setShowForm(true) }}>+ Add</Btn>
        <Btn t={t} variant="secondary" onClick={() => setShowBulkImport(true)}>📤 Bulk Import</Btn>
      </div>

      <Card t={t} style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          t={t}
          cols={['', 'Name', 'SKU', 'Category', 'Price', 'Disc%', 'Stock', 'Actions']}
          rows={fil.map(p => [
            <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden' }}>
              <ImgWithFallback src={p.image || PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>,
            <span style={{ fontWeight: 700, color: t.text }}>{p.name}</span>,
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: t.text3 }}>{p.sku}</span>,
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Badge t={t} text={p.category} color="blue" />
              {p.subcategory && <span style={{ fontSize: 10, color: t.text3 }}>{p.subcategory}</span>}
            </div>,
            <span style={{ fontWeight: 800, color: t.green }}>{fmt(p.price, settings?.sym)}</span>,
            <span style={{ fontWeight: 700, color: (p.discount || 0) > 0 ? t.accent : t.text3 }}>{(p.discount || 0) > 0 ? '-' + p.discount + '%' : '—'}</span>,
            <Badge t={t} text={String(p.stock)} color={p.stock < 10 ? 'red' : p.stock < 20 ? 'yellow' : 'green'} />,
            <div style={{ display: 'flex', gap: 5 }}>
              <Btn t={t} variant="secondary" size="sm" onClick={() => {
                setEditP(p)
                setForm({
                  ...p,
                  price: p.price ?? '',
                  costPrice: p.costPrice ?? '',
                  stock: p.stock ?? '',
                  sku: p.sku || '',
                  barcode: p.barcode || '',
                   category: p.category,
                  category_id: p.category_id || '',
                  subcategory: p.subcategory || '',
                  subcategory_id: p.subcategory_id || '',
                  emoji: p.emoji || '📦',
                  shortDescription: p.shortDescription || p.description || '',
                  longDescription: p.longDescription || '',
                  image: p.image || '',
                  discount: p.discount || 0,
                  vatRate: p.vatRate ?? 20,
                  taxCode: p.taxCode || '',
                  status: p.status || 'active',
                  brand: p.brand || '',
                  supplier: p.supplier || '',
                  isSeasonal: !!p.isSeasonal,
                  priceOverrides: p.priceOverrides || [],
                  promo: p.promo ? { ...p.promo, price: p.promo.price ?? '', startDate: p.promo.startDate || '', endDate: p.promo.endDate || '', active: !!p.promo.active } : { price: '', startDate: '', endDate: '', active: false },
                  dynamic_attributes: p.dynamic_attributes || {}
                })
                setShowForm(true)
              }}>Edit</Btn>
              <Btn t={t} variant="secondary" size="sm" onClick={() => { setShowPriceOverride(p); setPriceOverrideForm({ newPrice: '', reason: '', pin: '' }) }} title="Manager Price Override">{settings?.sym || '£'} Override</Btn>
              <Btn t={t} variant="danger" size="sm" onClick={() => { setProducts(ps => ps.filter(x => x.id !== p.id)); notify('Deleted', 'warning') }}>Del</Btn>
            </div>,
          ])}
        />
      </Card>

      {showForm && (
        <Modal t={t} title={editP ? 'Edit Product' : 'Add Product'} onClose={() => { setShowForm(false); setEditP(null) }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
              <Input t={t} label="Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
              <Input t={t} label="SKU / Item Code" value={form.sku} onChange={v => setForm(f => ({ ...f, sku: v }))} />
              <Input t={t} label="Barcode" value={form.barcode} onChange={v => setForm(f => ({ ...f, barcode: v }))} />
              <div style={{ display: 'flex', gap: 13 }}>
                <Input t={t} label={`Retail Price (${settings?.sym || '£'})`} value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} type="number" required style={{ flex: 1 }} />
                <Input t={t} label={`Cost Price (${settings?.sym || '£'})`} value={form.costPrice} onChange={v => setForm(f => ({ ...f, costPrice: v }))} type="number" style={{ flex: 1 }} />
              </div>
              <Input t={t} label="Stock" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} type="number" required />
              <Select t={t} label="Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
              <Select 
                t={t} label="Category" 
                value={form.category_id || form.category} 
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
                <div style={{ fontSize: 11, fontWeight: 800, color: t.text3, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 5 }}>Dynamic Attributes</div>
                
                {activeConfig.includes('Size') && (
                  <ChipSelect 
                    t={t} label="Size" 
                    values={form.dynamic_attributes?.Size || []} 
                    presets={getPresets('Size')}
                    onChange={v => setForm(f => ({ ...f, dynamic_attributes: { ...f.dynamic_attributes, Size: v } }))} 
                  />
                )}
                
                {activeConfig.includes('Color') && (
                  <ChipSelect 
                    t={t} label="Color" 
                    values={form.dynamic_attributes?.Color || []} 
                    presets={getPresets('Color')}
                    onChange={v => setForm(f => ({ ...f, dynamic_attributes: { ...f.dynamic_attributes, Color: v } }))} 
                  />
                )}
                
                {activeConfig.includes('Material') && (
                  <ChipSelect 
                    t={t} label="Material" 
                    values={form.dynamic_attributes?.Material || []} 
                    presets={getPresets('Material')}
                    onChange={v => setForm(f => ({ ...f, dynamic_attributes: { ...f.dynamic_attributes, Material: v } }))} 
                  />
                )}

                {activeConfig.includes('Length') && (
                  <ChipSelect 
                    t={t} label="Length" 
                    values={form.dynamic_attributes?.Length || []} 
                    presets={getPresets('Length')}
                    onChange={v => setForm(f => ({ ...f, dynamic_attributes: { ...f.dynamic_attributes, Length: v } }))} 
                  />
                )}
                
                {activeConfig.filter(a => !['Size', 'Color', 'Material', 'Length'].includes(a)).map(attr => (
                  <ChipSelect 
                    key={attr}
                    t={t} label={attr} 
                    values={form.dynamic_attributes?.[attr] || []} 
                    presets={[]}
                    onChange={v => setForm(f => ({ ...f, dynamic_attributes: { ...f.dynamic_attributes, [attr]: v } }))} 
                  />
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
              <Input t={t} label="Brand" value={form.brand} onChange={v => setForm(f => ({ ...f, brand: v }))} />
              <Input t={t} label="Supplier" value={form.supplier} onChange={v => setForm(f => ({ ...f, supplier: v }))} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
              <Input t={t} label="Short Description" value={form.shortDescription} onChange={v => setForm(f => ({ ...f, shortDescription: v }))} />
              <Input t={t} label="Emoji" value={form.emoji} onChange={v => setForm(f => ({ ...f, emoji: v }))} />
            </div>
            <textarea
              placeholder="Long Description..."
              value={form.longDescription}
              onChange={e => setForm(f => ({ ...f, longDescription: e.target.value }))}
              style={{ width: '100%', background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, padding: '12px 14px', color: t.text, fontSize: 13, outline: 'none', minHeight: 80, fontFamily: 'inherit' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
              <div style={{ flex: 1 }}>
                <Input t={t} label="Discount %" value={form.discount || 0} onChange={v => setForm(f => ({ ...f, discount: Math.min(100, Math.max(0, +v)) }))} type="number" note="Set % discount on this product (0 = no discount)." />
              </div>
              <div style={{ display: 'flex', gap: 13 }}>
                <Input t={t} label="VAT Rate (%)" value={form.vatRate} onChange={v => setForm(f => ({ ...f, vatRate: v }))} type="number" style={{ flex: 1 }} />
                <Input t={t} label="Tax Code" value={form.taxCode} onChange={v => setForm(f => ({ ...f, taxCode: v }))} style={{ flex: 1 }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: t.text }}>
                <input type="checkbox" checked={!!form.isSeasonal} onChange={e => setForm(f => ({ ...f, isSeasonal: e.target.checked }))} />
                Seasonal / Limited Edition
              </label>
            </div>

            <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 14, marginTop: 4 }}>
              <div style={{ fontSize: 11, color: t.text3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 }}>Price Overrides (Outlet-specific)</div>
              {(form.priceOverrides || []).map((o, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}><Select t={t} label="Site" value={o.site} onChange={v => setForm(f => ({ ...f, priceOverrides: f.priceOverrides.map((x, i) => i === idx ? { ...x, site: v } : x) }))} options={SITES.map(s => ({ value: s, label: s }))} /></div>
                  <Input t={t} label={`Price (${settings?.sym || '£'})`} value={o.price} onChange={v => setForm(f => ({ ...f, priceOverrides: f.priceOverrides.map((x, i) => i === idx ? { ...x, price: v } : x) }))} type="number" />
                  <button type="button" onClick={() => setForm(f => ({ ...f, priceOverrides: f.priceOverrides.filter((_, i) => i !== idx) }))} style={{ background: t.redBg, color: t.red, border: `1px solid ${t.redBorder}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>Remove</button>
                </div>
              ))}
              <Btn t={t} variant="secondary" size="sm" onClick={() => setForm(f => ({ ...f, priceOverrides: [...(f.priceOverrides || []), { site: SITES[0], price: '' }] }))}>+ Add Override</Btn>
            </div>

            <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 14, marginTop: 4 }}>
              <div style={{ fontSize: 11, color: t.text3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 }}>Promotional Pricing</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: t.text }}>
                  <input type="checkbox" checked={!!form.promo?.active} onChange={e => setForm(f => ({ ...f, promo: { ...f.promo, active: e.target.checked } }))} />
                  Enable promo
                </label>
              </div>
              {form.promo?.active && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <Input t={t} label={`Promo price (${settings?.sym || '£'})`} value={form.promo?.price ?? ''} onChange={v => setForm(f => ({ ...f, promo: { ...f.promo, price: v } }))} type="number" />
                  <Input t={t} label="Start date" value={form.promo?.startDate ?? ''} onChange={v => setForm(f => ({ ...f, promo: { ...f.promo, startDate: v } }))} type="date" />
                  <Input t={t} label="End date" value={form.promo?.endDate ?? ''} onChange={v => setForm(f => ({ ...f, promo: { ...f.promo, endDate: v } }))} type="date" />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, color: t.text3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7 }}>Product Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, padding: '10px 14px', color: t.text, fontSize: 13, outline: 'none' }} />
              {form.image && (
                <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.border}` }}>
                  <img src={form.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
            <Btn t={t} onClick={save} disabled={!form.name || !form.price}>{editP ? 'Update' : 'Add Product'}</Btn>
          </div>
        </Modal>
      )}

      {showBulkImport && (
        <Modal t={t} title="Bulk Import Products" subtitle="CSV format: Name,SKU,Category,Price,Stock[,Description]" onClose={() => { setShowBulkImport(false); setBulkData(''); setImportErrors([]) }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <textarea
              value={bulkData} onChange={e => setBulkData(e.target.value)}
              placeholder={`Home Jersey 2024,JRS-HOME-24,Jerseys,89.99,45,Official 2024 home kit\nAway Jersey 2024,JRS-AWAY-24,Jerseys,89.99,32,Official 2024 away kit`}
              style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, padding: '12px 14px', color: t.text, fontSize: 13, outline: 'none', minHeight: 120, fontFamily: 'monospace' }}
            />
            <div style={{ fontSize: 12, color: t.text3 }}>Enter one product per line. Categories: {parentCats.map(c => c.name).join(', ')}</div>
            {importErrors.length > 0 && (
              <div style={{ background: t.redBg, border: `1px solid ${t.redBorder}`, borderRadius: 9, padding: '10px 14px', fontSize: 12, color: t.red }}>
                {importErrors.map((err, i) => <div key={i}>• {err}</div>)}
              </div>
            )}
            <Btn t={t} onClick={bulkImport} disabled={!bulkData.trim()}>📤 Import Products</Btn>
          </div>
        </Modal>
      )}

      {showPriceOverride && (
        <Modal t={t} title="Manager Price Override" subtitle={`Override price for ${showPriceOverride.name} (current: ${fmt(showPriceOverride.price, settings?.sym)})`} onClose={() => { setShowPriceOverride(null); setPriceOverrideForm({ newPrice: '', reason: '', pin: '' }) }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input t={t} label={`New price (${settings?.sym || '£'})`} value={priceOverrideForm.newPrice} onChange={v => setPriceOverrideForm(f => ({ ...f, newPrice: v }))} type="number" required />
            <Input t={t} label="Reason" value={priceOverrideForm.reason} onChange={v => setPriceOverrideForm(f => ({ ...f, reason: v }))} placeholder="e.g. Price match, damaged stock" required />
            <Input t={t} label="Manager PIN (4 digits)" value={priceOverrideForm.pin} onChange={v => setPriceOverrideForm(f => ({ ...f, pin: v.replace(/\D/g, '').slice(0, 4) }))} placeholder="••••" type="password" required />
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn t={t} variant="ghost" onClick={() => { setShowPriceOverride(null); setPriceOverrideForm({ newPrice: '', reason: '', pin: '' }) }} style={{ flex: 1 }}>Cancel</Btn>
              <Btn t={t} onClick={confirmPriceOverride} disabled={!priceOverrideForm.newPrice || !priceOverrideForm.reason || String(priceOverrideForm.pin).length !== 4} style={{ flex: 1 }}>Confirm Override</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
