import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Btn, Input, Badge, Card, StatCard, Modal, Table, Select } from '@/components/ui'
import { notify } from '@/components/shared'
import { fmt, ts, genId } from '@/lib/utils'
import dayjs from 'dayjs'

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
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
}) => {
  const { t: tCtx } = useTheme()
  const t = tProp || tCtx

  const [statusFilter, setStatusFilter] = useState('all')
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [exchangeModal, setExchangeModal] = useState(null)
  const [restockOnApprove, setRestockOnApprove] = useState(true)

  const returnDays = settings?.returnDays ?? 30
  const allowReturns = settings?.allowReturns !== false

  const filteredReturns = statusFilter === 'all'
    ? returns
    : returns.filter(r => r.status === statusFilter)

  const isWithinReturnWindow = (orderDate) => {
    if (!orderDate) return true
    const days = dayjs().diff(dayjs(orderDate, ['DD/MM/YYYY, HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD']), 'day')
    return days <= returnDays
  }

  const getOrderForReturn = (r) => orders.find(o => o.id === r.orderId)

  const getReturnItems = (r) => {
    if (r.items && Array.isArray(r.items)) return r.items
    if (r.productId && r.productName && r.qty) {
      return [{ productId: r.productId, name: r.productName, qty: r.qty, price: r.refundAmount / r.qty }]
    }
    return []
  }

  const isProductReturnable = (productId) => {
    const p = products.find(pr => pr.id === productId)
    return p == null || p.returnable !== false
  }

  const approve = (r, opts = {}) => {
    const { restock = restockOnApprove, isExchange = false } = opts
    const items = getReturnItems(r)

    if (restock) {
      const increments = {}
      items.forEach(item => {
        const pid = item.productId
        if (pid) increments[pid] = (increments[pid] || 0) + (item.qty || 1)
      })
      setProducts(ps => ps.map(p => p.id in increments ? { ...p, stock: p.stock + increments[p.id] } : p))
    }

    setReturns(rs => rs.map(x => x.id === r.id ? { ...x, status: 'approved', restocked: restock, approvedAt: ts(), approvedBy: currentUser?.name } : x))

    if (addAudit) addAudit(currentUser, 'Refund Approved', 'Returns', `${r.id} — ${fmt(r.refundAmount, settings?.sym)}${restock ? ' (restocked)' : ''}${isExchange ? ' + exchange order created' : ''}`)
    notify(`Refund approved for ${r.customerName}`, 'success')
  }

  const reject = (r, reason) => {
    setReturns(rs => rs.map(x => x.id === r.id ? { ...x, status: 'rejected', rejectReason: reason, rejectedAt: ts(), rejectedBy: currentUser?.name } : x))
    if (addAudit) addAudit(currentUser, 'Return Rejected', 'Returns', `${r.id} — ${reason}`)
    notify('Return rejected', 'warning')
    setRejectModal(null)
    setRejectReason('')
  }

  const handleExchange = (r) => {
    const order = getOrderForReturn(r)
    const items = getReturnItems(r)
    if (!order || items.length === 0) {
      notify('Cannot create exchange: order or items missing', 'error')
      return
    }

    const newOrderId = genId('ORD')
    const newItems = items.map(i => ({
      productId: i.productId,
      name: i.name || products.find(p => p.id === i.productId)?.name || 'Item',
      qty: i.qty || 1,
      price: i.price || 0,
      discount: i.discount || 0,
    }))
    const subtotal = newItems.reduce((s, i) => s + (i.price || 0) * (1 - (i.discount || 0) / 100) * (i.qty || 1), 0)
    const tax = subtotal * ((settings?.vatRate || 20) / 100)
    const total = Math.round((subtotal + tax) * 100) / 100

    const newOrder = {
      id: newOrderId,
      customerId: r.customerId,
      customerName: r.customerName,
      cashierId: currentUser?.id,
      cashierName: currentUser?.name,
      items: newItems,
      subtotal,
      tax,
      discountAmt: 0,
      loyaltyDiscount: 0,
      deliveryCharge: 0,
      total,
      payment: 'Exchange',
      date: ts(),
      counter: 'Exchange',
      status: 'completed',
      orderType: 'in-store',
      loyaltyEarned: 0,
      loyaltyUsed: 0,
      exchangeForReturnId: r.id,
    }

    setOrders(os => [newOrder, ...os])
    approve(r, { restock: restockOnApprove, isExchange: true })
    if (addAudit) addAudit(currentUser, 'Exchange Order Created', 'Returns', `${newOrderId} for return ${r.id}`)
    notify(`Exchange order ${newOrderId} created`, 'success')
    setExchangeModal(null)
  }

  const pendingCount = returns.filter(r => r.status === 'pending').length
  const approvedCount = returns.filter(r => r.status === 'approved').length
  const totalRefunded = returns.filter(r => r.status === 'approved').reduce((s, r) => s + (r.refundAmount || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: t.text }}>Returns & Refunds</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(180px,45vw),1fr))', gap: 14 }}>
        <StatCard t={t} title="Pending" value={pendingCount} color={t.yellow} icon="⏳" />
        <StatCard t={t} title="Approved" value={approvedCount} color={t.green} icon="✅" />
        <StatCard t={t} title="Total Refunded" value={fmt(totalRefunded, settings?.sym)} color={t.accent} icon="💸" />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <Select t={t} label="Filter by status" value={statusFilter} onChange={setStatusFilter}
          options={STATUS_FILTERS.map(f => ({ value: f.value, label: f.label }))} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: t.text2, cursor: 'pointer' }}>
          <input type="checkbox" checked={restockOnApprove} onChange={e => setRestockOnApprove(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: t.accent }} />
          Restock on approve
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredReturns.map(r => {
          const order = getOrderForReturn(r)
          const items = getReturnItems(r)
          const withinWindow = isWithinReturnWindow(order?.date)
          const hasNonReturnable = items.some(i => !isProductReturnable(i.productId))

          return (
            <Card t={t} key={r.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: t.text }}>{r.id}</span>
                    <Badge t={t} text={r.status} color={r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : 'yellow'} />
                    {r.type && <Badge t={t} text={r.type} color="blue" />}
                    {!withinWindow && <Badge t={t} text="Outside return window" color="red" />}
                    {hasNonReturnable && <Badge t={t} text="Contains non-returnable" color="red" />}
                  </div>
                  <div style={{ fontSize: 13, color: t.text2 }}>👤 {r.customerName} · Order: {r.orderId}</div>
                  <div style={{ fontSize: 13, color: t.text2, marginTop: 4 }}>
                    📦 {items.map(i => `${i.name || i.productName} × ${i.qty || 1}`).join(', ')}
                  </div>
                  <div style={{ fontSize: 12, color: t.text3, marginTop: 2 }}>Reason: {r.reason}</div>
                  {r.rejectReason && <div style={{ fontSize: 12, color: t.red, marginTop: 2 }}>Rejection: {r.rejectReason}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: t.accent }}>{fmt(r.refundAmount, settings?.sym)}</div>
                  {r.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Btn t={t} variant="success" size="sm" onClick={() => approve(r)}>✓ Approve</Btn>
                      <Btn t={t} variant="primary" size="sm" onClick={() => setExchangeModal(r)}>↔ Exchange</Btn>
                      <Btn t={t} variant="danger" size="sm" onClick={() => setRejectModal(r)}>✕ Reject</Btn>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
        {filteredReturns.length === 0 && (
          <Card t={t}>
            <div style={{ textAlign: 'center', padding: 30, color: t.text3 }}>
              {statusFilter === 'all' ? 'No return requests' : `No ${statusFilter} returns`}
            </div>
          </Card>
        )}
      </div>

      {rejectModal && (
        <Modal t={t} title="Reject Return" onClose={() => { setRejectModal(null); setRejectReason('') }} width={420}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, color: t.text2 }}>Return {rejectModal.id} — {rejectModal.customerName}</div>
            <Input t={t} label="Rejection reason (required)" value={rejectReason} onChange={setRejectReason}
              placeholder="e.g. Item used, outside return window..." />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn t={t} variant="secondary" onClick={() => { setRejectModal(null); setRejectReason('') }}>Cancel</Btn>
              <Btn t={t} variant="danger" onClick={() => reject(rejectModal, rejectReason)} disabled={!rejectReason.trim()}>
                Reject Return
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {exchangeModal && (
        <Modal t={t} title="Exchange — Approve Return + Create Order" onClose={() => setExchangeModal(null)} width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, color: t.text2 }}>
              This will approve return {exchangeModal.id}, restock items (if enabled), and create a new replacement order for {exchangeModal.customerName}.
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: t.text2, cursor: 'pointer' }}>
              <input type="checkbox" checked={restockOnApprove} onChange={e => setRestockOnApprove(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: t.accent }} />
              Restock returned items
            </label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn t={t} variant="secondary" onClick={() => setExchangeModal(null)}>Cancel</Btn>
              <Btn t={t} variant="success" onClick={() => handleExchange(exchangeModal)}>Confirm Exchange</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
