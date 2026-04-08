import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Btn, Input, Badge, Card, StatCard, Modal, Table, Select } from '@/components/ui'
import { notify } from '@/components/shared'
import { ts } from '@/lib/utils'
import { inventoryService, productsService, sitesService } from '@/services'
import { useQuery } from '@tanstack/react-query'
import { InventoryHeader } from '@/components/inventory/InventoryHeader'

const STATUSES = ['pending', 'in-transit', 'completed', 'cancelled']

export default function StockTransferManagement() {
  const navigate = useNavigate()
  const { t } = useTheme()
  const { currentUser } = useAuth()

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch data
  const { data: dbProducts = [] } = useQuery({ queryKey: ['products'], queryFn: productsService.fetchProducts })
  const { data: dbSites = [] } = useQuery({ queryKey: ['sites'], queryFn: sitesService.fetchSites })
  const { data: movements = [], refetch: refetchMovements } = useQuery({
    queryKey: ['inventory_movements', 'transfer'],
    queryFn: () => inventoryService.fetchMovements(null, null).then(data => data.filter(m => m.movement_type === 'transfer'))
  })

  // Derived movements
  const transferItems = useMemo(() => movements || [], [movements])

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
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      notify('Please fix the errors in the form', 'error')
      return
    }

    const product = dbProducts.find(p => p.id === form.productId)
    if (!product) {
      notify('Product not found', 'error')
      return
    }

    try {
      await inventoryService.transferStock(
        form.productId,
        form.fromOutlet, // site_id
        form.toOutlet,   // site_id
        form.quantity,
        form.notes,
        currentUser?.id
      )

      notify(`Transfer initiated: ${form.quantity}× ${product.name}`, 'success')
      refetchMovements()

      // Reset
      setForm({ productId: '', quantity: '', fromOutlet: '', toOutlet: '', notes: '' })
      setErrors({})
      setShowModal(false)
      setEditingId(null)
    } catch (err) {
      notify('Failed to initiate transfer: ' + err.message, 'error')
    }
  }, [form, editingId, validateForm, currentUser, dbProducts, refetchMovements])

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

  // Update status (Note: Currently movements are read-only, status updates would need a service)
  const updateStatus = useCallback((id, newStatus) => {
    // This would call a service and then refetch
    notify(`Status update to ${newStatus} is handled on the backend`, 'info')
  }, [])

  // Handle delete
  const handleDelete = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      // Call service and refetch
      notify('Delete functionality to be implemented in service', 'info')
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
    let items = transferItems
    if (filterStatus !== 'All') {
      items = items.filter(t => t.status === filterStatus)
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      items = items.filter(t =>
        (t.product?.name || '').toLowerCase().includes(s) ||
        (t.notes || '').toLowerCase().includes(s)
      )
    }
    return items
  }, [transferItems, filterStatus, searchTerm])

  // Table rows
  const tableRows = filteredTransfers.map(transfer => [
    <div key={transfer.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {transfer.product?.image_url || transfer.product?.image ? (
        <img src={transfer.product?.image_url || transfer.product?.image} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
      ) : (
        <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📦</div>
      )}
      <span style={{ fontWeight: 600, color: t.text }}>{transfer.product?.name || 'Unknown Product'}</span>
    </div>,
    <span key={transfer.id} style={{ color: t.text2, fontWeight: 500 }}>{transfer.quantity.toString()}</span>,
    <span key={transfer.id} style={{ color: t.text3 }}>{transfer.from_site?.name || 'External/New'}</span>,
    <span key={transfer.id} style={{ color: t.text3 }}>{transfer.to_site?.name || 'External/Loss'}</span>,
    <span key={transfer.id} style={{ color: t.text4, fontSize: 12 }}>{new Date(transfer.created_at).toLocaleDateString()}</span>,
    <Badge key={transfer.id} label={transfer.movement_type} color={
      transfer.movement_type === 'transfer' ? '#3b82f6' : '#6b7280'
    } t={t} />,
    <div key={transfer.id} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button onClick={() => handleEdit(transfer)} style={{
        background: t.bg3, border: `1px solid ${t.border}`, color: t.text3, cursor: 'pointer',
        padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, minWidth: 60
      }}>View</button>
    </div>
  ])

  return (
    <div style={{ 
      background: 'transparent',
      minHeight: '100%', padding: '32px', borderRadius: 24,
      display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto', width: '100%', boxSizing: 'border-box' 
    }}>
      <InventoryHeader
        title="🔄 Stock Transfer"
        t={t}
        activePage="transfer"
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard t={t} title="Total Transfers" value={transferItems.length} icon="🔄" />
        <StatCard t={t} title="Pending" value={transferItems.filter(t => t.status === 'pending').length} color="#f59e0b" icon="⏳" />
        <StatCard t={t} title="In Transit" value={transferItems.filter(t => t.status === 'in-transit').length} color="#3b82f6" icon="🚚" />
        <StatCard t={t} title="Completed" value={transferItems.filter(t => t.status === 'completed').length} color="#10b981" icon="✅" />
      </div>

      {/* Controls */}
      <div className="controls-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
          <Btn onClick={() => setShowModal(true)} t={t} size="sm" style={{ minWidth: 140 }}>
            ➕ New Transfer
          </Btn>
          <div style={{ flex: 1, maxWidth: 500 }}>
            <Input
              t={t}
              placeholder="🔍 Search transfers by product or notes..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
        </div>

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
                  ...dbProducts.map(p => ({ label: `${p.name} (SKU: ${p.sku})`, value: p.id }))
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
                  ...dbSites.map(s => ({ label: s.name, value: s.id }))
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
                  ...dbSites.map(s => ({ label: s.name, value: s.id }))
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
        @media (min-width: 640px) {
          .controls-row {
            flex-direction: row !important;
            justify-content: space-between;
            align-items: center;
          }
          [style*="flexDirection: row"] {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  )
}
