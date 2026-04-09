import { useState, useMemo } from 'react'
import { Card, Table, Badge, Btn, Select, Modal, TextArea } from '@/components/ui'
import { fmt } from '@/lib/utils'
import { 
  Search, Filter, RotateCcw, Download, Calendar, ArrowUpRight, 
  ArrowDownRight, CheckCircle, XCircle, AlertCircle, ShoppingBag, 
  TrendingUp, Activity, DollarSign 
} from 'lucide-react'
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
    <div className="sales-hub-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .sales-hub-root {
          --primary: #6366F1;
          --bg-main: #F4F7FE;
          --text-deep: #0F172A;
          --text-muted: #64748B;
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(226, 232, 240, 0.8);
          
          background: var(--bg-main);
          min-height: calc(100vh - 64px);
          margin: -24px;
          padding: 32px 40px;
          font-family: 'Outfit', sans-serif;
          color: var(--text-deep);
        }

        .hub-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }
        .hub-title-box h1 {
          font-size: 36px;
          font-weight: 900;
          letter-spacing: -0.04em;
          margin: 0;
          color: var(--text-deep);
        }
        .hub-breadcrumb {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        /* KPI Bento Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }
        .stat-card {
          background: white;
          border-radius: 32px;
          padding: 32px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
          transition: transform 0.3s;
        }
        .stat-card:hover { transform: translateY(-4px); }
        .stat-card.accent { background: linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%); color: white; }

        .sc-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.6; margin-bottom: 8px; }
        .stat-card.accent .sc-label { opacity: 0.8; }
        .sc-value { font-size: 42px; font-weight: 900; letter-spacing: -0.03em; margin-bottom: 12px; }
        .sc-trend { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 800; }
        .sc-trend.up { color: #10B981; }
        .sc-trend.down { color: #EF4444; }
        .stat-card.accent .sc-trend { color: rgba(255, 255, 255, 0.8); }

        /* Filter Hub */
        .filter-hub {
          background: white;
          border-radius: 28px;
          padding: 24px 32px;
          margin-bottom: 32px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .search-wrap {
          position: relative;
          flex: 1;
          min-width: 300px;
        }
        .search-wrap input {
          width: 100%;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 14px 16px 14px 48px;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          transition: 0.2s;
        }
        .search-wrap input:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }

        .action-btns { display: flex; gap: 12px; }
        .premium-btn {
          border: none; padding: 12px 24px; border-radius: 16px; font-size: 14px; font-weight: 800; cursor: pointer;
          display: flex; align-items: center; gap: 10px; transition: all 0.2s;
        }
        .premium-btn.primary { background: var(--primary); color: white; box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.3); }
        .premium-btn.outline { background: white; border: 1px solid #E2E8F0; color: var(--text-deep); }
        .premium-btn:hover { transform: translateY(-2px); }

        /* Table Area */
        .ledger-container {
          background: white;
          border-radius: 32px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 10px 40px -15px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .order-id { font-weight: 900; color: var(--primary); font-family: 'Outfit', sans-serif; letter-spacing: -0.02em; }
        .customer-cell { display: flex; align-items: center; gap: 12px; }
        .customer-avatar { width: 32px; height: 32px; border-radius: 10px; background: #EEF2FF; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .customer-name { font-weight: 800; font-size: 14px; }

        .type-pill { padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-badge { padding: 6px 12px; border-radius: 12px; font-size: 11px; font-weight: 950; letter-spacing: 1px; }

        .action-row { display: flex; gap: 8px; }
        .action-icon-btn { 
          padding: 8px; border-radius: 10px; border: none; cursor: pointer; transition: 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .action-icon-btn.approve { background: #DCFCE7; color: #166534; }
        .action-icon-btn.reject { background: #FEE2E2; color: #991B1B; }
        .action-icon-btn:hover { transform: scale(1.1); }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-hub { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* Header */}
      <div className="hub-header animate-hub">
        <div className="hub-title-box">
          <div className="hub-breadcrumb">Transaction Ledger</div>
          <h1>Revenue Command Center</h1>
        </div>
        <div className="action-btns">
            <button className="premium-btn outline"><Download size={18} /> Export Data</button>
            <button className="premium-btn primary"><ShoppingBag size={18} strokeWidth={2.5} /> New Transaction</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card accent animate-hub" style={{ animationDelay: '0.1s' }}>
          <div className="sc-label">Total Volume</div>
          <div className="sc-value">{fmt(stats.total, settings?.sym)}</div>
          <div className="sc-trend"><TrendingUp size={16} /> +12.4% vs last period</div>
          <DollarSign size={80} style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }} />
        </div>

        <div className="stat-card animate-hub" style={{ animationDelay: '0.2s' }}>
          <div className="sc-label">Transaction Count</div>
          <div className="sc-value">{stats.count}</div>
          <div className="sc-trend up"><Activity size={16} /> Stable Velocity</div>
          <ShoppingBag size={80} style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.05, color: 'var(--primary)' }} />
        </div>

        <div className="stat-card animate-hub" style={{ animationDelay: '0.3s' }}>
          <div className="sc-label">Average Ticket</div>
          <div className="sc-value">{fmt(stats.avg, settings?.sym)}</div>
          <div className="sc-trend down"><ArrowDownRight size={16} /> -2.1% volatility</div>
          <TrendingUp size={80} style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.05, color: '#10B981' }} />
        </div>
      </div>

      {/* Filter Hub */}
      <div className="filter-hub animate-hub" style={{ animationDelay: '0.4s' }}>
        <div className="search-wrap">
          <Search size={18} className="search-icon" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search Order ID, Customer or Reference..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select 
          t={t} 
          value={filterStatus} 
          onChange={setFilterStatus} 
          options={[
            { label: 'All Statuses', value: 'all' },
            { label: 'Completed', value: 'completed' },
            { label: 'Pending', value: 'pending' },
            { label: 'Cancelled', value: 'cancelled' }
          ]} 
          style={{ width: 180, height: 48, borderRadius: 16 }}
        />

        <Select 
          t={t} 
          value={filterType} 
          onChange={setFilterType} 
          options={[
            { label: 'All Channels', value: 'all' },
            { label: 'In-Store', value: 'in-store' },
            { label: 'Delivery', value: 'delivery' },
            { label: 'Pickup', value: 'pickup' }
          ]} 
          style={{ width: 180, height: 48, borderRadius: 16 }}
        />

        <button 
          onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterType('all'); }} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {/* Ledger Table */}
      <div className="ledger-container animate-hub" style={{ animationDelay: '0.5s' }}>
        <Table 
          t={t}
          cols={['Timestamp', 'Reference', 'Customer Profile', 'Channel', 'Valuation', 'Status', 'Operations']}
          rows={filteredOrders.map(o => [
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>{o.date}</span>,
            <span className="order-id">#{o.id?.toString().toUpperCase().substring(0, 8)}</span>,
            <div className="customer-cell">
              <div className="customer-avatar">{o.customerName ? o.customerName[0] : 'W'}</div>
              <div className="customer-name">{o.customerName || 'Walk-in Guest'}</div>
            </div>,
            <div style={{ display: 'flex' }}>
                <span className="type-pill" style={{ background: '#F1F5F9', color: '#475569' }}>{o.orderType || 'Retail'}</span>
            </div>,
            <span style={{ fontWeight: 900, fontSize: 16 }}>{fmt(o.total, settings?.sym)}</span>,
            <Badge 
                t={t} 
                text={o.status?.toUpperCase() || 'SUCCESS'} 
                color={o.status === 'completed' ? 'green' : o.status === 'cancelled' ? 'red' : 'yellow'} 
                style={{ borderRadius: 10, fontWeight: 900, border: 'none' }} 
            />,
            <div className="action-row">
              {o.status === 'pending' || !o.status ? (
                <>
                  <button className="action-icon-btn approve" onClick={() => handleStatusUpdate(o.id, 'completed')} title="Approve">
                    <CheckCircle size={18} strokeWidth={2.5} />
                  </button>
                  <button className="action-icon-btn reject" onClick={() => setRejectOrder(o)} title="Disapprove">
                    <XCircle size={18} strokeWidth={2.5} />
                  </button>
                </>
              ) : (
                <button className="premium-btn outline" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 10 }}>
                    Details
                </button>
              )}
            </div>
          ])}
        />
        {filteredOrders.length === 0 && (
          <div style={{ padding: 100, textAlign: 'center', color: 'var(--text-muted)' }}>
             <Filter size={48} strokeWidth={1.5} style={{ marginBottom: 20, opacity: 0.3 }} />
             <div style={{ fontSize: 18, fontWeight: 800 }}>No transaction records found.</div>
          </div>
        )}
      </div>

      {/* Modal Redesign */}
      {rejectOrder && (
        <div className="modal-overlay" style={{ 
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', padding: 24
        }} onClick={() => setRejectOrder(null)}>
          <div style={{ 
            maxWidth: 520, width: '100%', borderRadius: 40, padding: 48, background: '#fff',
            boxShadow: '0 40px 100px rgba(0,0,0,0.2)', position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ 
                width: 80, height: 80, borderRadius: 24, background: '#FEE2E2', display: 'flex', 
                alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#EF4444'
              }}>
                <AlertCircle size={40} />
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>Disapprove Order</h2>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 600 }}>Revoking transaction <span style={{ color: 'var(--primary)', fontWeight: 900 }}>#{rejectOrder.id}</span></p>
            </div>
            
            <div style={{ marginBottom: 32 }}>
              <TextArea 
                t={t} 
                label="Mandatory Operational Reason" 
                placeholder="Briefly explain the disapproval reason..." 
                value={rejectReason}
                onChange={setRejectReason}
                required
                rows={3}
                style={{ borderRadius: 20, padding: 20, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 15 }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <button className="premium-btn outline" style={{ flex: 1, height: 56, borderRadius: 20 }} onClick={() => setRejectOrder(null)}>Abort</button>
              <button 
                className="premium-btn"
                disabled={!rejectReason.trim()}
                style={{ 
                  flex: 1, height: 56, borderRadius: 20, background: '#EF4444', color: 'white', 
                  boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)', fontWeight: 900
                }} 
                onClick={() => handleStatusUpdate(rejectOrder.id, 'cancelled', rejectReason)}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
