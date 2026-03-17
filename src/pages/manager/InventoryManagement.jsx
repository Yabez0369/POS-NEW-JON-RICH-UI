import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Btn, Input, Badge, Card, StatCard, Modal, Table, Select } from '@/components/ui'
import { notify, ImgWithFallback } from '@/components/shared'
import { fmt, ts } from '@/lib/utils'
import { PRODUCT_IMAGES } from '@/lib/seed-data'

const DEFAULT_REORDER = 10

export function InventoryManagement({ products, setProducts, addAudit, currentUser, t: tProp }) {
  const navigate = useNavigate()
  const { t: tTheme } = useTheme()
  const { currentUser: authUser } = useAuth()
  const t = tProp ?? tTheme

  const [editStock, setEditStock] = useState(null)
  const [ns, setNs] = useState('')
  const [addQ, setAddQ] = useState('')
  const [showReceiving, setShowReceiving] = useState(false)
  const [receivingForm, setReceivingForm] = useState({ productId: '', qty: '', notes: '' })
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
  const totalUnits = products.reduce((s, p) => s + p.stock, 0)

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

  const handleReceiving = () => {
    const product = products.find(p => String(p.id) === receivingForm.productId)
    if (!product) { notify('Select a product', 'error'); return }
    const qty = parseInt(receivingForm.qty)
    if (!qty || qty <= 0) { notify('Enter a valid quantity', 'error'); return }

    const newStock = product.stock + qty
    applyStockChange(product.id, newStock, 'Goods Received', receivingForm.notes ? `+${qty} — ${receivingForm.notes}` : `+${qty}`)
    notify(`Received ${qty}× ${product.name}`, 'success')
    setShowReceiving(false)
    setReceivingForm({ productId: '', qty: '', notes: '' })
  }

  const handleUpdateStock = () => {
    const q = Math.max(0, ns !== '' ? +ns : editStock.stock + (+addQ || 0))
    applyStockChange(editStock.id, q, 'Stock Updated', `${editStock.name} → ${q}`)
    notify(`Stock updated to ${q}`, 'success')
    setEditStock(null)
  }

  const getStatusBadge = (p) => {
    const rop = getReorder(p)
    if (p.stock === 0) return { text: 'Out', color: 'red' }
    if (p.stock <= Math.min(5, rop * 0.5)) return { text: 'Critical', color: 'red' }
    if (p.stock <= rop) return { text: 'Low', color: 'yellow' }
    return { text: 'Good', color: 'green' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: t.text }}>Inventory</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn t={t} variant="secondary" onClick={() => setShowReceiving(true)}>📥 Goods Receiving</Btn>
          <Btn t={t} variant="secondary" onClick={() => navigate('/app/stocktake')}>📋 Stocktake</Btn>
          <Btn t={t} variant="secondary" onClick={() => navigate('/app/stock-transfer')}>🔄 Transfer Stock</Btn>
          <Btn t={t} variant="secondary" onClick={() => navigate('/app/damage-lost')}>🔴 Damaged/Lost</Btn>
        </div>
      </div>

      {/** 1. Stock overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(180px,45vw),1fr))', gap: 14 }}>
        <StatCard t={t} title="Total Items" value={products.length} color={t.blue} icon="📦" />
        <StatCard t={t} title="Total Units" value={totalUnits} color={t.green} icon="🔢" />
        <StatCard t={t} title="Low Stock" value={lowStockCount} color={t.yellow} icon="⚠️" />
        <StatCard t={t} title="Out of Stock" value={outOfStockCount} color={t.red} icon="❌" />
      </div>

      {/** 7. Low stock alerts section */}
      {lowStockProducts.length > 0 && (
        <Card t={t} style={{ padding: 16, borderLeft: `4px solid ${t.yellow}` }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 12 }}>⚠️ Low Stock Alerts</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {lowStockProducts.sort((a, b) => a.stock - b.stock).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.bg3, padding: '8px 12px', borderRadius: 8 }}>
                <span style={{ fontWeight: 600, color: t.text }}>{p.emoji} {p.name}</span>
                <Badge t={t} text={`${p.stock} / ${getReorder(p)}`} color={p.stock === 0 ? 'red' : 'yellow'} />
                <Btn t={t} variant="secondary" size="sm" onClick={() => { setEditStock(p); setNs(String(p.stock)); setAddQ('') }}>Update</Btn>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/** 2. Product table */}
      <Card t={t} style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          t={t}
          cols={['Product', 'SKU', 'Stock', 'Reorder Point', 'Status', 'Action']}
          rows={products.map(p => {
            const sb = getStatusBadge(p)
            return [
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ImgWithFallback src={PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                <span style={{ fontWeight: 600, color: t.text }}>{p.name}</span>
              </div>,
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: t.text3 }}>{p.sku}</span>,
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
        <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 12 }}>📜 Movement Audit Trail</div>
        {movements.length === 0 ? (
          <div style={{ color: t.text3, fontSize: 13 }}>No movements recorded yet. Stock actions will appear here.</div>
        ) : (
          <Table
            t={t}
            cols={['Type', 'Product', 'Quantity', 'User', 'Timestamp']}
            rows={movements.slice(0, 20).map(m => [
              <Badge t={t} text={m.type} color={m.type === 'Goods Received' ? 'green' : m.type === 'Damaged/Lost' ? 'red' : m.type === 'Stocktake Adjustment' ? 'blue' : 'teal'} />,
              <span style={{ fontWeight: 600, color: t.text }}>{m.productName}</span>,
              <span style={{ fontWeight: 700, color: m.quantity >= 0 ? t.green : t.red }}>{m.quantity >= 0 ? '+' : ''}{m.quantity}</span>,
              <span style={{ fontSize: 12, color: t.text3 }}>{m.user}</span>,
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: t.text4 }}>{m.timestamp}</span>,
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

      {/** 5. Goods receiving modal */}
      {showReceiving && (
        <Modal t={t} title="Goods Receiving" onClose={() => setShowReceiving(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: t.greenBg || t.bg3, border: `1px solid ${t.green || t.border}`, borderRadius: 9, padding: '10px 14px', fontSize: 12, color: t.green }}>
              📥 Record incoming stock. Add quantity and optional notes.
            </div>
            <Select
              t={t} label="Product"
              value={receivingForm.productId}
              onChange={v => setReceivingForm(f => ({ ...f, productId: v }))}
              options={[{ value: '', label: '— Select Product —' }, ...products.map(p => ({ value: String(p.id), label: `${p.emoji} ${p.name} (current: ${p.stock})` }))]}
            />
            <Input t={t} label="Quantity Received" value={receivingForm.qty} onChange={v => setReceivingForm(f => ({ ...f, qty: v }))} type="number" placeholder="Units to add" />
            <Input t={t} label="Notes (optional)" value={receivingForm.notes} onChange={v => setReceivingForm(f => ({ ...f, notes: v }))} placeholder="e.g. PO-12345, delivery date" />
            <Btn t={t} onClick={handleReceiving} disabled={!receivingForm.productId || !receivingForm.qty}>
              📥 Record Receipt
            </Btn>
          </div>
        </Modal>
      )}

    </div>
  )
}
