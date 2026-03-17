import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Btn, Input, Badge, Card, Modal, Table, Select } from '@/components/ui'
import { notify } from '@/components/shared'
import { ts, genId } from '@/lib/utils'

// Sample data for demo
const INITIAL_TRANSFERS = [
  { id: genId('trn'), productId: 1, productName: "Home Jersey 2024", quantity: 5, fromOutlet: "Main Stadium Store", toOutlet: "East Wing Megastore", date: "2024-01-14", operator: "Alex Rivera", status: "completed" },
  { id: genId('trn'), productId: 4, productName: "Training Jacket", quantity: 3, fromOutlet: "Airport Pop-up", toOutlet: "Main Stadium Store", date: "2024-01-13", operator: "Sam Chen", status: "completed" },
  { id: genId('trn'), productId: 6, productName: "Football Scarf", quantity: 10, fromOutlet: "East Wing Megastore", toOutlet: "Airport Pop-up", date: "2024-01-12", operator: "Jordan Lee", status: "pending" },
]

const SAMPLE_PRODUCTS = [
  { id: 1, name: "Home Jersey 2024", stock: 45 },
  { id: 2, name: "Away Jersey 2024", stock: 32 },
  { id: 3, name: "Third Kit Jersey", stock: 18 },
  { id: 4, name: "Training Jacket", stock: 27 },
  { id: 5, name: "Training Shorts", stock: 41 },
  { id: 6, name: "Football Scarf", stock: 120 },
  { id: 7, name: "Team Cap", stock: 85 },
  { id: 8, name: "Fan Hoodie", stock: 33 },
  { id: 9, name: "Match Ball Official", stock: 12 },
  { id: 10, name: "Goalkeeper Gloves", stock: 8 },
  { id: 11, name: "Shin Guards Pro", stock: 55 },
  { id: 12, name: "Signed Jersey", stock: 3 },
]

const OUTLETS = ['Main Stadium Store', 'East Wing Megastore', 'Airport Pop-up']
const STATUSES = ['pending', 'in-transit', 'completed', 'cancelled']

