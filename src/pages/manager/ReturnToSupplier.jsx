import { useState, useMemo, useEffect } from 'react'
import { Modal } from '@/components/ui'
import { useTheme } from '@/context/ThemeContext'

// --- Helpers ---
const formatCurrency = (amount) => `£${Number(amount).toFixed(2)}`
const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
})

const DAMAGE_TYPES = ['Defective', 'Expired', 'Wrong Item', 'Damaged in Transit', 'Other']

// --- Mock Data ---
const INITIAL_RETURNS = [
  {
    id: 'RET-1001',
    supplier: 'Acme Corp',
    date: new Date(Date.now() - 172800000).toISOString(),
    totalItems: 5,
    totalValue: 75.00,
    status: 'Completed',
    items: [
      { name: 'Espresso Beans', sku: 'COF-001', receivedQty: 10, problemQty: 5, damageType: 'Defective', notes: 'Package torn', unitPrice: 15.00, total: 75.00 }
    ]
  },
  {
    id: 'RET-1002',
    supplier: 'Global Supplies',
    date: new Date(Date.now() - 86400000).toISOString(),
    totalItems: 12,
    totalValue: 120.40,
    status: 'Processing',
    items: [
      { name: 'Takeaway Cups', sku: 'CUP-008', receivedQty: 100, problemQty: 12, damageType: 'Damaged in Transit', notes: 'Crushed boxes', unitPrice: 10.033, total: 120.40 }
    ]
  }
]

const INITIAL_AUDIT = [
  { id: 1, action: 'Return Created', user: 'Admin', details: 'RET-1002 created for Global Supplies', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 2, action: 'Status Updated', user: 'System', details: 'RET-1001 marked as Completed', timestamp: new Date(Date.now() - 172800000).toISOString() }
]

const mockSuppliers = ['Acme Corp', 'Global Supplies', 'Tech Parts Ltd', 'Office Essentials']

// --- Components ---

function StatusBadge({ status }) {
  const styles = {
    Processing: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', dot: '#f59e0b' },
    Completed: { bg: 'rgba(34, 197, 94, 0.1)', color: '#15803d', dot: '#22c55e' },
    Rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', dot: '#ef4444' }
  }
  const s = styles[status] || styles.Processing
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700,
      background: s.bg, color: s.color
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {status}
    </span>
  )
}

