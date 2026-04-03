import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Btn, Input, Badge, Card, StatCard, Modal, Table, Select } from '@/components/ui'
import { notify } from '@/components/shared'
import { fmt, ts } from '@/lib/utils'
import { inventoryService, serialsService } from '@/services'
import { isSupabaseConfigured } from '@/lib/supabase'
import { InventoryHeader } from '@/components/inventory/InventoryHeader'

const DEFAULT_REORDER = 10

export function InventoryManagement({ products, setProducts, addAudit, currentUser, t: tProp, siteId }) {
  const navigate = useNavigate()
  const { t: tTheme } = useTheme()
  const { currentUser: authUser } = useAuth()
  const t = tProp ?? tTheme

  const [editStock, setEditStock] = useState(null)
  const [ns, setNs] = useState('')
  const [addQ, setAddQ] = useState('')
  const [showReceiving, setShowReceiving] = useState(false)
  const [receivingForm, setReceivingForm] = useState({ productId: '', qty: '', fromOutlet: '', notes: '', serials: [] })
  const [showSerialLookup, setShowSerialLookup] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const location = useLocation()

  useEffect(() => {
    if (location.state?.openReceiving) {
      setShowReceiving(true)
      navigate(location.pathname, { replace: true, state: {} })
    } else if (location.state?.openSerial) {
      setShowSerialLookup(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate, location.pathname])

  const [serialLookupInput, setSerialLookupInput] = useState('')
  const [serialLookupResult, setSerialLookupResult] = useState(undefined)
  const [movements, setMovements] = useState([])

  const user = currentUser ?? authUser
  const userName = user?.name || 'System'
  const sites = ['Main Stadium Store', 'East Wing Megastore', 'Airport Pop-up']

  const getReorder = (p) => p.reorderPoint ?? DEFAULT_REORDER
  const isLowStock = (p) => p.stock > 0 && p.stock <= getReorder(p)
  const isOutOfStock = (p) => p.stock === 0
  const lowStockProducts = products.filter(isLowStock)
  const outOfStockCount = products.filter(isOutOfStock).length
  const lowStockCount = lowStockProducts.length
  const totalUnits = products.reduce((s, p) => s + (p.stock || 0), 0)

  const effectiveSiteId = siteId || 'b0000000-0000-0000-0000-000000000001'

  const addMovement = (type, productName, productId, quantity, details = '') => {
    setMovements(m => [{ id: `mov-${Date.now()}`, type, productName, productId, quantity, user: userName, timestamp: ts(), details }, ...m].slice(0, 100))
  }

  const applyStockChange = (productId, newStock, type, details) => {
    const product = products.find(p => String(p.id) === String(productId))
    if (!product) return
    const prevStock = product.stock
    setProducts(ps => ps.map(p => String(p.id) === String(productId) ? { ...p, stock: Math.max(0, newStock) } : p))
    addAudit(user, type, 'Inventory', details || `${product.name}: ${prevStock} → ${newStock}`)
    addMovement(type, product.name, productId, newStock - prevStock, details)
  }

  const handleReceiving = async () => {
    const product = products.find(p => String(p.id) === receivingForm.productId)
    if (!product) { notify('Select a product', 'error'); return }
    const qty = parseInt(receivingForm.qty)
    if (!qty || qty <= 0) { notify('Enter a valid quantity', 'error'); return }
    const trackSerial = product.track_serial
    const serials = (receivingForm.serials || []).map(s => String(s).trim()).filter(Boolean)
    if (trackSerial && serials.length !== qty) {
      notify(`Enter ${qty} serial number(s) for this product`, 'error')
      return
    }
    const newStock = product.stock + qty
    try {
      if (isSupabaseConfigured()) {
        await inventoryService.receiveStock(product.id, effectiveSiteId, qty, receivingForm.notes, user?.id)
        if (trackSerial && serials.length) {
          await serialsService.registerSerials(product.id, effectiveSiteId, serials)
        }
      }
      applyStockChange(product.id, newStock, 'Goods Received', receivingForm.notes ? `+${qty} — ${receivingForm.notes}` : `+${qty}`)
      notify(`Received ${qty}× ${product.name}`, 'success')
      setShowReceiving(false)
      setReceivingForm({ productId: '', qty: '', fromOutlet: '', notes: '', serials: [] })
    } catch (err) {
      notify(err?.message || 'Failed to record receipt', 'error')
    }
  }

  const handleUpdateStock = async () => {
    const q = Math.max(0, ns !== '' ? +ns : editStock.stock + (+addQ || 0))
    try {
      if (isSupabaseConfigured()) {
        await inventoryService.adjustStock(editStock.id, effectiveSiteId, q, 'adjust', `${editStock.name} → ${q}`, user?.id)
      }
      applyStockChange(editStock.id, q, 'Stock Updated', `${editStock.name} → ${q}`)
      notify(`Stock updated to ${q}`, 'success')
      setEditStock(null)
    } catch (err) {
      notify(err?.message || 'Failed to update stock', 'error')
    }
  }

  const getStatusBadge = (p) => {
    const rop = getReorder(p)
    if (p.stock === 0) return { text: 'Out', color: 'red' }
    if (p.stock <= Math.min(5, rop * 0.5)) return { text: 'Critical', color: 'red' }
    if (p.stock <= rop) return { text: 'Low', color: 'yellow' }
    return { text: 'Good', color: 'green' }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 'clamp(16px, 4vw, 28px)', maxWidth: 1400, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <InventoryHeader title="Inventory" t={t} activePage="inventory" onGoodsReceiving={() => setShowReceiving(true)} onSerialLookup={() => setShowSerialLookup(true)} />

      {/** 1. Stock overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(260px,45vw),1fr))', gap: 14 }}>
        <StatCard t={t} title="Total Items" value={products.length} color={t.text} icon="📦" />
        <StatCard t={t} title="Total Units" value={totalUnits} color={t.text} icon="🔢" />
        <StatCard t={t} title="Low Stock" value={lowStockCount} color={t.text2} icon="⚠️" />
        <StatCard t={t} title="Out of Stock" value={outOfStockCount} color={t.text2} icon="❌" />
      </div>

      {/** 7. Low stock alerts section */}
      {lowStockProducts.length > 0 && (
        <Card t={t} style={{ padding: 16, borderLeft: `4px solid ${t.yellow}` }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#93c5fd', marginBottom: 12 }}>⚠️ Low Stock Alerts</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {lowStockProducts.sort((a, b) => a.stock - b.stock).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 8, border: `1px solid rgba(255,255,255,0.08)` }}>
                {p.image_url || p.image ? (
                  <img src={p.image_url || p.image} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 16 }}>📦</span>
                )}
                <span style={{ fontWeight: 600, color: '#f0f4ff' }}>{p.name}</span>
                <Badge t={t} text={`${p.stock} / ${getReorder(p)}`} color={p.stock === 0 ? 'red' : 'yellow'} />
                <Btn t={t} variant="secondary" size="sm" onClick={() => { setEditStock(p); setNs(String(p.stock)); setAddQ('') }}>Update</Btn>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/** Search Bar */}
      <div style={{ maxWidth: 400 }}>
        <Input
          t={t}
          placeholder="🔍 Search by product name or SKU..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/** 2. Product table */}
      <Card t={t} style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          t={t}
          cols={['Product', 'SKU', 'Stock', 'Reorder Point', 'Status', 'Action']}
          rows={filteredProducts.map(p => {
            const sb = getStatusBadge(p)
            return [
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {p.image_url || p.image ? (
                  <img src={p.image_url || p.image} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', background: '#f8fafc' }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📦</div>
                )}
                <span style={{ fontWeight: 600, color: t.text }}>{p.name}</span>
              </div>,
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: t.text4 }}>{p.sku}</span>,
              <span style={{ fontWeight: 900, fontSize: 15, color: p.stock === 0 ? t.red : isLowStock(p) ? t.yellow : t.green }}>{p.stock}</span>,
              <span style={{ fontSize: 13, color: t.text3 }}>{getReorder(p)}</span>,
              <Badge t={t} text={sb.text} color={sb.color} />,
              <Btn t={t} variant="secondary" size="sm" onClick={() => { setEditStock(p); setNs(String(p.stock)); setAddQ('') }}>Update</Btn>,
            ]
          })}
        />
      </Card>

      {/** 9. Movement audit trail */}
      <Card t={t} style={{ padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#93c5fd', marginBottom: 12 }}>📜 Movement Audit Trail</div>
        {movements.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: 13 }}>No movements recorded yet. Stock actions will appear here.</div>
        ) : (
          <Table
            t={t}
            cols={['Type', 'Product', 'Quantity', 'User', 'Timestamp']}
            rows={movements.slice(0, 20).map(m => [
              <Badge t={t} text={m.type} color={m.type === 'Goods Received' ? 'green' : m.type === 'Damaged/Lost' ? 'red' : m.type === 'Stocktake Adjustment' ? 'blue' : 'teal'} />,
              <span style={{ fontWeight: 600, color: '#f0f4ff' }}>{m.productName}</span>,
              <span style={{ fontWeight: 700, color: m.quantity >= 0 ? t.green : t.red }}>{m.quantity >= 0 ? '+' : ''}{m.quantity}</span>,
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{m.user}</span>,
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>{m.timestamp}</span>,
            ])}
          />
        )}
      </Card>

      {/** 3. Update stock modal */}
      {editStock && (
        <Modal t={t} title={`Update Stock: ${editStock.name}`} onClose={() => setEditStock(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: t.bg3, padding: '12px 16px', borderRadius: 8, fontSize: 13 }}>
              Current: <strong style={{ color: t.text }}>{editStock.stock} units</strong>
            </div>
            <Input t={t} label="Set Exact Stock" value={ns} onChange={setNs} type="number" />
            <Input t={t} label="Or Add/Remove (+/-)" value={addQ} onChange={setAddQ} placeholder="e.g. +20 or -5" />
            <Btn t={t} onClick={handleUpdateStock}>Save</Btn>
          </div>
        </Modal>
      )}

      {/** Serial lookup modal */}
      {showSerialLookup && (
        <Modal t={t} title="Serial Number Lookup" onClose={() => { setShowSerialLookup(false); setSerialLookupResult(undefined); setSerialLookupInput('') }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input t={t} label="Serial number" value={serialLookupInput} onChange={v => { setSerialLookupInput(v); setSerialLookupResult(undefined) }} placeholder="Enter serial to lookup" />
            <Btn t={t} onClick={async () => { const r = await serialsService.lookupSerial(serialLookupInput); setSerialLookupResult(r ?? null) }} disabled={!serialLookupInput.trim()}>Lookup</Btn>
            {serialLookupResult && typeof serialLookupResult === 'object' && (
              <div style={{ background: t.bg3, borderRadius: 10, padding: 16, border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: t.text3, marginBottom: 8 }}>Result</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{serialLookupResult.name}</div>
                <div style={{ fontSize: 12, color: t.text3, marginTop: 4 }}>SKU: {serialLookupResult.sku}</div>
                <Badge t={t} text={serialLookupResult.serial_status || 'unknown'} color={serialLookupResult.serial_status === 'in_stock' ? 'green' : serialLookupResult.serial_status === 'sold' ? 'blue' : 'yellow'} style={{ marginTop: 8 }} />
              </div>
            )}
            {serialLookupResult === null && <div style={{ fontSize: 13, color: t.text3 }}>Serial not found</div>}
          </div>
        </Modal>
      )}

      {/** 5. Goods receiving modal */}
      {showReceiving && (
        <Modal t={t} title="Goods Receiving" onClose={() => setShowReceiving(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: t.greenBg || t.bg3, border: `1px solid ${t.green || t.border}`, borderRadius: 9, padding: '10px 14px', fontSize: 12, color: t.green }}>📥 Record incoming stock.</div>
            <Select t={t} label="Product" value={receivingForm.productId} onChange={v => setReceivingForm(f => ({ ...f, productId: v, serials: [] }))} options={[{ value: '', label: '— Select Product —' }, ...products.map(p => ({ value: String(p.id), label: `${p.emoji} ${p.name}` }))]} />
            <Input t={t} label="Quantity Received" value={receivingForm.qty} onChange={v => { const qty = parseInt(v) || 0; setReceivingForm(f => ({ ...f, qty: v, serials: Array.from({ length: qty }, (_, i) => f.serials[i] || '') })) }} type="number" />
            <Select t={t} label="Receive stock from" value={receivingForm.fromOutlet} onChange={v => setReceivingForm(f => ({ ...f, fromOutlet: v }))} options={[{ value: '', label: '— Select Outlet —' }, ...sites.map(s => ({ value: s, label: s }))]} />
            <Input t={t} label="Notes (optional)" value={receivingForm.notes} onChange={v => setReceivingForm(f => ({ ...f, notes: v }))} />
            <Btn t={t} onClick={handleReceiving} disabled={!receivingForm.productId || !receivingForm.qty}>📥 Record Receipt</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
