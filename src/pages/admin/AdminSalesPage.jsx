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
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 32,
      background: '#f8fafc',
      margin: '-24px',
      padding: '32px',
      minHeight: 'calc(100vh - 64px)',
      animation: 'fadeIn 0.5s ease-out' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Sales Hub</h1>
          <p style={{ fontSize: 16, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Manage transactions, refunds, and performance.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Btn t={t} variant="outline" style={{ borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', color: '#475569' }}>
            <Download size={18} /> Export CSV
          </Btn>
          <Btn t={t} style={{ borderRadius: 12, padding: '10px 24px', fontSize: 14, fontWeight: 900, background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: '#fff', boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)', border: 'none' }}>
            + New Simulation
          </Btn>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: '#4f46e5' }} />
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1 }}>Total Revenue</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginTop: 8, letterSpacing: '-0.02em' }}>{fmt(stats.total, settings?.sym)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 13, color: '#22c55e', fontWeight: 800 }}>
            <ArrowUpRight size={16} /> 12% <span style={{ color: '#94a3b8', fontWeight: 600 }}>vs last week</span>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: '#3b82f6' }} />
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1 }}>Transactions</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginTop: 8, letterSpacing: '-0.02em' }}>{stats.count}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 13, color: '#3b82f6', fontWeight: 800 }}>
            <Calendar size={16} /> <span style={{ color: '#94a3b8', fontWeight: 600 }}>From filtered period</span>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: '#22c55e' }} />
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1 }}>Average Ticket</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginTop: 8, letterSpacing: '-0.02em' }}>{fmt(stats.avg, settings?.sym)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 13, color: '#ef4444', fontWeight: 800 }}>
            <ArrowDownRight size={16} /> 2% <span style={{ color: '#94a3b8', fontWeight: 600 }}>vs yesterday</span>
          </div>
        </div>
      </div>

      {/* Filters Hub */}
      <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search Order ID or Customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '14px 16px 14px 48px', 
              borderRadius: 16, 
              border: '1px solid #e2e8f0', 
              background: '#f8fafc', 
              color: '#0f172a',
              fontSize: 14,
              fontWeight: 600,
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
          style={{ width: 160, height: 48 }}
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
          style={{ width: 160, height: 48 }}
        />

        <Btn t={t} variant="ghost" onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterType('all'); }} style={{ color: '#94a3b8', fontSize: 13, fontWeight: 800 }}>
          <RotateCcw size={16} /> Reset
        </Btn>
      </div>

    {/* Orders Table */}
      <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <Table 
          t={t}
          cols={['Date', 'Order ID', 'Customer', 'Type', 'Total', 'Status', 'Action']}
          rows={filteredOrders.map(o => [
            <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>{o.date}</span>,
            <span style={{ fontWeight: 900, fontSize: 14, color: '#4f46e5' }}>{o.id}</span>,
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{o.customerName || 'Walk-in'}</div>,
            <Badge t={t} text={o.orderType || 'in-store'} color="blue" style={{ fontWeight: 800, borderRadius: 8 }} />,
            <span style={{ fontWeight: 900, color: '#0f172a', fontSize: 15 }}>{fmt(o.total, settings?.sym)}</span>,
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Badge t={t} text={o.status === 'completed' ? 'SUCCESS' : o.status?.toUpperCase() || 'SUCCESS'} color={o.status === 'completed' ? 'green' : o.status === 'cancelled' ? 'red' : 'yellow'} style={{ fontWeight: 900, borderRadius: 8 }} />
              {o.status === 'cancelled' && o.rejectionReason && (
                <div style={{ fontSize: 11, color: '#ef4444', fontStyle: 'italic', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                  {o.rejectionReason}
                </div>
              )}
            </div>,
            <div style={{ display: 'flex', gap: 10 }}>
              {o.status === 'pending' || !o.status ? (
                <>
                  <Btn t={t} size="sm" onClick={() => handleStatusUpdate(o.id, 'completed')} style={{ background: '#22c55e', color: '#fff', padding: '6px 12px', borderRadius: 10, fontWeight: 800 }}>
                    <CheckCircle size={14} /> Approve
                  </Btn>
                  <Btn t={t} size="sm" onClick={() => setRejectOrder(o)} style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', borderRadius: 10, fontWeight: 800 }}>
                    <XCircle size={14} /> Reject
                  </Btn>
                </>
              ) : o.status === 'completed' ? (
                <Btn t={t} variant="ghost" style={{ fontSize: 14, padding: '6px 14px', color: '#ef4444', fontWeight: 800, borderRadius: 10, background: '#fef2f2' }}>
                  Refund
                </Btn>
              ) : (
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Closed</span>
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
      </div>

      {/* Rejection Modal */}
      {rejectOrder && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 9999, 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24
        }} onClick={() => setRejectOrder(null)}>
          <div style={{ 
            maxWidth: 500, 
            width: '100%', 
            borderRadius: 40, 
            padding: 48, 
            background: '#fff',
            boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
            position: 'relative',
            animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: 24, 
                background: '#fef2f2', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 24px',
                color: '#ef4444',
                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.1)'
              }}>
                <AlertCircle size={40} />
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>Disapprove Order</h2>
              <p style={{ fontSize: 15, color: '#64748b', fontWeight: 600 }}>You are about to cancel order <span style={{ color: '#4f46e5', fontWeight: 800 }}>{rejectOrder.id}</span></p>
            </div>
            
            <div style={{ marginBottom: 32 }}>
              <TextArea 
                t={t} 
                label="Mandatory Reason for Disapproval" 
                placeholder="e.g., Stock unavailable, Fraudulent activity..." 
                value={rejectReason}
                onChange={setRejectReason}
                required
                rows={4}
                style={{ 
                  borderRadius: 16, 
                  border: '1px solid #e2e8f0', 
                  padding: 16,
                  fontSize: 14,
                  background: '#f8fafc'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <Btn t={t} variant="outline" style={{ flex: 1, borderRadius: 16, padding: 18, fontWeight: 800, color: '#64748b' }} onClick={() => setRejectOrder(null)}>Cancel</Btn>
              <Btn 
                t={t} 
                disabled={!rejectReason.trim()}
                style={{ 
                  flex: 1, 
                  borderRadius: 16, 
                  padding: 18, 
                  fontWeight: 900, 
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                  color: '#fff',
                  boxShadow: '0 10px 25px rgba(239, 68, 68, 0.25)',
                  border: 'none'
                }} 
                onClick={() => handleStatusUpdate(rejectOrder.id, 'cancelled', rejectReason)}
              >
                Confirm Cancel
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
