import { useState } from 'react'
import { Btn, Input, Badge, Card, Modal, Select } from '@/components/ui'
import { notify } from '@/components/shared'
import { fmt } from '@/lib/utils'
import { 
  Ticket, Scissors, Plus, Check, BarChart, TrendingUp, Zap, 
  Copy, X, Trash2, Tag, Calendar, Layout, Search, 
  Activity, Sparkles, AlertCircle 
} from 'lucide-react'

export const CouponManagement = ({ coupons, setCoupons, addAudit, currentUser, t, settings }) => {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    code: '', description: '', type: 'percent', value: 10,
    minOrder: 0, maxUses: 100, active: true, expiry: '2026-12-31',
  })
  
  const [filterStatus, setFilterStatus] = useState('all')
  const [copiedId, setCopiedId] = useState(null)
  
  const safeCoupons = coupons || []
  
  const filtered = safeCoupons.filter(c => {
    if (filterStatus === 'active') return c.active
    if (filterStatus === 'expired') return new Date(c.expiry) < new Date()
    if (filterStatus === 'exhausted') return c.uses >= c.maxUses
    return true
  })
  
  const stats = {
    total: safeCoupons.length,
    active: safeCoupons.filter(c => c.active).length,
    redemptionRate: safeCoupons.length ? Math.round((safeCoupons.reduce((acc, c) => acc + (c.uses || 0), 0) / safeCoupons.reduce((acc, c) => acc + (c.maxUses || 1), 0)) * 100) : 0,
    topCode: safeCoupons.length ? safeCoupons.reduce((prev, current) => ((prev.uses || 0) > (current.uses || 0)) ? prev : current).code : 'N/A'
  }
  
  const getUsagePercent = (c) => Math.min(100, Math.round(((c.uses || 0) / (c.maxUses || 1)) * 100))
  
  const getTypeLabel = (c) => {
    if (c.type === 'percent') return `${c.value}% OFF`
    if (c.type === 'fixed') return `${fmt(c.value, settings?.sym)} OFF`
    return 'FREE DELIVERY'
  }
  
  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    notify('Code copied', 'success')
  }

  const handleToggle = (id, code, currentState) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !currentState } : c))
    addAudit({ action: 'toggle', module: 'coupons', details: `${currentState ? 'Disabled' : 'Enabled'} code ${code}` })
    notify(`Coupon ${currentState ? 'disabled' : 'enabled'}`, 'success')
  }
  
  const handleDelete = (id, code) => {
    if (window.confirm('Erase this voucher blueprint?')) {
      setCoupons(prev => prev.filter(c => c.id !== id))
      addAudit({ action: 'delete', module: 'coupons', details: `Deleted code ${code}` })
      notify('Coupon deleted', 'success')
    }
  }
  
  const handleAdd = () => {
    const newCoupon = { ...form, id: Date.now().toString(), uses: 0 }
    setCoupons(prev => [newCoupon, ...prev])
    setShowAdd(false)
    addAudit({ action: 'create', module: 'coupons', details: `Created code ${form.code}` })
    notify('Coupon created successfully', 'success')
    setForm({
      code: '', description: '', type: 'percent', value: 10,
      minOrder: 0, maxUses: 100, active: true, expiry: '2026-12-31',
    })
  }

  return (
    <div className="voucher-hub-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .voucher-hub-root {
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
        .header-title-box h1 {
          font-size: 36px;
          font-weight: 900;
          letter-spacing: -0.04em;
          margin: 0;
          color: var(--text-deep);
        }
        .header-breadcrumb {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        .action-btns { display: flex; gap: 12px; }
        .premium-btn {
          border: none; padding: 12px 24px; border-radius: 16px; font-size: 14px; font-weight: 800; cursor: pointer;
          display: flex; align-items: center; gap: 10px; transition: all 0.2s;
        }
        .premium-btn.primary { background: var(--primary); color: white; box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.3); }
        .premium-btn.outline { background: white; border: 1px solid #E2E8F0; color: var(--text-deep); }
        .premium-btn:hover { transform: translateY(-2px); }

        /* KPI Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
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
        }
        .stat-card.accent { background: linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%); color: white; }
        .sc-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.6; margin-bottom: 8px; }
        .sc-value { font-size: 36px; font-weight: 900; letter-spacing: -0.03em; }

        /* Filter Hub */
        .filter-hub {
            display: flex; gap: 12px; margin-bottom: 32px;
            background: white; padding: 10px; border-radius: 20px; border: 1px solid var(--glass-border);
            width: fit-content;
        }
        .filter-chip {
            padding: 10px 24px; border-radius: 14px; border: none; background: transparent;
            color: var(--text-muted); font-weight: 800; font-size: 13px; cursor: pointer; transition: 0.2s;
        }
        .filter-chip.active { background: var(--primary); color: white; box-shadow: 0 8px 16px -4px rgba(99, 102, 241, 0.3); }

        /* Ticket Grid */
        .ticket-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
        }
        .voucher-ticket {
          background: white;
          border-radius: 32px;
          padding: 32px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 12px 40px -15px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
          transition: 0.3s;
        }
        .voucher-ticket:hover { transform: translateY(-8px); border-color: var(--primary); }
        .voucher-ticket.disabled { opacity: 0.6; }

        .ticket-cutout {
            position: absolute; width: 32px; height: 32px; background: var(--bg-main); border-radius: 50%;
            top: 50%; transform: translateY(-50%);
        }
        .cutout-left { left: -16px; box-shadow: inset -4px 0 8px rgba(0,0,0,0.03); border-right: 1px solid var(--glass-border); }
        .cutout-right { right: -16px; box-shadow: inset 4px 0 8px rgba(0,0,0,0.03); border-left: 1px solid var(--glass-border); }

        .ticket-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .code-box { display: flex; align-items: center; gap: 12px; }
        .code-text { font-family: 'Outfit', sans-serif; font-weight: 950; font-size: 26px; letter-spacing: 2px; color: var(--text-deep); }
        
        .discount-badge { 
            font-size: 32px; font-weight: 900; color: var(--primary); letter-spacing: -0.04em;
            background: linear-gradient(135deg, #6366F1, #4F46E5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .usage-analytics { background: #F8FAFC; padding: 20px; border-radius: 20px; }
        .usage-bar-bg { height: 8px; width: 100%; background: #E2E8F0; border-radius: 4px; overflow: hidden; margin: 12px 0; }
        .usage-bar-fill { height: 100%; border-radius: 4px; transition: 1s cubic-bezier(0.1, 1, 0.3, 1); }

        .ticket-actions { display: flex; gap: 12px; }
        .icon-btn { 
            height: 48px; border: none; border-radius: 14px; background: #F4F7FE; color: var(--text-muted);
            display: flex; align-items: center; justify-content: center; transition: 0.2s; cursor: pointer;
        }
        .icon-btn.primary { background: #EEF2FF; color: var(--primary); flex: 1; font-weight: 800; font-size: 13px; }
        .icon-btn.critical { background: #FEE2E2; color: #EF4444; width: 48px; }
        .icon-btn:hover { transform: scale(1.05); }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-hub { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* Header */}
      <div className="hub-header animate-hub">
        <div className="header-title-box">
          <div className="header-breadcrumb">Marketing Arsenal</div>
          <h1>Voucher Intelligence</h1>
        </div>
        <div className="action-btns">
            <button className="premium-btn outline"><Scissors size={18} /> Batch Generator</button>
            <button className="premium-btn primary" onClick={() => setShowAdd(true)}><Plus size={18} strokeWidth={2.5} /> New Campaign</button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card accent animate-hub" style={{ animationDelay: '0.1s' }}>
          <div className="sc-label">Deployed Coupons</div>
          <div className="sc-value">{stats.total}</div>
          <Ticket size={80} style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.1, transform: 'rotate(-20deg)' }} />
        </div>
        <div className="stat-card animate-hub" style={{ animationDelay: '0.2s' }}>
          <div className="sc-label">Redemption Node</div>
          <div className="sc-value">{stats.redemptionRate}%</div>
          <Activity size={80} style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.05, color: 'var(--primary)' }} />
        </div>
        <div className="stat-card animate-hub" style={{ animationDelay: '0.3s' }}>
          <div className="sc-label">Active Vectors</div>
          <div className="sc-value">{stats.active}</div>
          <Zap size={80} style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.05, color: '#10B981' }} />
        </div>
        <div className="stat-card animate-hub" style={{ animationDelay: '0.4s' }}>
          <div className="sc-label">Hero Module</div>
          <div className="sc-value" style={{ fontSize: 24, padding: '10px 0' }}>{stats.topCode}</div>
          <Sparkles size={80} style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.05, color: '#f59e0b' }} />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="filter-hub animate-hub" style={{ animationDelay: '0.5s' }}>
          {['all', 'active', 'expired', 'exhausted'].map(tab => (
              <button key={tab} className={`filter-chip ${filterStatus === tab ? 'active' : ''}`} onClick={() => setFilterStatus(tab)}>
                  {tab.toUpperCase()}
              </button>
          ))}
      </div>

      {/* Ticket Grid */}
      <div className="ticket-grid">
        {filtered.map((c, idx) => {
          const usagePercent = getUsagePercent(c)
          const isFull = usagePercent >= 100
          return (
            <div key={c.id} className={`voucher-ticket animate-hub ${!c.active ? 'disabled' : ''}`} style={{ animationDelay: `${0.6 + idx * 0.1}s` }}>
              <div className="ticket-cutout cutout-left" />
              <div className="ticket-cutout cutout-right" />
              
              <div className="ticket-header">
                <div>
                   <div className="code-box">
                      <span className="code-text">{c.code}</span>
                      <button className="icon-btn" onClick={() => handleCopy(c.code, c.id)} style={{ width: 32, height: 32, borderRadius: 8 }}>
                         {copiedId === c.id ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                      </button>
                   </div>
                   <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>{c.description}</div>
                </div>
                <div className="discount-badge">{getTypeLabel(c)}</div>
              </div>

              <div className="usage-analytics">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                   <span style={{ color: 'var(--text-muted)' }}>Velocity Metrics</span>
                   <span>{c.uses} / {c.maxUses} Deployed</span>
                </div>
                <div className="usage-bar-bg">
                   <div className="usage-bar-fill" style={{ width: `${usagePercent}%`, background: isFull ? '#EF4444' : 'var(--primary)' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                   <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={12} /> EXPIRES: {c.expiry}
                   </div>
                   <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Tag size={12} /> FLOOR: {fmt(c.minOrder, settings?.sym)}
                   </div>
                </div>
              </div>

              <div className="ticket-actions">
                <button className="icon-btn primary" onClick={() => handleToggle(c.id, c.code, c.active)}>
                   {c.active ? <><X size={16} /> PAUSE CAMPAIGN</> : <><Check size={16} /> REACTIVATE</>}
                </button>
                <button className="icon-btn critical" onClick={() => handleDelete(c.id, c.code)}>
                   <Trash2 size={18} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Creation Modal */}
      {showAdd && (
        <div className="modal-overlay" style={{ 
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', padding: 24
        }} onClick={() => setShowAdd(false)}>
          <div style={{ 
            maxWidth: 600, width: '100%', borderRadius: 40, padding: 48, background: '#fff',
            boxShadow: '0 40px 100px rgba(0,0,0,0.2)', position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
               <div style={{ 
                  width: 72, height: 72, borderRadius: 24, background: '#EEF2FF', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '0 auto 24px'
               }}>
                  <Ticket size={36} />
               </div>
               <h2 style={{ fontSize: 32, fontWeight: 950, letterSpacing: '-0.04em', margin: '0 0 8px 0' }}>Initialize Voucher</h2>
               <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Configure a new revenue-generation logic component.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
               <Input t={t} label="Voucher Code" value={form.code} onChange={v => setForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="SAVE20" />
               <Select t={t} label="Reward Logic" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} 
                  options={[{ value: 'percent', label: 'Percent Yield' }, { value: 'fixed', label: 'Fixed Value' }, { value: 'delivery', label: 'Logistic Comp' }]} />
               <Input t={t} label="Value Yield" value={form.value} onChange={v => setForm(f => ({ ...f, value: +v }))} type="number" />
               <Input t={t} label="Floor Threshold" value={form.minOrder} onChange={v => setForm(f => ({ ...f, minOrder: +v }))} type="number" />
               <Input t={t} label="Capacity Limit" value={form.maxUses} onChange={v => setForm(f => ({ ...f, maxUses: +v }))} type="number" />
               <Input t={t} label="End-of-Life" value={form.expiry} onChange={v => setForm(f => ({ ...f, expiry: v }))} type="date" />
            </div>

            <div style={{ marginBottom: 40 }}>
               <Input t={t} label="Internal Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Wait till you see these..." />
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <button className="premium-btn outline" style={{ flex: 1, height: 56, borderRadius: 20 }} onClick={() => setShowAdd(false)}>Abort</button>
              <button className="premium-btn primary" style={{ flex: 2, height: 56, borderRadius: 20 }} onClick={handleAdd} disabled={!form.code}>Commit Component</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
