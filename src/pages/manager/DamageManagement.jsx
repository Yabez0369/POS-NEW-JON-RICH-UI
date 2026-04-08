import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Btn, Input, Badge, Card, StatCard, Modal, Table, Select } from '@/components/ui'
import { notify } from '@/components/shared'
import { ts } from '@/lib/utils'
import { damageLostService, productsService, sitesService, inventoryService } from '@/services'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { InventoryHeader } from '@/components/inventory/InventoryHeader'

const TYPES = ['Damage', 'Lost']

export default function DamageManagement() {
  const navigate = useNavigate()
  const { t } = useTheme()
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterType, setFilterType] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch data
  const { data: dbProducts = [] } = useQuery({ queryKey: ['products'], queryFn: productsService.fetchProducts })
  const { data: dbSites = [] } = useQuery({ queryKey: ['sites'], queryFn: sitesService.fetchSites })
  const { data: dbEntries = [], refetch } = useQuery({
    queryKey: ['damage_lost_entries'],
    queryFn: () => damageLostService.fetchDamageLostEntries()
  })

  // Derived entries
  const damageEntries = useMemo(() => dbEntries || [], [dbEntries])

  const [form, setForm] = useState({
    productId: '',
    quantity: '',
    type: 'Damage',
    outlet: '',
    reason: ''
  })

  const [errors, setErrors] = useState({})

  // Validation logic
  const validateForm = useCallback(() => {
    const newErrors = {}
    if (!form.productId) newErrors.productId = 'Product is required'
    if (!form.quantity || form.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0'
    if (!form.type) newErrors.type = 'Type is required'
    if (!form.outlet) newErrors.outlet = 'Outlet is required'
    if (!form.reason || form.reason.trim() === '') newErrors.reason = 'Reason is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      notify('Please fix the errors in the form', 'error')
      return
    }

    const payload = {
      product_id: form.productId,
      quantity: form.quantity,
      type: form.type,
      site_id: form.outlet, // mapped to site_id in DB
      reason: form.reason,
      created_by: currentUser?.id
    }

    try {
      if (editingId) {
        await damageLostService.updateDamageLostEntry(editingId, payload)
        notify('Entry updated successfully', 'success')
      } else {
        await damageLostService.createDamageLostEntry(payload)
        if (isSupabaseConfigured()) {
          const movementType = form.type === 'Damage' ? 'damage' : 'loss'
          await inventoryService.deductStock(
            form.productId,
            form.outlet,
            parseInt(form.quantity),
            movementType,
            form.reason,
            currentUser?.id
          )
          queryClient.invalidateQueries({ queryKey: ['products'] })
        }
        notify('Entry recorded successfully', 'success')
      }
      refetch()
      closeModal()
    } catch (err) {
      notify('Action failed: ' + err.message, 'error')
    }
  }, [form, editingId, validateForm, currentUser, refetch])

  // Handle edit
  const handleEdit = useCallback((entry) => {
    setEditingId(entry.id)
    setForm({
      productId: entry.product_id,
      quantity: entry.quantity,
      type: entry.type,
      outlet: entry.site_id,
      reason: entry.reason
    })
    setShowModal(true)
  }, [])

  // Handle delete
  const handleDelete = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      notify('Delete functionality requires service call', 'info')
    }
  }, [])

  // Close modal
  const closeModal = useCallback(() => {
    setShowModal(false)
    setForm({ productId: '', quantity: '', type: 'Damage', outlet: '', reason: '' })
    setErrors({})
    setEditingId(null)
  }, [])

  // Filter entries
  const filteredEntries = useMemo(() => {
    let items = damageEntries
    if (filterType !== 'All') {
      items = items.filter(e => e.type === filterType)
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      items = items.filter(e =>
        (e.products?.name || '').toLowerCase().includes(s) ||
        (e.reason || '').toLowerCase().includes(s)
      )
    }
    return items
  }, [damageEntries, filterType, searchTerm])

  // Prepare table rows
  const tableRows = filteredEntries.map(entry => [
    <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {entry.products?.image_url || entry.products?.image ? (
        <img src={entry.products?.image_url || entry.products?.image} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
      ) : (
        <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📦</div>
      )}
      <span style={{ fontWeight: 700, color: '#1E293B' }}>{entry.products?.name || 'Unknown'}</span>
    </div>,
    <span key={entry.id} style={{ color: '#1E293B', fontWeight: 600 }}>{entry.quantity.toString()}</span>,
    <Badge key={entry.id} text={entry.type} color={entry.type === 'Damage' ? '#EF4444' : '#F59E0B'} t={t} />,
    <span key={entry.id} style={{ color: '#64748B', fontSize: 12 }}>{new Date(entry.created_at).toLocaleDateString()}</span>,
    <span key={entry.id} style={{ color: '#64748B' }}>{entry.sites?.name || 'Unknown Store'}</span>,
    <div key={entry.id} style={{ color: '#64748B', fontSize: 12 }}>{entry.reason}</div>,
    <div key={entry.id} style={{ display: 'flex', gap: 8 }}>
      <button onClick={() => handleEdit(entry)} style={{
        background: t.bg3, border: `1px solid ${t.border}`, color: t.text3, cursor: 'pointer',
        padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, minWidth: 60
      }}>Edit</button>
      <button onClick={() => handleDelete(entry.id)} style={{
        background: t.red + '20', border: `1px solid ${t.red}`, color: t.red, cursor: 'pointer',
        padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, minWidth: 60
      }}>Delete</button>
    </div>
  ])

  return (
    <div style={{ 
      background: 'transparent',
      minHeight: '100%', padding: '32px', borderRadius: 24,
      display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto', width: '100%', boxSizing: 'border-box' 
    }}>
      <InventoryHeader title="Damaged/Lost" t={t} activePage="damage" />

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard t={t} title="Total Entries" value={damageEntries.length} icon="📋" />
        <StatCard t={t} title="Damaged Items" value={damageEntries.filter(e => e.type === 'Damage').length} color="#ef4444" icon="🔴" />
        <StatCard t={t} title="Lost Items" value={damageEntries.filter(e => e.type === 'Lost').length} color="#f97316" icon="🟠" />
        <StatCard t={t} title="Total Units" value={damageEntries.reduce((sum, e) => sum + e.quantity, 0)} icon="📦" />
      </div>

      {/* Controls */}
      <div className="controls-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
          <Btn onClick={() => setShowModal(true)} t={t} size="sm" style={{ minWidth: 160 }}>➕ Add Damage / Lost</Btn>
          <div style={{ flex: 1, maxWidth: 500 }}>
            <Input t={t} placeholder="🔍 Search entries by product or reason..." value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>
        <Select value={filterType} onChange={setFilterType} options={[{ label: 'All Types', value: 'All' }, { label: 'Damage', value: 'Damage' }, { label: 'Lost', value: 'Lost' }]} t={t} label="Filter" />
      </div>

      {/* Table */}
      <Card t={t} style={{ padding: 0, overflow: 'hidden' }}>
        <Table cols={['Product Name', 'Qty', 'Type', 'Date', 'Outlet', 'Reason', 'Actions']} rows={tableRows} empty="No damage or lost entries found" t={t} />
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editingId ? 'Edit Entry' : 'Add Damage / Lost Entry'} onClose={closeModal} t={t} width={520} subtitle={editingId ? 'Update the damage or lost inventory entry' : 'Create a new damage or lost inventory entry'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Select label="Product Name" value={form.productId} onChange={(val) => { setForm(prev => ({ ...prev, productId: val })); setErrors(prev => ({ ...prev, productId: '' })) }} options={[{ label: 'Select a product...', value: '' }, ...dbProducts.map(p => ({ label: p.name, value: p.id }))]} t={t} />
            {errors.productId && <div style={{ fontSize: 12, color: t.red, marginTop: 4 }}>⚠ {errors.productId}</div>}
            <Input label="Quantity" type="number" value={form.quantity} onChange={(val) => { setForm(prev => ({ ...prev, quantity: parseInt(val) || '' })); setErrors(prev => ({ ...prev, quantity: '' })) }} placeholder="Enter quantity" required t={t} />
            {errors.quantity && <div style={{ fontSize: 12, color: t.red, marginTop: 4 }}>⚠ {errors.quantity}</div>}
            <Select label="Type" value={form.type} onChange={(val) => { setForm(prev => ({ ...prev, type: val })); setErrors(prev => ({ ...prev, type: '' })) }} options={TYPES.map(type => ({ label: type, value: type }))} t={t} />
            {errors.type && <div style={{ fontSize: 12, color: t.red, marginTop: 4 }}>⚠ {errors.type}</div>}
            <Select label="Outlet" value={form.outlet} onChange={(val) => { setForm(prev => ({ ...prev, outlet: val })); setErrors(prev => ({ ...prev, outlet: '' })) }} options={[{ label: 'Select outlet...', value: '' }, ...dbSites.map(s => ({ label: s.name, value: s.id }))]} t={t} />
            {errors.outlet && <div style={{ fontSize: 12, color: t.red, marginTop: 4 }}>⚠ {errors.outlet}</div>}
            <div>
              <label style={{ fontSize: 11, color: t.text3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, display: 'block', marginBottom: 5 }}>Reason <span style={{ color: t.red }}>*</span></label>
              <textarea value={form.reason} onChange={(e) => { setForm(prev => ({ ...prev, reason: e.target.value })); setErrors(prev => ({ ...prev, reason: '' })) }} placeholder="Describe why this item is damaged or lost..." style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, padding: 12, color: t.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', minHeight: 100, resize: 'vertical', width: '100%', boxSizing: 'border-box' }} />
              {errors.reason && <div style={{ fontSize: 12, color: t.red, marginTop: 4 }}>⚠ {errors.reason}</div>}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <Btn onClick={closeModal} t={t} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700, background: t.bg3, color: t.text3 }}>Cancel</Btn>
              <Btn onClick={handleSubmit} t={t} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700 }}>{editingId ? 'Update Entry' : 'Add Entry'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
