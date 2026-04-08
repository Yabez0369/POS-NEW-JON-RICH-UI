import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui'
import { useTheme } from '@/context/ThemeContext'

// Fallback formatters
const formatCurrency = (amount) => `£${Number(amount).toFixed(2)}`
const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
})

// Expanded dummy data
const mockOrders = [
  { 
    id: 'PO-1001', 
    supplier: 'Acme Corp', 
    supplierContact: 'sales@acmecorp.com | +44 20 7123 4567',
    date: new Date().toISOString(), 
    status: 'Pending',
    subtotal: 1050.00,
    tax: 150.00,
    shipping: 50.00,
    total: 1250.00,
    paymentMethod: 'Bank Transfer (BACS)',
    items: [
      { name: 'Espresso Beans - Premium Roast', qty: 50, price: 15.00, total: 750.00 },
      { name: 'Oat Milk Barista Edition (Cases)', qty: 20, price: 15.00, total: 300.00 }
    ]
  },
  { 
    id: 'PO-1002', 
    supplier: 'Global Supplies', 
    supplierContact: 'orders@globalsupplies.co.uk | +44 113 496 0123',
    date: new Date(Date.now() - 86400000).toISOString(), 
    status: 'Received',
    subtotal: 700.40,
    tax: 100.10,
    shipping: 40.00,
    total: 840.50,
    paymentMethod: 'Corporate Credit Card',
    items: [
      { name: 'Takeaway Cups (8oz)', qty: 5000, price: 0.08, total: 400.00 },
      { name: 'Wooden Stirrers', qty: 10000, price: 0.01, total: 100.00 },
      { name: 'Brown Sugar Sachets', qty: 5000, price: 0.04008, total: 200.40 }
    ]
  },
]

