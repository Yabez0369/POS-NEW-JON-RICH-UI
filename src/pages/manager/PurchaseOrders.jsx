import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Fallback formatters if we can't import them correctly
const formatCurrency = (amount) => `£${Number(amount).toFixed(2)}`
const formatDateTime = (dateStr) => new Date(dateStr).toLocaleDateString()

export default function PurchaseOrders({ t, currentUser }) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  // Dummy data for now
  const mockOrders = [
    { id: 'PO-1001', supplier: 'Acme Corp', date: new Date().toISOString(), total: 1250.00, status: 'Pending' },
    { id: 'PO-1002', supplier: 'Global Supplies', date: new Date(Date.now() - 86400000).toISOString(), total: 840.50, status: 'Received' },
  ]

  const filteredOrders = mockOrders.filter(o => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.supplier.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-main, #0F172A)' }}>Purchase Orders</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted, #64748b)' }}>Manage and track your purchase orders</p>
        </div>
        <button 
          onClick={() => navigate('/app/purchase-orders/new')}
          style={{
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff',
            border: 'none', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
          }}
        >
          <span>+ Add New Purchase</span>
        </button>
      </div>

      <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
          <input 
            type="text" 
            placeholder="Search PO number or supplier..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', maxWidth: 300, padding: '8px 12px', borderRadius: 6,
              border: '1px solid var(--border-color, #cbd5e1)', fontSize: 13,
              background: 'var(--bg-input, #fff)', color: 'var(--text-main, #333)'
            }}
          />
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-muted, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>PO NUMBER</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>SUPPLIER</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>DATE</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>TOTAL VALUE</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: 13 }}>No purchase orders found</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-main, #0F172A)' }}>{order.id}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-main, #334155)' }}>{order.supplier}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted, #64748b)' }}>{formatDateTime(order.date)}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600 }}>{formatCurrency(order.total)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: order.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        color: order.status === 'Pending' ? '#d97706' : '#15803d'
                      }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
