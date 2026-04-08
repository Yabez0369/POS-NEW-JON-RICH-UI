import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Btn, Input, Badge, Card, StatCard, Modal, Table, Select } from '@/components/ui'
import { notify } from '@/components/shared'
import { ts } from '@/lib/utils'
import { stocktakeService, productsService, sitesService, inventoryService } from '@/services'
import { useQuery } from '@tanstack/react-query'
import { InventoryHeader } from '@/components/inventory/InventoryHeader'

// Stocktake logic

export default function StocktakeManagement() {
  const navigate = useNavigate()
  const { t } = useTheme()
  const { currentUser } = useAuth()

  const [selectedSiteId, setSelectedSiteId] = useState('')
  const [stocktakeItems, setStocktakeItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterVariance, setFilterVariance] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch data
  const { data: dbProducts = [] } = useQuery({ queryKey: ['products'], queryFn: productsService.fetchProducts })
  const { data: dbSites = [] } = useQuery({ queryKey: ['sites'], queryFn: sitesService.fetchSites })
  const { data: siteInventory = [], refetch: refetchInventory } = useQuery({
    queryKey: ['inventory', selectedSiteId],
    queryFn: () => inventoryService.fetchInventory(selectedSiteId),
    enabled: !!selectedSiteId
  })

  // Default site selection
  useEffect(() => {
    if (dbSites.length > 0 && !selectedSiteId) {
      setSelectedSiteId(dbSites[0].id)
    }
  }, [dbSites, selectedSiteId])

  // Initialize stocktake items
  useEffect(() => {
    if (siteInventory && siteInventory.length > 0) {
      const currentProductIds = stocktakeItems.map(i => i.productId).sort().join(',')
      const newProductIds = siteInventory.map(i => i.product_id).sort().join(',')
      if (currentProductIds !== newProductIds) {
        setStocktakeItems(siteInventory.map(inv => ({
          id: inv.id,
          productId: inv.product_id,
          productName: inv.products?.name || 'Unknown',
          image: inv.products?.image_url || inv.products?.image || '',
          systemStock: inv.stock_on_hand || 0,
          physicalCount: inv.stock_on_hand || 0,
          variance: 0,
          notes: ''
        })))
      }
    } else if (selectedSiteId && siteInventory.length === 0) {
      setStocktakeItems([])
    }
  }, [siteInventory, selectedSiteId])

  const [form, setForm] = useState({ productId: '', physicalCount: '', notes: '' })
  const [errors, setErrors] = useState({})

  const validateForm = useCallback(() => {
    const newErrors = {}
    if (!form.productId) newErrors.productId = 'Product is required'
    if (form.physicalCount === '' || form.physicalCount < 0) newErrors.physicalCount = 'Physical count must be >= 0'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  const closeModal = useCallback(() => {
    setShowModal(false)
    setEditingId(null)
    setForm({ productId: '', physicalCount: '', notes: '' })
    setErrors({})
  }, [])

  const handleSubmit = useCallback(() => {
    if (!validateForm()) { notify('Please fix the errors in the form', 'error'); return }
    const product = dbProducts.find(p => String(p.id) === String(form.productId))
    if (!product) { notify('Product not found', 'error'); return }

    if (editingId) {
      setStocktakeItems(prev => prev.map(item => item.id === editingId ? { ...item, physicalCount: parseInt(form.physicalCount), variance: parseInt(form.physicalCount) - item.systemStock, notes: form.notes } : item))
    } else {
      const existingItem = stocktakeItems.find(item => String(item.productId) === String(form.productId))
      if (existingItem) {
        setStocktakeItems(prev => prev.map(item => String(item.productId) === String(form.productId) ? { ...item, physicalCount: parseInt(form.physicalCount), variance: parseInt(form.physicalCount) - item.systemStock, notes: form.notes } : item))
      } else {
        const newItem = { id: `new-${Date.now()}`, productId: product.id, productName: product.name, image: product.image_url || product.image || '', systemStock: 0, physicalCount: parseInt(form.physicalCount), variance: parseInt(form.physicalCount), notes: form.notes }
        setStocktakeItems(prev => [newItem, ...prev])
      }
    }
    closeModal()
  }, [form, editingId, validateForm, stocktakeItems, dbProducts, closeModal])

  const handleEdit = useCallback((item) => { setEditingId(item.id); setForm({ productId: item.productId, physicalCount: item.physicalCount, notes: item.notes }); setShowModal(true) }, [])
  const handleDelete = useCallback((id) => { if (window.confirm('Remove this item from stocktake?')) { setStocktakeItems(prev => prev.filter(item => item.id !== id)); notify('Item removed from stocktake', 'success') } }, [])

  const stats = useMemo(() => {
    const counted = stocktakeItems.filter(item => item.physicalCount !== item.systemStock).length
    const discrepancies = stocktakeItems.filter(item => item.variance !== 0).length
    const totalVariance = stocktakeItems.reduce((sum, item) => sum + item.variance, 0)
    return { counted, discrepancies, totalVariance }
  }, [stocktakeItems])

  const filteredItems = useMemo(() => {
    let items = stocktakeItems
    if (filterVariance === 'Variance') items = items.filter(item => item.variance !== 0)
    else if (filterVariance === 'Counted') items = items.filter(item => item.physicalCount !== item.systemStock)

    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      items = items.filter(item => (item.productName || '').toLowerCase().includes(s))
    }
    return items
  }, [stocktakeItems, filterVariance, searchTerm])

  const tableRows = filteredItems.map(item => [
    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {item.image ? (
        <img src={item.image} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', background: '#f8fafc' }} />
      ) : (
        <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📦</div>
      )}
      <span style={{ fontWeight: 600, color: t.text }}>{item.productName}</span>
    </div>,
    <span key={item.id} style={{ color: t.text2, fontWeight: 500 }}>{item.systemStock.toString()}</span>,
    <input key={item.id} type="number" value={item.physicalCount} onChange={(e) => { const newCount = parseInt(e.target.value) || 0; setStocktakeItems(prev => prev.map(i => i.id === item.id ? { ...i, physicalCount: newCount, variance: newCount - i.systemStock } : i)) }} style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 6, padding: '6px 10px', fontSize: 13, color: t.text, outline: 'none', width: '80px', textAlign: 'center' }} />,
    <div key={item.id} style={{ fontSize: 13, fontWeight: 700, color: item.variance === 0 ? t.green : item.variance > 0 ? t.blue : t.red, textAlign: 'center' }}>{item.variance > 0 ? '+' : ''}{item.variance}</div>,
    <Badge key={item.id} text={item.variance === 0 ? 'OK' : item.variance > 0 ? 'Excess' : 'Short'} color={item.variance === 0 ? 'green' : item.variance > 0 ? 'blue' : 'red'} t={t} />,
    <div key={item.id} style={{ display: 'flex', gap: 8 }}>
      <button onClick={() => handleEdit(item)} style={{ background: t.bg3, border: `1px solid ${t.border}`, color: t.text3, cursor: 'pointer', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, minWidth: 60 }}>Edit</button>
      <button onClick={() => handleDelete(item.id)} style={{ background: t.red + '20', border: `1px solid ${t.red}`, color: t.red, cursor: 'pointer', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, minWidth: 60 }}>Delete</button>
    </div>
  ])

  return (
    <div style={{ 
      background: 'transparent',
      minHeight: '100%', padding: '32px', borderRadius: 24,
      display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto', width: '100%', boxSizing: 'border-box' 
    }}>
      <InventoryHeader title="📋 Stocktake" t={t} activePage="stocktake" />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard t={t} title="Total Items" value={stocktakeItems.length} icon="📋" />
        <StatCard t={t} title="Discrepancies" value={stats.discrepancies} color="#ef4444" icon="⚠" />
        <StatCard t={t} title="Counted Items" value={stats.counted} color="#3b82f6" icon="✔" />
        <StatCard t={t} title="Total Variance" value={`${stats.totalVariance > 0 ? '+' : ''}${stats.totalVariance}`} color={stats.totalVariance === 0 ? '#10b981' : stats.totalVariance > 0 ? '#3b82f6' : '#ef4444'} icon="📊" />
      </div>

      <div className="controls-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <Btn onClick={() => setShowModal(true)} t={t}>➕ Add/Update Item</Btn>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select value={selectedSiteId} onChange={setSelectedSiteId} options={dbSites.map(s => ({ label: s.name, value: s.id }))} t={t} label="Outlet" />
          <Select value={filterVariance} onChange={setFilterVariance} options={[{ label: 'All Items', value: 'All' }, { label: 'Discrepancies Only', value: 'Variance' }]} t={t} label="Filter" />
        </div>
      </div>

      {/* Info box */}
      <Card t={t} style={{ padding: 12, background: t.bg3, border: `1px dashed ${t.border}` }}>
        <div style={{ fontSize: 12, color: t.text3 }}>💡 <strong>How to use:</strong> Select an outlet and review stock counts. Discrepancies are highlighted.</div>
      </Card>

      {/* Search bar */}
      <div style={{ maxWidth: 500, marginTop: -4 }}>
        <Input
          t={t}
          placeholder="🔍 Search products in stocktake..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* Table */}
      <Card t={t} style={{ padding: 0, overflow: 'hidden' }}>
        <Table cols={['Product', 'System Stock', 'Physical Count', 'Variance', 'Status', 'Actions']} rows={tableRows} empty="No stocktake items" t={t} />
      </Card>

      {showModal && (
        <Modal title={editingId ? 'Edit Stocktake Item' : 'Add Stocktake Item'} onClose={closeModal} t={t} width={480} subtitle="Enter physical inventory count">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Select label="Product" value={form.productId} onChange={(val) => { setForm(prev => ({ ...prev, productId: val })); setErrors(prev => ({ ...prev, productId: '' })) }} options={[{ label: 'Select product...', value: '' }, ...dbProducts.map(p => ({ label: `${p.emoji || '📦'} ${p.name}`, value: p.id }))]} t={t} />
            <Input label="Physical Count" type="number" value={form.physicalCount} onChange={(val) => { setForm(prev => ({ ...prev, physicalCount: parseInt(val) || '' })); setErrors(prev => ({ ...prev, physicalCount: '' })) }} placeholder="Actual count" required t={t} />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <Btn onClick={closeModal} t={t} style={{ background: t.bg3, color: t.text3 }}>Cancel</Btn>
              <Btn onClick={handleSubmit} t={t}>{editingId ? 'Update Item' : 'Add Item'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