function PODetailModal({ order, onClose }) {
  const { t } = useTheme()
  if (!order) return null

  return (
    <Modal t={t} title={`Purchase Order ${order.id}`} subtitle={formatDateTime(order.date)} onClose={onClose} width={800}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Top Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
          <div style={{ background: t.bg3 || 'rgba(0,0,0,0.02)', padding: 20, borderRadius: 16, border: `1px solid ${t.border || '#e2e8f0'}` }}>
            <div style={{ fontSize: 13, color: t.text3 || '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Supplier Details</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: t.text || '#0f172a' }}>{order.supplier}</div>
            <div style={{ fontSize: 14, color: t.text2 || '#475569', marginTop: 4, fontWeight: 500 }}>{order.supplierContact}</div>
          </div>
          <div style={{ background: t.bg3 || 'rgba(0,0,0,0.02)', padding: 20, borderRadius: 16, border: `1px solid ${t.border || '#e2e8f0'}` }}>
            <div style={{ fontSize: 13, color: t.text3 || '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Order Status</div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: 20, fontSize: 14, fontWeight: 700,
              background: order.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
              color: order.status === 'Pending' ? '#d97706' : '#15803d'
            }}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ border: `1px solid ${t.border || '#e2e8f0'}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: t.tableHead || 'rgba(0,0,0,0.04)', fontSize: 13, fontWeight: 800, color: t.text3 || '#475569', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `1px solid ${t.border || '#e2e8f0'}` }}>
            Purchased Items
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: t.bg2 || '#fff', borderBottom: `1px solid ${t.border || '#f1f5f9'}` }}>
                <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: t.text4 || '#94a3b8' }}>ITEM</th>
                <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: t.text4 || '#94a3b8' }}>QTY</th>
                <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: t.text4 || '#94a3b8' }}>UNIT PRICE</th>
                <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: t.text4 || '#94a3b8', textAlign: 'right' }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: i < order.items.length - 1 ? `1px solid ${t.border || '#f1f5f9'}` : 'none', background: t.bg || '#fff' }}>
                  <td style={{ padding: '16px 20px', fontSize: 15, fontWeight: 600, color: t.text || '#0f172a' }}>{item.name}</td>
                  <td style={{ padding: '16px 20px', fontSize: 15, fontWeight: 500, color: t.text2 || '#334155' }}>
                    <span style={{ background: 'rgba(34,211,238,0.1)', padding: '4px 10px', borderRadius: 8, color: '#0284c7' }}>{item.qty}</span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 15, color: t.text2 || '#334155' }}>{formatCurrency(item.price)}</td>
                  <td style={{ padding: '16px 20px', fontSize: 15, fontWeight: 700, color: t.text || '#0f172a', textAlign: 'right' }}>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Summary */}
        <div style={{ background: t.bg3 || 'rgba(0,0,0,0.02)', padding: 24, borderRadius: 16, border: `1px solid ${t.border || '#e2e8f0'}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 14, color: t.text3 || '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Payment Details</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: t.text2 || '#475569' }}>
            <span>Subtotal</span>
            <span style={{ fontWeight: 600, color: t.text }}>{formatCurrency(order.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: t.text2 || '#475569' }}>
            <span>Tax</span>
            <span style={{ fontWeight: 600, color: t.text }}>{formatCurrency(order.tax)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: t.text2 || '#475569' }}>
            <span>Shipping / Fees</span>
            <span style={{ fontWeight: 600, color: t.text }}>{formatCurrency(order.shipping)}</span>
          </div>
          
          <div style={{ height: 1, background: t.border || '#cbd5e1', margin: '8px 0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: t.text || '#0f172a' }}>Total Paid</div>
              <div style={{ fontSize: 14, color: t.text3 || '#64748b', marginTop: 4, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                {order.paymentMethod}
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: t.accent || '#dc2626' }}>{formatCurrency(order.total)}</div>
          </div>
        </div>

      </div>
    </Modal>
  )
}

export default function PurchaseOrders() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const filteredOrders = mockOrders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div style={{ 
      background: 'transparent',
      minHeight: '100%', padding: '32px', borderRadius: 24,
      display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40, fontFamily: "'Inter', sans-serif" 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 8px', color: 'var(--text-main, #0F172A)' }}>Purchase Orders</h1>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-muted, #64748b)' }}>Manage and track your supplier orders and inventory purchasing</p>
        </div>
        <button 
          onClick={() => navigate('/app/purchase-orders/new')}
          style={{
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff',
            border: 'none', padding: '12px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(220,38,38,0.25)',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          New Purchase Order
        </button>
      </div>

      <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: 20, borderBottom: '1px solid var(--border-color, #e2e8f0)', background: 'var(--bg-muted, #f8fafc)', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 600 }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search PO number or supplier..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px 14px 44px', borderRadius: 12,
                border: '1px solid var(--border-color, #cbd5e1)', fontSize: 15,
                background: 'var(--bg-input, #fff)', color: 'var(--text-main, #333)', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                padding: '14px 40px 14px 16px', borderRadius: 12, appearance: 'none',
                border: '1px solid var(--border-color, #cbd5e1)', fontSize: 15, fontWeight: 600,
                background: 'var(--bg-input, #fff)', color: 'var(--text-main, #475569)', outline: 'none',
                cursor: 'pointer', minWidth: 160
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Received">Received</option>
            </select>
            <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-muted, #f8fafc)', borderBottom: '2px solid var(--border-color, #e2e8f0)' }}>
                <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted, #64748b)', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>PO NUMBER</th>
                <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted, #64748b)', letterSpacing: 0.5 }}>SUPPLIER</th>
                <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted, #64748b)', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>DATE</th>
                <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted, #64748b)', letterSpacing: 0.5 }}>TOTAL VALUE</th>
                <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted, #64748b)', letterSpacing: 0.5 }}>STATUS</th>
                <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted, #64748b)', letterSpacing: 0.5, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>No purchase orders found</div>
                    <div style={{ fontSize: 14, marginTop: 4 }}>Try adjusting your search query</div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, i) => (
                  <tr key={order.id} style={{ 
                    borderBottom: i < filteredOrders.length - 1 ? '1px solid var(--border-color, #f1f5f9)' : 'none',
                    transition: 'background 0.2s', cursor: 'default'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover, #f8fafc)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '24px', fontSize: 15, fontWeight: 700, color: '#0ea5e9', fontFamily: 'monospace' }}>{order.id}</td>
                    <td style={{ padding: '24px' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main, #0F172A)' }}>{order.supplier}</div>
                    </td>
                    <td style={{ padding: '24px', fontSize: 15, color: 'var(--text-muted, #64748b)', whiteSpace: 'nowrap' }}>{formatDateTime(order.date)}</td>
                    <td style={{ padding: '24px', fontSize: 16, fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>{formatCurrency(order.total)}</td>
                    <td style={{ padding: '24px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: 20, fontSize: 14, fontWeight: 700,
                        background: order.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        color: order.status === 'Pending' ? '#d97706' : '#15803d'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '24px', textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.25)',
                          padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                          transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(2, 132, 199, 0.18)'; e.currentTarget.style.transform = 'scale(1.03)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(2, 132, 199, 0.1)'; e.currentTarget.style.transform = 'scale(1)' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
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

      <PODetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  )
}
