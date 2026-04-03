import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CreatePurchaseOrder({ t, currentUser, products = [] }) {
  const navigate = useNavigate()
  
  const [orderData, setOrderData] = useState({
    site: '',
    supplier: '',
    notes: ''
  })
  
  const [lineItems, setLineItems] = useState([
    { id: Date.now(), product: '', stock: 0, qty: 1, unitCost: 0, total: 0, notes: '' }
  ])
  
  const mockSites = ['Main Warehouse', 'Downtown Shop']
  const mockSuppliers = ['Acme Corp', 'Global Supplies']

  const handleAddItem = () => {
    setLineItems([...lineItems, { id: Date.now(), product: '', stock: 0, qty: 1, unitCost: 0, total: 0, notes: '' }])
  }

  const handleRemoveItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id))
    }
  }

  const handleItemChange = (id, field, value) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'qty' || field === 'unitCost') {
          updated.total = (parseFloat(updated.qty || 0) * parseFloat(updated.unitCost || 0))
        }
        if (field === 'product') {
          // Mock finding product stock and cost
          const prod = products.find(p => p.id === value || p.name === value)
          if (prod) {
            updated.stock = prod.stock || 0
            updated.unitCost = prod.price || 0
            updated.total = (parseFloat(updated.qty || 0) * parseFloat(updated.unitCost || 0))
          }
        }
        return updated
      }
      return item
    }))
  }

  const subtotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0)
  const tax = subtotal * 0.20
  const totalValue = subtotal + tax

  const handleSubmit = () => {
    // Generate PO logic here
    alert('Purchase Order Generated!')
    navigate('/app/purchase-orders')
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', sans-serif", background: 'transparent', minHeight: '100%', color: 'var(--text-main, #0f172a)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 24 }}>📝</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Create Purchase Order</h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted, #64748b)' }}>Draft a new PO and add line items.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/app/purchase-orders')}
          style={{
            background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #e2e8f0)',
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-main, #334155)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <span>— Back to History</span>
        </button>
      </div>

      {/* Order Details box */}
      <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 12, border: '1px solid var(--border-color, #e2e8f0)', padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 20px' }}>Order Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>RECEIVING SITE/SHOP *</label>
            <select
              value={orderData.site}
              onChange={e => setOrderData({...orderData, site: e.target.value})}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color, #cbd5e1)', background: 'var(--bg-input, #fff)', color: 'var(--text-main, #0f172a)', fontSize: 14, outline: 'none' }}
            >
              <option value="">— Select Site —</option>
              {mockSites.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>SUPPLIER *</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <select
                value={orderData.supplier}
                onChange={e => setOrderData({...orderData, supplier: e.target.value})}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color, #cbd5e1)', background: 'var(--bg-input, #fff)', color: 'var(--text-main, #0f172a)', fontSize: 14, outline: 'none' }}
              >
                <option value="">— Select Supplier —</option>
                {mockSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button style={{ background: 'var(--bg-muted, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', padding: '0 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-main, #334155)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                + Add New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items box */}
      <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 12, border: '1px solid var(--border-color, #e2e8f0)', padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Line Items</h2>
          <button 
            onClick={handleAddItem}
            style={{ background: '#b91c1c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            + Add Row
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ paddingBottom: 12, fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', width: '30%' }}>PRODUCT</th>
              <th style={{ paddingBottom: 12, fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', width: '10%' }}>CUR.<br/>STOCK</th>
              <th style={{ paddingBottom: 12, fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', width: '12%' }}>ORDER QTY</th>
              <th style={{ paddingBottom: 12, fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', width: '15%' }}>UNIT COST<br/>(£)</th>
              <th style={{ paddingBottom: 12, fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', width: '15%' }}>LINE TOTAL<br/>(£)</th>
              <th style={{ paddingBottom: 12, fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase' }}>NOTES</th>
              <th style={{ paddingBottom: 12, width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map(item => (
              <tr key={item.id}>
                <td style={{ padding: '8px 8px 8px 0' }}>
                  <select 
                    value={item.product}
                    onChange={e => handleItemChange(item.id, 'product', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-color, #cbd5e1)', background: 'var(--bg-input, #fff)', color: 'var(--text-main, #0f172a)', fontSize: 14 }}
                  >
                    <option value="">Search / Select product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </td>
                <td style={{ padding: '8px', fontSize: 14, fontWeight: 600 }}>{item.stock}</td>
                <td style={{ padding: '8px' }}>
                  <input 
                    type="number" min="1"
                    value={item.qty}
                    onChange={e => handleItemChange(item.id, 'qty', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-color, #cbd5e1)', background: 'var(--bg-input, #fff)', color: 'var(--text-main, #0f172a)', fontSize: 14 }}
                  />
                </td>
                <td style={{ padding: '8px' }}>
                  <input 
                    type="number" min="0" step="0.01"
                    value={item.unitCost}
                    onChange={e => handleItemChange(item.id, 'unitCost', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-color, #cbd5e1)', background: 'var(--bg-input, #fff)', color: 'var(--text-main, #0f172a)', fontSize: 14 }}
                  />
                </td>
                <td style={{ padding: '8px', fontSize: 15, fontWeight: 700 }}>
                  {item.total.toFixed(2)}
                </td>
                <td style={{ padding: '8px' }}>
                  <input 
                    type="text" placeholder="e.g. Size L"
                    value={item.notes}
                    onChange={e => handleItemChange(item.id, 'notes', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-color, #cbd5e1)', background: 'var(--bg-input, #fff)', color: 'var(--text-main, #0f172a)', fontSize: 14 }}
                  />
                </td>
                <td style={{ padding: '8px 0 8px 8px', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, padding: '4px 8px' }}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Section Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        
        {/* Notes */}
        <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 12, border: '1px solid var(--border-color, #e2e8f0)', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ORDER NOTES / TERMS</label>
          <textarea 
            value={orderData.notes}
            onChange={e => setOrderData({...orderData, notes: e.target.value})}
            placeholder="Special delivery instructions, terms, etc."
            style={{ width: '100%', minHeight: 120, padding: 16, borderRadius: 8, border: '1px solid var(--border-color, #cbd5e1)', background: 'var(--bg-input, #fff)', color: 'var(--text-main, #0f172a)', fontSize: 14, resize: 'vertical', outline: 'none' }}
          ></textarea>
        </div>

        {/* Summary */}
        <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 12, border: '1px solid var(--border-color, #e2e8f0)', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 20px' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: 'var(--text-muted, #64748b)' }}>
            <span>Subtotal</span>
            <span>£{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 14, color: 'var(--text-muted, #64748b)' }}>
            <span>Estimated Tax (20%)</span>
            <span>£{tax.toFixed(2)}</span>
          </div>
          
          <div style={{ padding: '16px 0', borderTop: '2px solid var(--border-color, #e2e8f0)', borderBottom: '2px solid var(--border-color, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>Total Value</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#b91c1c' }}>£{totalValue.toFixed(2)}</span>
          </div>

          <button 
            onClick={handleSubmit}
            style={{ width: '100%', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', border: 'none', padding: '16px', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 'auto', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)' }}
          >
            Generate Purchase Order
          </button>
        </div>
        
      </div>
    </div>
  )
}
