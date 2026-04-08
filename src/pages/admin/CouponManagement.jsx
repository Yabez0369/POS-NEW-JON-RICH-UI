import { useState } from 'react'
import { Btn, Input, Badge, Card, Modal, Select } from '@/components/ui'
import { notify } from '@/components/shared'
import { fmt } from '@/lib/utils'
import { Ticket, Scissors, Plus, Check, BarChart, TrendingUp, Zap, Copy, X, Trash2 } from 'lucide-react'

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
    if (window.confirm('Are you sure you want to delete this coupon?')) {
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

  const generateBatch = () => {
    notify('Batch generation coming soon', 'info')
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

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: 16,
        position: 'sticky',
        top: -32,
        zIndex: 50,
        background: '#f8fafc',
        padding: '16px 0',
        margin: '-16px 0 0 0'
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 12, letterSpacing: '-0.03em' }}>
            <Ticket size={24} color="#4f46e5" strokeWidth={2.5} /> Coupon Codes
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Btn t={t} variant="outline" style={{ 
            borderRadius: 14, 
            padding: '8px 16px', 
            fontSize: 13,
            fontWeight: 800,
            color: '#64748b',
            display: 'flex', 
            alignItems: 'center', 
            gap: 10,
            background: '#fff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }} onClick={generateBatch}>
            <Scissors size={16} /> Batch
          </Btn>
          <Btn t={t} onClick={() => setShowAdd(true)} style={{ 
            borderRadius: 14, 
            background: 'linear-gradient(135deg, #4f46e5, #4338ca)', 
            color: '#fff', 
            padding: '8px 20px', 
            fontWeight: 900, 
            fontSize: 13,
            display: 'flex', 
            alignItems: 'center', 
            gap: 10,
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
            border: 'none'
          }}>
            <Plus size={18} /> New Coupon
          </Btn>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        {[
          { label: 'Total Coupons', value: stats.total, color: '#4f46e5', icon: <Ticket size={24} /> },
          { label: 'Active Codes', value: stats.active, color: '#22c55e', icon: <Check size={24} /> },
          { label: 'Redemption Rate', value: `${stats.redemptionRate}%`, color: '#3b82f6', icon: <BarChart size={24} /> },
          { label: 'Top Performer', value: stats.topCode, color: '#f59e0b', icon: <TrendingUp size={24} />, small: true },
        ].map(({ label, value, color, icon, small }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: color }} />
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
              <div style={{ fontSize: small ? 20 : 32, fontWeight: 900, color: '#0f172a', marginTop: 4, letterSpacing: '-0.02em', wordBreak: 'break-all' }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', background: '#f1f5f9', padding: 6, borderRadius: 16, width: 'fit-content' }}>
          {[
              { id: 'all', label: 'All Coupons' },
              { id: 'active', label: 'Active Only' },
              { id: 'expired', label: 'Expired' },
              { id: 'exhausted', label: 'Exhausted' }
          ].map(tab => (
              <button key={tab.id} onClick={() => setFilterStatus(tab.id)} style={{
                  padding: '10px 20px', borderRadius: 12, border: 'none',
                  background: filterStatus === tab.id ? '#fff' : 'transparent',
                  color: filterStatus === tab.id ? '#4f46e5' : '#64748b',
                  boxShadow: filterStatus === tab.id ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                  fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
              }}>
                  {tab.label}
              </button>
          ))}
      </div>

      {/* Demo Hint */}
      <div style={{ 
        background: '#fff9eb', 
        border: '1px solid #fde68a', 
        borderRadius: 20, 
        padding: '20px 28px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 16,
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.05)'
      }}>
        <Zap size={20} color="#f59e0b" strokeWidth={2.5} />
        <span style={{ fontSize: 14, color: '#92400e', fontWeight: 700 }}>
          Test codes at POS checkout:&nbsp;&nbsp;
          {['FANDAY10', 'WELCOME20', 'FREESHIP'].map(code => (
            <code key={code} style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 8, fontWeight: 900, fontSize: 13, marginRight: 10, letterSpacing: 1, border: '1px solid #fcd34d' }}>{code}</code>
          ))}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: '#fff', padding: 80, textAlign: 'center', borderRadius: 32, boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎟️</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{filterStatus === 'all' ? 'No Coupons Yet' : 'No Results Found'}</div>
          <div style={{ fontSize: 15, color: '#64748b', marginTop: 8, fontWeight: 600 }}>
            {filterStatus === 'all' 
              ? 'Create your first coupon to drive sales and reward customers.' 
              : 'Try adjusting your filters to see more coupons.'}
          </div>
          {filterStatus === 'all' && (
            <Btn t={t} onClick={() => setShowAdd(true)} style={{ 
              marginTop: 32, 
              background: '#4f46e5', 
              color: '#fff', 
              borderRadius: 16, 
              padding: '16px 32px', 
              fontWeight: 900,
              fontSize: 15,
              boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)',
              border: 'none'
            }}>+ Create First Coupon</Btn>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 90vw), 1fr))', gap: 24 }}>
          {filtered.map(c => {
            const usagePct = getUsagePercent(c)
            const isNearlyFull = usagePct > 80
            return (
              <div key={c.id} style={{
                background: '#fff',
                borderRadius: 28, 
                padding: 32, 
                boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                opacity: c.active ? 1 : 0.6,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 6, background: c.active ? '#4f46e5' : '#e2e8f0' }} />
                
                {/* Coupon Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', fontFamily: 'monospace', letterSpacing: 1 }}>{c.code}</span>
                      <button onClick={() => handleCopy(c.code, c.id)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: copiedId === c.id ? '#22c55e' : '#94a3b8', padding: 8, borderRadius: 10, display: 'flex', transition: 'all 0.2s' }}>
                        {copiedId === c.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div style={{ fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: 600 }}>{c.description}</div>
                  </div>
                  <Badge t={t} text={c.active ? 'ACTIVE' : 'DISABLED'} color={c.active ? 'green' : 'red'} style={{ fontWeight: 900, padding: '6px 12px', borderRadius: 10, fontSize: 10 }} />
                </div>

                {/* Coupon Body */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontWeight: 900, color: '#4f46e5', fontSize: 20, letterSpacing: '-0.02em' }}>{getTypeLabel(c)}</div>
                    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 800, background: '#f8fafc', padding: '6px 12px', borderRadius: 10 }}>Min: {fmt(c.minOrder, settings?.sym)}</div>
                  </div>

                  {/* Usage Bar */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: 700 }}>
                      <span>Usage Analytics</span>
                      <span style={{ color: isNearlyFull ? '#ef4444' : '#0f172a', fontWeight: 900 }}>{c.uses || 0} / {c.maxUses} used</span>
                    </div>
                    <div style={{ height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${usagePct}%`, background: isNearlyFull ? '#ef4444' : '#4f46e5', borderRadius: 5, transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    Expires: <span style={{ color: '#0f172a', fontWeight: 900 }}>{c.expiry}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <Btn t={t} variant="ghost" style={{ 
                    flex: 1, 
                    fontSize: 13, 
                    fontWeight: 800, 
                    color: c.active ? '#ef4444' : '#22c55e',
                    background: c.active ? '#fef2f2' : '#f0fdf4',
                    borderRadius: 14,
                    padding: '12px'
                  }}
                    onClick={() => handleToggle(c.id, c.code, c.active)}>
                    {c.active ? <><X size={16} /> Disable Code</> : <><Check size={16} /> Enable Code</>}
                  </Btn>
                  <Btn t={t} variant="ghost" style={{ 
                    color: '#ef4444', 
                    background: '#fef2f2', 
                    borderRadius: 14, 
                    width: 48, 
                    height: 48, 
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center' 
                  }}
                    onClick={() => handleDelete(c.id, c.code)}>
                    <Trash2 size={20} />
                  </Btn>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAdd && (
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
        }} onClick={() => setShowAdd(false)}>
          <div style={{ 
            maxWidth: 550, 
            width: '100%', 
            borderRadius: 40, 
            padding: 48, 
            background: '#fff',
            boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
            position: 'relative',
            animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>Create New Coupon</h2>
              <p style={{ fontSize: 15, color: '#64748b', fontWeight: 600 }}>Configure a new discount code for your system.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Coupon Code *</label>
                  <input 
                    type="text" 
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                    placeholder="SAVE20"
                    style={{ width: '100%', padding: '14px 18px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Discount Type</label>
                  <Select t={t} label="" value={form.type}
                    onChange={v => setForm(f => ({ ...f, type: v }))}
                    options={[{ value: 'percent', label: '% Percentage Off' }, { value: 'fixed', label: 'Fixed Amount Off' }, { value: 'delivery', label: 'Free Delivery' }]} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{form.type === 'percent' ? 'Discount %' : form.type === 'fixed' ? 'Amount' : 'N/A'}</label>
                  <input 
                    type="number" 
                    value={form.value}
                    onChange={e => setForm(f => ({ ...f, value: +e.target.value }))}
                    disabled={form.type === 'delivery'}
                    style={{ width: '100%', padding: '14px 18px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Min Order</label>
                  <input 
                    type="number" 
                    value={form.minOrder}
                    onChange={e => setForm(f => ({ ...f, minOrder: +e.target.value }))}
                    style={{ width: '100%', padding: '14px 18px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Max Uses</label>
                  <input 
                    type="number" 
                    value={form.maxUses}
                    onChange={e => setForm(f => ({ ...f, maxUses: +e.target.value }))}
                    style={{ width: '100%', padding: '14px 18px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Expiry Date</label>
                  <input 
                    type="date" 
                    value={form.expiry}
                    onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))}
                    style={{ width: '100%', padding: '14px 18px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Description</label>
                <input 
                  type="text" 
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Welcome offer for new members"
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none' }}
                />
              </div>

              {/* Live Preview */}
              {form.code && (
                <div style={{ 
                  padding: '24px', 
                  borderRadius: 24, 
                  background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(124, 58, 237, 0.05))', 
                  border: '2px dashed #4f46e5',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 12, color: '#4f46e5', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.5 }}>LIVE PREVIEW</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', fontFamily: 'monospace', letterSpacing: 4 }}>{form.code}</div>
                  <div style={{ fontSize: 15, color: '#64748b', marginTop: 8, fontWeight: 700 }}>
                    {form.type === 'percent' ? `${form.value}% off orders over ${fmt(form.minOrder, settings?.sym)}` :
                    form.type === 'fixed' ? `${fmt(form.value, settings?.sym)} off orders over ${fmt(form.minOrder, settings?.sym)}` :
                    'Free delivery on qualifying orders'}
                  </div>
                </div>
              )}

              <Btn t={t} onClick={handleAdd} disabled={!form.code}
                style={{ 
                  marginTop: 8,
                  padding: 20, 
                  background: 'linear-gradient(135deg, #4f46e5, #4338ca)', 
                  color: '#fff', 
                  borderRadius: 20, 
                  fontWeight: 900,
                  fontSize: 16,
                  boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
                  border: 'none'
                }}>
                <Ticket size={22} style={{ marginRight: 10 }} /> Create Coupon Code
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