export default function ReturnToSupplier({ t, currentUser, products = [] }) {
  const { darkMode } = useTheme()
  const themeTokens = {
    bg: darkMode ? '#0f172a' : '#fff',
    bg2: darkMode ? '#1e293b' : '#f8fafc',
    border: darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    text: darkMode ? '#f8fafc' : '#0f172a',
    textSecondary: darkMode ? '#94a3b8' : '#64748b'
  }

  const [returns, setReturns] = useState(INITIAL_RETURNS)
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT)
  const [view, setView] = useState('list') // 'list' or 'form'
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedReturn, setSelectedReturn] = useState(null)

  // --- Form State ---
  const [formData, setFormData] = useState({
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    items: []
  })

  // --- Computed ---
  const filteredReturns = useMemo(() => {
    return returns.filter(r => {
      const matchSearch = r.id.toLowerCase().includes(searchTerm.toLowerCase()) || r.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = statusFilter === 'All' || r.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [returns, searchTerm, statusFilter])

  // --- Handlers ---
  const handleAddRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), name: '', sku: '', receivedQty: 1, problemQty: 1, damageType: 'Defective', notes: '', unitPrice: 0, total: 0 }]
    }))
  }

  const handleUpdateItem = (id, field, value) => {
    setFormData(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          // Validation: Problem Qty <= Received Qty
          if (field === 'problemQty' && value > item.receivedQty) {
            updated.problemQty = item.receivedQty
          }
          if (field === 'receivedQty' && value < item.problemQty) {
            // auto-adjust problem qty if received drops below it
            updated.problemQty = value
          }
          // Recalculate row total
          updated.total = updated.problemQty * updated.unitPrice
          return updated
        }
        return item
      })
      return { ...prev, items: newItems }
    })
  }

  const handleRemoveItem = (id) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.supplier || formData.items.length === 0) {
      alert('Please select a supplier and add at least one item.')
      return
    }

    const totalItems = formData.items.reduce((sum, i) => sum + Number(i.problemQty), 0)
    const totalValue = formData.items.reduce((sum, i) => sum + i.total, 0)

    const newReturn = {
      id: `RET-${1000 + returns.length + 1}`,
      supplier: formData.supplier,
      date: new Date().toISOString(),
      totalItems,
      totalValue,
      status: 'Processing',
      items: formData.items
    }

    setReturns([newReturn, ...returns])
    setAuditLogs([{
      id: Date.now(),
      action: 'Return Submitted',
      user: currentUser?.name || 'Manager',
      details: `${newReturn.id} submitted for ${newReturn.supplier}`,
      timestamp: new Date().toISOString()
    }, ...auditLogs])

    setView('list')
    setFormData({ supplier: '', date: new Date().toISOString().split('T')[0], items: [] })
  }

  const totalFormValue = formData.items.reduce((sum, i) => sum + i.total, 0)
  const totalFormItems = formData.items.reduce((sum, i) => sum + Number(i.problemQty), 0)

  // --- Renderers ---
  if (view === 'form') {
    return (
      <div style={{ padding: 'clamp(20px, 4vw, 40px)', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <button
              onClick={() => setView('list')}
              style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: 8 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Back to List
            </button>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, color: themeTokens.text }}>New Return to Supplier</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 32 }}>
          {/* Header Specs */}
          <div style={{ background: themeTokens.bg, border: `1px solid ${themeTokens.border}`, borderRadius: 20, padding: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 800, color: themeTokens.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Supplier</label>
              <select
                required
                value={formData.supplier}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                style={{ background: themeTokens.bg2, border: `1px solid ${themeTokens.border}`, padding: '14px 18px', borderRadius: 12, fontSize: 16, color: themeTokens.text, cursor: 'pointer', outline: 'none' }}
              >
                <option value="">Select Supplier</option>
                {mockSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 800, color: themeTokens.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Return Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                style={{ background: themeTokens.bg2, border: `1px solid ${themeTokens.border}`, padding: '14px 18px', borderRadius: 12, fontSize: 16, color: themeTokens.text }}
              />
            </div>
          </div>

          {/* Items Table */}
          <div style={{ background: themeTokens.bg, border: `1px solid ${themeTokens.border}`, borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', background: themeTokens.bg2, borderBottom: `1px solid ${themeTokens.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: themeTokens.text }}>Returned Items</h3>
              <button
                type="button"
                onClick={handleAddRow}
                style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Item
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: `1px solid ${themeTokens.border}` }}>
                    <th style={{ padding: '16px 32px', fontSize: 12, fontWeight: 800, color: themeTokens.textSecondary }}>ITEM / SKU</th>
                    <th style={{ padding: '16px 32px', fontSize: 12, fontWeight: 800, color: themeTokens.textSecondary }}>RECEIVED QTY</th>
                    <th style={{ padding: '16px 32px', fontSize: 12, fontWeight: 800, color: themeTokens.textSecondary }}>PROBLEM QTY</th>
                    <th style={{ padding: '16px 32px', fontSize: 12, fontWeight: 800, color: themeTokens.textSecondary }}>DAMAGE TYPE</th>
                    <th style={{ padding: '16px 32px', fontSize: 12, fontWeight: 800, color: themeTokens.textSecondary }}>UNIT PRICE</th>
                    <th style={{ padding: '16px 32px', fontSize: 12, fontWeight: 800, color: themeTokens.textSecondary, textAlign: 'right' }}>TOTAL</th>
                    <th style={{ padding: '16px 32px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 48, textAlign: 'center', color: themeTokens.textSecondary }}>
                        No items added. Click "Add Item" to begin.
                      </td>
                    </tr>
                  ) : formData.items.map(item => (
                    <tr key={item.id} style={{ borderBottom: `1px solid ${themeTokens.border}` }}>
                      <td style={{ padding: '20px 32px' }}>
                        <select
                          value={item.sku}
                          onChange={e => {
                            const prod = products.find(p => p.id === e.target.value || p.sku === e.target.value)
                            if (prod) {
                              handleUpdateItem(item.id, 'name', prod.name)
                              handleUpdateItem(item.id, 'sku', prod.id)
                              handleUpdateItem(item.id, 'unitPrice', prod.price || 0)
                            }
                          }}
                          style={{ width: '100%', background: themeTokens.bg2, border: `1px solid ${themeTokens.border}`, padding: '10px 14px', borderRadius: 10, fontSize: 14, fontWeight: 700, color: themeTokens.text, outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="">Select Product...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                        </select>
                        <div style={{ fontSize: 12, color: themeTokens.textSecondary, marginTop: 4 }}>SKU: {item.sku || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '20px 32px' }}>
                        <input
                          type="number" min="1"
                          value={item.receivedQty} onChange={e => handleUpdateItem(item.id, 'receivedQty', Number(e.target.value))}
                          style={{ width: 80, background: themeTokens.bg2, border: `1px solid ${themeTokens.border}`, padding: '8px 12px', borderRadius: 8, fontSize: 15, color: themeTokens.text }}
                        />
                      </td>
                      <td style={{ padding: '20px 32px' }}>
                        <input
                          type="number" min="1" max={item.receivedQty}
                          value={item.problemQty} onChange={e => handleUpdateItem(item.id, 'problemQty', Number(e.target.value))}
                          style={{ width: 80, background: themeTokens.bg2, border: `1px solid ${themeTokens.border}`, padding: '8px 12px', borderRadius: 8, fontSize: 15, color: themeTokens.text, fontWeight: 700 }}
                        />
                      </td>
                      <td style={{ padding: '20px 32px' }}>
                        <select
                          value={item.damageType} onChange={e => handleUpdateItem(item.id, 'damageType', e.target.value)}
                          style={{ background: themeTokens.bg2, border: `1px solid ${themeTokens.border}`, padding: '10px 14px', borderRadius: 10, fontSize: 14, color: themeTokens.text, cursor: 'pointer' }}
                        >
                          {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '20px 32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: themeTokens.textSecondary }}>£</span>
                          <input
                            type="number" step="0.01"
                            value={item.unitPrice} onChange={e => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                            style={{ width: 90, background: themeTokens.bg2, border: `1px solid ${themeTokens.border}`, padding: '8px 12px', borderRadius: 8, fontSize: 15, color: themeTokens.text }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '20px 32px', textAlign: 'right', fontSize: 16, fontWeight: 800, color: themeTokens.text }}>
                        {formatCurrency(item.total)}
                      </td>
                      <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                        <button
                          type="button" onClick={() => handleRemoveItem(item.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', width: 36, height: 36, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: 32, background: themeTokens.bg2, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right', display: 'grid', gap: 12 }}>
                <div style={{ fontSize: 15, color: themeTokens.textSecondary }}>Total Items: <span style={{ fontWeight: 800, color: themeTokens.text }}>{totalFormItems}</span></div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#dc2626' }}>{formatCurrency(totalFormValue)}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
            <button
              type="button" onClick={() => setView('list')}
              style={{ background: themeTokens.bg, border: `1px solid ${themeTokens.border}`, color: themeTokens.text, padding: '14px 32px', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', border: 'none', padding: '14px 40px', borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(2,132,199,0.25)' }}
            >
              Submit Return
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div style={{ 
      background: 'transparent',
      minHeight: '100%', padding: '32px', borderRadius: 24,
      display: 'flex', flexDirection: 'column', gap: 20, boxSizing: 'border-box' 
    }}>
      {/* Detail Modal */}
      {selectedReturn && (
        <Modal
          t={t}
          title={`Return Details: ${selectedReturn.id}`}
          subtitle={`Supplier: ${selectedReturn.supplier} • ${formatDateTime(selectedReturn.date)}`}
          onClose={() => setSelectedReturn(null)}
          width={650}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, background: '#f8fafc', padding: 20, borderRadius: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Supplier Information</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{selectedReturn.supplier}</div>
                <div style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>{formatDateTime(selectedReturn.date)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Return Status</div>
                <StatusBadge status={selectedReturn.status} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                Items in this Return
              </div>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 800, color: '#94a3b8' }}>PRODUCT</th>
                      <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 800, color: '#94a3b8', textAlign: 'center' }}>QTY</th>
                      <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 800, color: '#94a3b8', textAlign: 'right' }}>VALUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReturn.items?.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < selectedReturn.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{it.name}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>{it.sku} • {it.damageType}</div>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{it.problemQty}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{formatCurrency(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Total Items Returned</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{selectedReturn.totalItems} Units</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#64748b' }}>Total Credit Value</div>
                <div style={{ fontSize: 28, fontWeight: 950, color: '#0ea5e9' }}>{formatCurrency(selectedReturn.totalValue)}</div>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <button 
                onClick={() => setSelectedReturn(null)}
                style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 950, margin: '0 0 8px', color: '#1E293B' }}>Return to Supplier</h1>
          <p style={{ margin: 0, fontSize: 15, color: '#64748B' }}>Manage damaged or defective goods returned to your suppliers</p>
        </div>
        <button
          onClick={() => setView('form')}
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff',
            border: 'none', padding: '12px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(2,132,199,0.2)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          New Return
        </button>
      </div>

      {/* Main Table Container */}
      <div style={{ background: themeTokens.bg, border: `1px solid ${themeTokens.border}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        {/* Filters */}
        <div style={{ padding: 24, borderBottom: `1px solid ${themeTokens.border}`, background: themeTokens.bg2, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 600 }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              placeholder="Search by Return ID or Supplier..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: 12, border: `1px solid ${themeTokens.border}`, fontSize: 15, background: themeTokens.bg, color: themeTokens.text, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '14px 24px', borderRadius: 12, border: `1px solid ${themeTokens.border}`, fontSize: 15, fontWeight: 700, background: themeTokens.bg, color: themeTokens.text, outline: 'none', cursor: 'pointer', minWidth: 160 }}
          >
            <option value="All">All Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: themeTokens.bg2, borderBottom: `2px solid ${themeTokens.border}` }}>
                <th style={{ padding: '20px 24px', fontSize: 13, fontWeight: 800, color: themeTokens.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>RETURN ID</th>
                <th style={{ padding: '20px 24px', fontSize: 13, fontWeight: 800, color: themeTokens.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>SUPPLIER</th>
                <th style={{ padding: '20px 24px', fontSize: 13, fontWeight: 800, color: themeTokens.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>DATE</th>
                <th style={{ padding: '20px 24px', fontSize: 13, fontWeight: 800, color: themeTokens.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>TOTAL ITEMS</th>
                <th style={{ padding: '20px 24px', fontSize: 13, fontWeight: 800, color: themeTokens.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>TOTAL VALUE</th>
                <th style={{ padding: '20px 24px', fontSize: 13, fontWeight: 800, color: themeTokens.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>STATUS</th>
                <th style={{ padding: '20px 24px', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 80, textAlign: 'center', color: themeTokens.textSecondary }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🚚</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>No returns found</div>
                    <div style={{ fontSize: 14, marginTop: 4 }}>Try adjusting your search or filters</div>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < filteredReturns.length - 1 ? `1px solid ${themeTokens.border}` : 'none', transition: 'background 0.2s' }}>
                    <td style={{ padding: '24px', fontSize: 15, fontWeight: 700, color: '#0ea5e9', fontFamily: 'monospace' }}>{r.id}</td>
                    <td style={{ padding: '24px' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: themeTokens.text }}>{r.supplier}</div>
                    </td>
                    <td style={{ padding: '24px', fontSize: 15, color: themeTokens.textSecondary }}>{formatDateTime(r.date)}</td>
                    <td style={{ padding: '24px', fontSize: 15, fontWeight: 700, color: themeTokens.textSecondary }}>
                      <span style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', padding: '4px 10px', borderRadius: 8 }}>{r.totalItems}</span>
                    </td>
                    <td style={{ padding: '24px', fontSize: 16, fontWeight: 800, color: themeTokens.text }}>{formatCurrency(r.totalValue)}</td>
                    <td style={{ padding: '24px' }}>
                      <StatusBadge status={r.status} />
                    </td>
                    <td style={{ padding: '24px', textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedReturn(r)}
                        style={{ background: 'rgba(14,165,233,0.1)', border: 'none', color: '#0ea5e9', fontWeight: 800, fontSize: 13, cursor: 'pointer', padding: '10px 18px', borderRadius: 10, transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.18)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(14,165,233,0.1)'}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Log / Audit Trail */}
      <div style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20, color: themeTokens.text }}>Transaction Log</h2>
        <div style={{ background: themeTokens.bg, border: `1px solid ${themeTokens.border}`, borderRadius: 20, padding: '16px 0' }}>
          {auditLogs.map((log, i) => (
            <div key={log.id} style={{
              display: 'flex', alignItems: 'center', gap: 20, padding: '16px 24px',
              borderBottom: i < auditLogs.length - 1 ? `1px solid ${themeTokens.border}` : 'none'
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0ea5e9' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: themeTokens.text }}>{log.action}</span>
                  <span style={{ fontSize: 12, color: themeTokens.textSecondary }}>{formatDateTime(log.timestamp)}</span>
                </div>
                <div style={{ fontSize: 14, color: themeTokens.textSecondary }}>
                  <span style={{ fontWeight: 700, color: themeTokens.text }}>{log.user}:</span> {log.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
