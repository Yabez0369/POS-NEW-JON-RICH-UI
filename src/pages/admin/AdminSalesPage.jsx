import { useState, useMemo } from 'react'
import { Card, Table, Badge, Btn, Select, Modal, TextArea } from '@/components/ui'
import { fmt } from '@/lib/utils'
import { Search, Filter, RotateCcw, Download, Calendar, ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { notify } from '@/components/shared'

export const AdminSalesPage = ({ orders = [], setOrders, addAudit, currentUser, settings, t }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [rejectOrder, setRejectOrder] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = (o.id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (o.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = filterStatus === 'all' || o.status === filterStatus
      const matchType = filterType === 'all' || o.orderType === filterType
      return matchSearch && matchStatus && matchType
    })
  }, [orders, searchTerm, filterStatus, filterType])

  const stats = useMemo(() => {
    const total = filteredOrders.reduce((s, o) => s + (o.total || 0), 0)
    const count = filteredOrders.length
    const avg = count > 0 ? total / count : 0
    return { total, count, avg }
  }, [filteredOrders])

  const handleStatusUpdate = (orderId, newStatus, reason = '') => {
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus, rejectionReason: reason, updated_at: new Date().toISOString() } : o
    )
    setOrders(updatedOrders)
    
    const order = orders.find(o => o.id === orderId)
    const action = newStatus === 'completed' ? 'Order Approved' : 'Order Disapproved'
    addAudit(currentUser, action, 'Sales', `${orderId} status changed to ${newStatus}${reason ? ` — Reason: ${reason}` : ''}`)
    
    notify(`${action} successfully`, 'success')
    setRejectOrder(null)
    setRejectReason('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: t.text, margin: 0 }}>Sales Hub</h1>
          <p style={{ fontSize: 13, color: t.text3, marginTop: 4 }}>Manage transactions, refunds, and performance.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn t={t} variant="outline" style={{ borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> Export CSV
          </Btn>
          <Btn t={t} style={{ borderRadius: 10, fontSize: 12, fontWeight: 700, background: t.accent, color: '#fff' }}>
            + New Simulation
          </Btn>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <Card t={t} style={{ borderLeft: `4px solid ${t.accent}` }}>
          <div style={{ fontSize: 11, color: t.text4, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5 }}>Total Revenue</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: t.text, marginTop: 4 }}>{fmt(stats.total, settings?.sym)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11, color: t.green, fontWeight: 700 }}>
            <ArrowUpRight size={12} /> 12% vs last week
          </div>
        </Card>
        <Card t={t} style={{ borderLeft: `4px solid ${t.blue}` }}>
          <div style={{ fontSize: 11, color: t.text4, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5 }}>Transactions</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: t.text, marginTop: 4 }}>{stats.count}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11, color: t.blue, fontWeight: 700 }}>
            <Calendar size={12} /> From filtered period
          </div>
        </Card>
        <Card t={t} style={{ borderLeft: `4px solid ${t.green}` }}>
          <div style={{ fontSize: 11, color: t.text4, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5 }}>Average Ticket</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: t.text, marginTop: 4 }}>{fmt(stats.avg, settings?.sym)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11, color: t.red, fontWeight: 700 }}>
            <ArrowDownRight size={12} /> 2% vs yesterday
          </div>
        </Card>
      </div>

      {/* Filters Hub */}
      <Card t={t} style={{ padding: '16px 20px', borderRadius: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.text4 }} />
          <input 
            type="text" 
            placeholder="Search Order ID or Customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 12px 10px 40px', 
              borderRadius: 12, 
              border: `1px solid ${t.border}`, 
              background: t.bg, 
              color: t.text,
              fontSize: 13,
              outline: 'none',
              transition: 'all 0.2s'
            }}
          />
        </div>
        
        <Select 
          t={t} 
          label="" 
          value={filterStatus} 
          onChange={setFilterStatus} 
          options={[
            { label: 'All Status', value: 'all' },
            { label: 'Completed', value: 'completed' },
            { label: 'Pending', value: 'pending' },
            { label: 'Cancelled', value: 'cancelled' }
          ]} 
          style={{ width: 140 }}
        />

        <Select 
          t={t} 
          label="" 
          value={filterType} 
          onChange={setFilterType} 
          options={[
            { label: 'All Types', value: 'all' },
            { label: 'In-Store', value: 'in-store' },
            { label: 'Delivery', value: 'delivery' },
            { label: 'Pickup', value: 'pickup' }
          ]} 
          style={{ width: 140 }}
        />

        <Btn t={t} variant="ghost" onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterType('all'); }} style={{ color: t.text4, fontSize: 12 }}>
          <RotateCcw size={14} /> Reset
        </Btn>
      </Card>

      {/* Orders Table */}
      <Card t={t} style={{ padding: 0, overflow: 'hidden', borderRadius: 20 }}>
        <Table 
          t={t}
          cols={['Date', 'Order ID', 'Customer', 'Type', 'Total', 'Status', 'Action']}
          rows={filteredOrders.map(o => [
            <span style={{ fontSize: 12, color: t.text3 }}>{o.date}</span>,
            <span style={{ fontWeight: 800, fontSize: 13, color: t.accent }}>{o.id}</span>,
            <div style={{ fontSize: 13, fontWeight: 600 }}>{o.customerName || 'Walk-in'}</div>,
              <Badge t={t} text={o.orderType || 'in-store'} color="blue" />,
            <span style={{ fontWeight: 900, color: t.text }}>{fmt(o.total, settings?.sym)}</span>,
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Badge t={t} text={o.status || 'Success'} color={o.status === 'completed' ? 'green' : o.status === 'cancelled' ? 'red' : 'yellow'} />
              {o.status === 'cancelled' && o.rejectionReason && (
                <div style={{ fontSize: 10, color: t.text4, fontStyle: 'italic', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }} title={o.rejectionReason}>
                  Reason: {o.rejectionReason}
                </div>
              )}
            </div>,
            <div style={{ display: 'flex', gap: 6 }}>
              {o.status === 'pending' || !o.status ? (
                <>
                  <Btn t={t} size="sm" onClick={() => handleStatusUpdate(o.id, 'completed')} style={{ background: t.green, color: '#fff', padding: '4px 8px' }}>
                    <CheckCircle size={14} /> Approve
                  </Btn>
                  <Btn t={t} size="sm" onClick={() => setRejectOrder(o)} style={{ background: t.red, color: '#fff', padding: '4px 8px' }}>
                    <XCircle size={14} /> Reject
                  </Btn>
                </>
              ) : o.status === 'completed' ? (
                <Btn t={t} variant="ghost" style={{ fontSize: 11, padding: '4px 8px', color: t.red, fontWeight: 700 }}>
                  Refund
                </Btn>
              ) : (
                <span style={{ fontSize: 11, color: t.text3 }}>No actions</span>
              )}
            </div>
          ])}
        />
        {filteredOrders.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: t.text4 }}>
             <Filter size={40} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.5 }} />
             <div style={{ fontSize: 14 }}>No transactions found for the current filters.</div>
          </div>
        )}
      </Card>

      {/* Rejection Modal */}
      {rejectOrder && (
        <Modal t={t} title="Disapprove Order" onClose={() => setRejectOrder(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: `${t.red}10`, padding: 12, borderRadius: 12 }}>
              <AlertCircle color={t.red} size={20} />
              <div style={{ fontSize: 13, color: t.text2 }}>
                You are about to cancel order <strong style={{ color: t.accent }}>{rejectOrder.id}</strong>.
              </div>
            </div>
            
            <TextArea 
              t={t} 
              label="Mandatory Reason for Disapproval" 
              placeholder="e.g., Stock unavailable, Fraudulent activity, Customer requested..." 
              value={rejectReason}
              onChange={setRejectReason}
              required
              rows={4}
            />
            
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Btn t={t} variant="outline" style={{ flex: 1 }} onClick={() => setRejectOrder(null)}>Cancel</Btn>
              <Btn 
                t={t} 
                disabled={!rejectReason.trim()}
                style={{ flex: 1, background: t.red, color: '#fff' }} 
                onClick={() => handleStatusUpdate(rejectOrder.id, 'cancelled', rejectReason)}
              >
                Confirm Disapproval
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