export default function StockTransferManagement() {
  const navigate = useNavigate()
  const { t } = useTheme()
  const { currentUser } = useAuth()
  
  const [transfers, setTransfers] = useState(INITIAL_TRANSFERS)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  
  const [form, setForm] = useState({
    productId: '',
    quantity: '',
    fromOutlet: '',
    toOutlet: '',
    notes: ''
  })
  
  const [errors, setErrors] = useState({})

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {}
    if (!form.productId) newErrors.productId = 'Product is required'
    if (!form.quantity || form.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0'
    if (!form.fromOutlet) newErrors.fromOutlet = 'From outlet is required'
    if (!form.toOutlet) newErrors.toOutlet = 'To outlet is required'
    if (form.fromOutlet === form.toOutlet) newErrors.toOutlet = 'Cannot transfer to same outlet'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      notify('Please fix the errors in the form', 'error')
      return
    }

    const product = SAMPLE_PRODUCTS.find(p => String(p.id) === String(form.productId))
    if (!product) {
      notify('Product not found', 'error')
      return
    }

    if (form.quantity > product.stock) {
      notify(`Only ${product.stock} available in stock`, 'error')
      return
    }

    if (editingId) {
      // Update existing
      setTransfers(prev => prev.map(t => 
        t.id === editingId 
          ? { ...t, ...form, productName: product.name, status: t.status }
          : t
      ))
      notify('Transfer updated successfully', 'success')
    } else {
      // Create new
      const newTransfer = {
        id: genId('trn'),
        ...form,
        productName: product.name,
        date: ts().split(',')[0],
        operator: currentUser?.name || 'System',
        status: 'pending'
      }
      setTransfers(prev => [newTransfer, ...prev])
      notify(`Transfer initiated: ${form.quantity}× ${product.name} from ${form.fromOutlet} to ${form.toOutlet}`, 'success')
    }

    // Reset
    setForm({ productId: '', quantity: '', fromOutlet: '', toOutlet: '', notes: '' })
    setErrors({})
    setShowModal(false)
    setEditingId(null)
  }, [form, editingId, validateForm, currentUser])

  // Handle edit
  const handleEdit = useCallback((transfer) => {
    setEditingId(transfer.id)
    setForm({
      productId: transfer.productId,
      quantity: transfer.quantity,
      fromOutlet: transfer.fromOutlet,
      toOutlet: transfer.toOutlet,
      notes: transfer.notes || ''
    })
    setShowModal(true)
  }, [])

  // Update status
  const updateStatus = useCallback((id, newStatus) => {
    setTransfers(prev => prev.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    ))
    notify(`Transfer status updated to ${newStatus}`, 'success')
  }, [])

  // Handle delete
  const handleDelete = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      setTransfers(prev => prev.filter(t => t.id !== id))
      notify('Transfer deleted successfully', 'success')
    }
  }, [])

  // Close modal
  const closeModal = useCallback(() => {
    setShowModal(false)
    setForm({ productId: '', quantity: '', fromOutlet: '', toOutlet: '', notes: '' })
    setErrors({})
    setEditingId(null)
  }, [])

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    if (filterStatus === 'All') return transfers
    return transfers.filter(t => t.status === filterStatus)
  }, [transfers, filterStatus])

  // Table rows
  const tableRows = filteredTransfers.map(transfer => [
    transfer.productName,
    transfer.quantity.toString(),
    transfer.fromOutlet,
    transfer.toOutlet,
    transfer.date,
    <Badge key={transfer.id} label={transfer.status} color={
      transfer.status === 'completed' ? '#10b981' :
      transfer.status === 'in-transit' ? '#3b82f6' :
      transfer.status === 'pending' ? '#f59e0b' :
      '#6b7280'
    } t={t} />,
    <div key={transfer.id} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {transfer.status !== 'completed' && transfer.status !== 'cancelled' && (
        <select
          value={transfer.status}
          onChange={(e) => updateStatus(transfer.id, e.target.value)}
          style={{
            background: t.input,
            border: `1px solid ${t.border}`,
            color: t.text,
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      )}
      <button onClick={() => handleEdit(transfer)} style={{
        background: t.bg3, border: `1px solid ${t.border}`, color: t.text3, cursor: 'pointer',
        padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, minWidth: 60
      }}>Edit</button>
      <button onClick={() => handleDelete(transfer.id)} style={{
        background: t.red + '20', border: `1px solid ${t.red}`, color: t.red, cursor: 'pointer',
        padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, minWidth: 60
      }}>Delete</button>
    </div>
  ])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 'clamp(16px, 4vw, 28px)', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: t.text }}>🔄 Stock Transfer</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn t={t} variant="secondary" onClick={() => navigate('/app/inventory')}>📥 Goods Receiving</Btn>
          <Btn t={t} variant="secondary" onClick={() => navigate('/app/stocktake')}>📋 Stocktake</Btn>
          <Btn t={t} onClick={() => {}} disabled>🔄 Transfer Stock</Btn>
          <Btn t={t} variant="secondary" onClick={() => navigate('/app/damage-lost')}>🔴 Damaged/Lost</Btn>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <Card t={t} style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: t.text3, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.7, marginBottom: 8 }}>Total Transfers</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: t.text }}>{transfers.length}</div>
        </Card>
        <Card t={t} style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: t.text3, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.7, marginBottom: 8 }}>Pending</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#f59e0b' }}>{transfers.filter(t => t.status === 'pending').length}</div>
        </Card>
        <Card t={t} style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: t.text3, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.7, marginBottom: 8 }}>In Transit</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#3b82f6' }}>{transfers.filter(t => t.status === 'in-transit').length}</div>
        </Card>
        <Card t={t} style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: t.text3, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.7, marginBottom: 8 }}>Completed</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#10b981' }}>{transfers.filter(t => t.status === 'completed').length}</div>
        </Card>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24, '@media(min-width:640px)': { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } }}>
        <Btn onClick={() => setShowModal(true)} t={t} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700 }}>
          ➕ New Transfer
        </Btn>
        
        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { label: 'All Status', value: 'All' },
            { label: 'Pending', value: 'pending' },
            { label: 'In Transit', value: 'in-transit' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' }
          ]}
          t={t}
          label="Filter"
        />
      </div>

      {/* Table */}
      <Card t={t} style={{ padding: 0, overflow: 'hidden' }}>
        <Table 
          cols={['Product Name', 'Qty', 'From', 'To', 'Date', 'Status', 'Actions']}
          rows={tableRows}
          empty="No stock transfers found"
          t={t}
        />
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal 
          title={editingId ? 'Edit Transfer' : 'New Stock Transfer'} 
          onClose={closeModal} 
          t={t} 
          width={520}
          subtitle={editingId ? 'Update the transfer details' : 'Create a new stock transfer'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Product Select */}
            <div>
              <Select
                label="Product Name"
                value={form.productId}
                onChange={(val) => {
                  setForm(prev => ({ ...prev, productId: val }))
                  setErrors(prev => ({ ...prev, productId: '' }))
                }}
                options={[
                  { label: 'Select a product...', value: '' },
                  ...SAMPLE_PRODUCTS.map(p => ({ label: `${p.name} (${p.stock} available)`, value: p.id }))
                ]}
                t={t}
              />
              {errors.productId && <div style={{ fontSize: 12, color: t.red, marginTop: 4 }}>⚠ {errors.productId}</div>}
            </div>

            {/* Quantity */}
            <div>
              <Input
                label="Quantity"
                type="number"
                value={form.quantity}
                onChange={(val) => {
                  setForm(prev => ({ ...prev, quantity: parseInt(val) || '' }))
                  setErrors(prev => ({ ...prev, quantity: '' }))
                }}
                placeholder="Enter quantity"
                required
                t={t}
              />
              {errors.quantity && <div style={{ fontSize: 12, color: t.red, marginTop: 4 }}>⚠ {errors.quantity}</div>}
            </div>

            {/* From Outlet */}
            <div>
              <Select
                label="From Outlet"
                value={form.fromOutlet}
                onChange={(val) => {
                  setForm(prev => ({ ...prev, fromOutlet: val }))
                  setErrors(prev => ({ ...prev, fromOutlet: '' }))
                }}
                options={[
                  { label: 'Select outlet...', value: '' },
                  ...OUTLETS.map(outlet => ({ label: outlet, value: outlet }))
                ]}
                t={t}
              />
              {errors.fromOutlet && <div style={{ fontSize: 12, color: t.red, marginTop: 4 }}>⚠ {errors.fromOutlet}</div>}
            </div>

            {/* To Outlet */}
            <div>
              <Select
                label="To Outlet"
                value={form.toOutlet}
                onChange={(val) => {
                  setForm(prev => ({ ...prev, toOutlet: val }))
                  setErrors(prev => ({ ...prev, toOutlet: '' }))
                }}
                options={[
                  { label: 'Select outlet...', value: '' },
                  ...OUTLETS.map(outlet => ({ label: outlet, value: outlet }))
                ]}
                t={t}
              />
              {errors.toOutlet && <div style={{ fontSize: 12, color: t.red, marginTop: 4 }}>⚠ {errors.toOutlet}</div>}
            </div>

            {/* Notes */}
            <div>
              <label style={{ fontSize: 11, color: t.text3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, display: 'block', marginBottom: 5 }}>Notes (Optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this transfer..."
                style={{
                  background: t.input,
                  border: `1px solid ${t.border}`,
                  borderRadius: 9,
                  padding: 12,
                  color: t.text,
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'inherit',
                  minHeight: 80,
                  resize: 'vertical',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <Btn onClick={closeModal} t={t} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700, background: t.bg3, color: t.text3 }}>
                Cancel
              </Btn>
              <Btn onClick={handleSubmit} t={t} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700 }}>
                {editingId ? 'Update Transfer' : 'Create Transfer'}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        @media (max-width: 640px) {
          [style*="flexDirection: row"] {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  )
}
