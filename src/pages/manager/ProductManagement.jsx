import { useState } from 'react'
import { Btn, Input, Badge, Card, Modal, Table, Select } from '@/components/ui'
import { ImgWithFallback, notify } from '@/components/shared'
import { fmt } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import { PRODUCT_IMAGES } from '@/lib/seed-data'

const SITES = ['Main Store', 'Outdoor Kiosk', 'Warehouse']

export const ProductManagement = ({ products, setProducts, addAudit, currentUser, t }) => {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editP, setEditP] = useState(null)
  const empty = { name: '', sku: '', category: 'Jerseys', price: '', stock: '', emoji: '⚽', description: '', image: '', discount: 0, priceOverrides: [], promo: { price: '', startDate: '', endDate: '', active: false } }
  const [form, setForm] = useState(empty)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [bulkData, setBulkData] = useState('')
  const [importErrors, setImportErrors] = useState([])
  const [showPriceOverride, setShowPriceOverride] = useState(null)
  const [priceOverrideForm, setPriceOverrideForm] = useState({ newPrice: '', reason: '', pin: '' })

  const fil = products.filter(p =>
    (cat === 'All' || p.category === cat) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase()))
  )

  const save = () => {
    const priceOverrides = (form.priceOverrides || []).filter(o => o.site && o.price != null && o.price !== '')
    const promo = form.promo?.active && form.promo?.price != null && form.promo?.price !== ''
      ? { price: +form.promo.price, startDate: form.promo.startDate || null, endDate: form.promo.endDate || null, active: true }
      : { price: null, startDate: null, endDate: null, active: false }
    const payload = { ...form, price: +form.price, stock: +form.stock, discount: +(form.discount || 0), priceOverrides, promo }
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
    addAudit(currentUser, 'Price Override', 'Inventory', `Price Override: ${p.name} from ${fmt(p.price)} to ${fmt(newPrice)}. Reason: ${priceOverrideForm.reason}`)
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
      if (!CATEGORIES.includes(category)) {
        errors.push(`Line ${idx + 1}: Invalid category "${category}". Valid: ${CATEGORIES.filter(c => c !== 'All').join(', ')}`)
        return
      }

      newProducts.push({
        id: Date.now() + idx, name: name.trim(), sku: sku.trim(),
        category: category.trim(), price, stock, emoji: '📦',
        description: descParts.join(',').trim() || '', image: '',
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
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ padding: '7px 13px', borderRadius: 20, border: `1px solid ${cat === c ? t.accent : t.border}`, background: cat === c ? t.accent + '15' : 'transparent', color: cat === c ? t.accent : t.text3, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{c}</button>
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
            <Badge t={t} text={p.category} color="blue" />,
            <span style={{ fontWeight: 800, color: t.green }}>{fmt(p.price)}</span>,
            <span style={{ fontWeight: 700, color: (p.discount || 0) > 0 ? t.accent : t.text3 }}>{(p.discount || 0) > 0 ? '-' + p.discount + '%' : '—'}</span>,
            <Badge t={t} text={String(p.stock)} color={p.stock < 10 ? 'red' : p.stock < 20 ? 'yellow' : 'green'} />,
            <div style={{ display: 'flex', gap: 5 }}>
              <Btn t={t} variant="secondary" size="sm" onClick={() => {
                setEditP(p)
                setForm({
                  name: p.name, sku: p.sku || '', category: p.category, price: p.price, stock: p.stock, emoji: p.emoji,
                  description: p.description || '', image: p.image || '', discount: p.discount || 0,
                  priceOverrides: p.priceOverrides || [],
                  promo: p.promo ? { ...p.promo, price: p.promo.price ?? '', startDate: p.promo.startDate || '', endDate: p.promo.endDate || '', active: !!p.promo.active } : { price: '', startDate: '', endDate: '', active: false }
                })
                setShowForm(true)
              }}>Edit</Btn>
              <Btn t={t} variant="secondary" size="sm" onClick={() => { setShowPriceOverride(p); setPriceOverrideForm({ newPrice: '', reason: '', pin: '' }) }} title="Manager Price Override">£ Override</Btn>
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
              <Input t={t} label="SKU" value={form.sku} onChange={v => setForm(f => ({ ...f, sku: v }))} />
              <Input t={t} label="Price (£)" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} type="number" required />
              <Input t={t} label="Stock" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} type="number" required />
            </div>
            <Select t={t} label="Category" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} options={CATEGORIES.filter(c => c !== 'All').map(c => ({ value: c, label: c }))} />
            <Input t={t} label="Emoji" value={form.emoji} onChange={v => setForm(f => ({ ...f, emoji: v }))} />
            <Input t={t} label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
            <Input t={t} label="Discount %" value={form.discount || 0} onChange={v => setForm(f => ({ ...f, discount: Math.min(100, Math.max(0, +v)) }))} type="number" note="Set % discount on this product (0 = no discount)." />

            <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 14, marginTop: 4 }}>
              <div style={{ fontSize: 11, color: t.text3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 }}>Price Overrides (Outlet-specific)</div>
              {(form.priceOverrides || []).map((o, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}><Select t={t} label="Site" value={o.site} onChange={v => setForm(f => ({ ...f, priceOverrides: f.priceOverrides.map((x, i) => i === idx ? { ...x, site: v } : x) }))} options={SITES.map(s => ({ value: s, label: s }))} /></div>
                  <Input t={t} label="Price (£)" value={o.price} onChange={v => setForm(f => ({ ...f, priceOverrides: f.priceOverrides.map((x, i) => i === idx ? { ...x, price: v } : x) }))} type="number" />
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
                  <Input t={t} label="Promo price (£)" value={form.promo?.price ?? ''} onChange={v => setForm(f => ({ ...f, promo: { ...f.promo, price: v } }))} type="number" />
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
            <div style={{ fontSize: 12, color: t.text3 }}>Enter one product per line. Categories: {CATEGORIES.filter(c => c !== 'All').join(', ')}</div>
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
        <Modal t={t} title="Manager Price Override" subtitle={`Override price for ${showPriceOverride.name} (current: ${fmt(showPriceOverride.price)})`} onClose={() => { setShowPriceOverride(null); setPriceOverrideForm({ newPrice: '', reason: '', pin: '' }) }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input t={t} label="New price (£)" value={priceOverrideForm.newPrice} onChange={v => setPriceOverrideForm(f => ({ ...f, newPrice: v }))} type="number" required />
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
