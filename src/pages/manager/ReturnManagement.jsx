import { useState, useMemo } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Badge, Card, StatCard, Select, Table, Input, Modal, Btn } from '@/components/ui'
import { fmt } from '@/lib/utils'
import dayjs from 'dayjs'

const STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export const ReturnManagement = ({
  orders,
  returns,
  setReturns,
  products,
  setProducts,
  settings,
  setOrders,
  addAudit,
  currentUser,
  t: tProp,
  siteId,
}) => {
  const { t: tCtx } = useTheme()
  const t = tProp || tCtx

  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReturn, setSelectedReturn] = useState(null)

  const sym = settings?.sym

  const getReturnItems = (r) => {
    if (!r) return []
    if (r.return_items && Array.isArray(r.return_items)) {
      return r.return_items.map(ri => {
        const p = products.find(prod => prod.id === ri.product_id)
        return {
          productId: ri.product_id,
          name: p?.name || 'Unknown Product',
          qty: ri.quantity || 1,
          price: (ri.refund_amount || 0) / (ri.quantity || 1),
        }
      })
    }
    if (r.items && Array.isArray(r.items)) return r.items
    if (r.productId && r.productName && r.qty) {
      return [{ productId: r.productId, name: r.productName, qty: r.qty, price: r.refundAmount / r.qty }]
    }
    return []
  }

  const filteredReturns = useMemo(() => {
    return returns.filter(r => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      const searchLower = searchTerm.toLowerCase()
      const items = getReturnItems(r)
      const itemNames = items.map(i => i.name.toLowerCase()).join(' ')
      
      const matchesSearch = !searchTerm || 
        (r.id || '').toLowerCase().includes(searchLower) ||
        (r.customer_name || r.customerName || '').toLowerCase().includes(searchLower) ||
        (r.order_id || r.orderId || '').toLowerCase().includes(searchLower) ||
        itemNames.includes(searchLower)

      return matchesStatus && matchesSearch
    })
  }, [returns, statusFilter, searchTerm, products])

  const pendingCount = returns.filter(r => r.status === 'pending').length
  const completedCount = returns.filter(r => r.status === 'completed' || r.status === 'approved').length
  const totalRefunded = returns.filter(r => ['approved', 'completed'].includes(r.status)).reduce((s, r) => s + (r.refund_amount || r.refundAmount || 0), 0)

  const columns = ['Return ID', 'Customer', 'Refund Amt', 'Status', 'Actions']
  const rows = filteredReturns.map(r => {
    return [
      <div key="id">
        <div style={{ fontWeight: 800, color: t.text }}>{r.id}</div>
        <div style={{ fontSize: 10, color: t.text3 }}>{r.created_at ? dayjs(r.created_at).format('DD MMM YYYY') : '—'}</div>
      </div>,
      <div key="customer">
        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.customer_name || r.customerName || 'Walk-in'}</div>
        <div style={{ fontSize: 11, color: t.text3 }}>ID: {r.order_id || r.orderId}</div>
      </div>,
      <div key="refund" style={{ fontWeight: 800, color: t.accent }}>{fmt(r.refund_amount || r.refundAmount, sym)}</div>,
      <Badge t={t} key="status" text={r.status} color={r.status === 'completed' || r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : 'yellow'} />,
      <Btn key="action" variant="ghost" size="sm" onClick={() => setSelectedReturn(r)}>View Details</Btn>
    ]
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {selectedReturn && (
        <Modal 
          t={t} 
          title="Return Details" 
          subtitle={`Details for return ${selectedReturn.id}`}
          onClose={() => setSelectedReturn(null)}
          width={650}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, background: 'rgba(255,255,255,0.03)', padding: 18, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ fontSize: 11, color: t.text3, textTransform: 'uppercase', fontWeight: 800 }}>Customer Info</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{selectedReturn.customer_name || selectedReturn.customerName || 'Walk-in'}</div>
                <div style={{ fontSize: 13, color: t.text2 }}>{selectedReturn.customer_email || 'No email provided'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: t.text3, textTransform: 'uppercase', fontWeight: 800 }}>Transaction Info</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>Order ID: {selectedReturn.order_id || selectedReturn.orderId}</div>
                <div style={{ fontSize: 12, color: t.text2 }}>Date: {dayjs(selectedReturn.created_at).format('DD MMM YYYY, HH:mm')}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: t.text3, marginBottom: 12, textTransform: 'uppercase' }}>Items Being Returned</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {getReturnItems(selectedReturn).map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{it.name}</div>
                      <div style={{ fontSize: 12, color: t.text3 }}>Qty: {it.qty} × {fmt(it.price, sym)}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: t.text }}>{fmt((it.qty || 1) * (it.price || 0), sym)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 200, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
                <div style={{ fontSize: 11, color: t.text3, fontWeight: 800, textTransform: 'uppercase' }}>Reason for Return</div>
                <div style={{ fontSize: 13, color: t.text2, marginTop: 6, lineHeight: 1.5 }}>
                  {selectedReturn.reason_code || selectedReturn.reason || 'No specific reason provided.'}
                </div>
              </div>
              <div style={{ width: 180, padding: 16, background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(34, 211, 238, 0.05))', borderRadius: 16, border: '1px solid rgba(34, 211, 238, 0.2)', textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#22D3EE', fontWeight: 800, textTransform: 'uppercase' }}>Total Refund</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#22D3EE', marginTop: 4 }}>
                  {fmt(selectedReturn.refund_amount || selectedReturn.refundAmount, sym)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <Btn variant="ghost" fullWidth onClick={() => setSelectedReturn(null)}>Close Details</Btn>
              {selectedReturn.status === 'pending' && (
                <Btn variant="primary" fullWidth onClick={() => { /* Logic to approve */ }}>Approve Refund</Btn>
              )}
            </div>
          </div>
        </Modal>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>Returns & Refunds</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Manage customer returns and track refund history</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <StatCard t={t} title="Active Requests" value={pendingCount} sub="Awaiting approval" color="#F59E0B" icon="⏳" />
        <StatCard t={t} title="Processed Returns" value={completedCount} sub="Approved or completed" color="#10B981" icon="✅" />
        <StatCard t={t} title="Total Refunded" value={fmt(totalRefunded, sym)} sub="Lifetime refund amount" color="#22D3EE" icon="💸" />
      </div>

      <Card t={t} style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Input 
              t={t} 
              placeholder="Search by ID, name, or order..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              icon="🔍"
            />
          </div>
          <div style={{ width: 220 }}>
            <Select 
              t={t} 
              value={statusFilter} 
              onChange={setStatusFilter}
              options={STATUS_FILTERS} 
            />
          </div>
        </div>

        <Table 
          t={t} 
          cols={columns} 
          rows={rows} 
          empty="No refund requests found matching your filters" 
        />
      </Card>
    </div>
  )
}
