import { useState, useMemo } from 'react'
import { Btn, Input, Badge, Card, Modal, Select } from '@/components/ui'
import { notify } from '@/components/shared'
import { fmt } from '@/lib/utils'
import { Ticket, Plus, Trash2, Check, X, Copy, TrendingUp, Users, Zap, Scissors, BarChart } from 'lucide-react'

export const CouponManagement = ({ coupons = [], setCoupons, addAudit, currentUser, t, settings }) => {
  const [showAdd, setShowAdd] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [form, setForm] = useState({
    code: '', description: '', type: 'percent', value: 10,
    minOrder: 0, maxUses: 100, active: true, expiry: '2026-12-31',
  })

  const stats = useMemo(() => {
    const active = coupons.filter(c => c.active && (new Date(c.expiry) >= new Date()))
    const totalUses = coupons.reduce((s, c) => s + (c.uses || 0), 0)
    const totalMax = coupons.reduce((s, c) => s + (c.maxUses || 0), 0)
    
    return {
      total: coupons.length,
      active: active.length,
      totalUses,
      redemptionRate: totalMax > 0 ? Math.round((totalUses / totalMax) * 100) : 0,
      topCode: [...coupons].sort((a, b) => (b.uses || 0) - (a.uses || 0))[0]?.code || '—',
    }
  }, [coupons])

  const [filterStatus, setFilterStatus] = useState('all') // all, active, expired, exhausted

  const filtered = useMemo(() => {
    return coupons.filter(c => {
      const isExpired = new Date(c.expiry) < new Date()
      const isExhausted = (c.uses || 0) >= (c.maxUses || 1)
      if (filterStatus === 'active') return c.active && !isExpired && !isExhausted
      if (filterStatus === 'expired') return isExpired
      if (filterStatus === 'exhausted') return isExhausted
      return true
    })
  }, [coupons, filterStatus])

  const generateBatch = () => {
    const count = 10
    const prefix = 'SCST-'
    const newCoupons = []
    for (let i = 0; i < count; i++) {
        const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
        newCoupons.push({
            id: Date.now() + i,
            code: prefix + rand,
            description: 'Batch generated promotional offer',
            type: 'percent',
            value: 10,
            minOrder: 20,
            maxUses: 50,
            active: true,
            expiry: '2026-12-31',
            uses: 0
        })
    }
    setCoupons(cs => [...cs, ...newCoupons])
    notify(`Generated ${count} unique codes!`, 'success')
    addAudit?.(currentUser, 'Batch Coupon Generation', 'Coupons', `${count} codes generated`)
  }

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const handleAdd = () => {
    if (!form.code) return
    setCoupons(cs => [...cs, { id: Date.now(), ...form, uses: 0 }])
    addAudit?.(currentUser, 'Coupon Created', 'Coupons', `${form.code} created`)
    notify(`Coupon ${form.code} created!`, 'success')
    setShowAdd(false)
    setForm({ code: '', description: '', type: 'percent', value: 10, minOrder: 0, maxUses: 100, active: true, expiry: '2026-12-31' })
  }

  const handleDelete = (id, code) => {
    setCoupons(cs => cs.filter(x => x.id !== id))
    addAudit?.(currentUser, 'Coupon Deleted', 'Coupons', `${code} removed`)
    notify('Coupon deleted', 'warning')
  }

  const handleToggle = (id, code, currentState) => {
    setCoupons(cs => cs.map(x => x.id === id ? { ...x, active: !x.active } : x))
    notify(`Coupon ${code} ${!currentState ? 'enabled' : 'disabled'}`, 'info')
  }

  const getTypeLabel = (c) => {
    if (c.type === 'percent') return `${c.value}% off`
    if (c.type === 'fixed') return `${fmt(c.value, settings?.sym)} off`
    return 'Free Delivery'
  }

  const getUsagePercent = (c) => Math.min((c.uses / (c.maxUses || 1)) * 100, 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease-out' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: t.text, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Ticket size={26} color={t.accent} /> Coupon Codes
          </h1>
          <p style={{ fontSize: 13, color: t.text3, marginTop: 4 }}>Create and manage discount codes for POS checkout and online shop.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn t={t} variant="outline" style={{ borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }} onClick={generateBatch}>
            <Scissors size={15} /> Batch Generator
          </Btn>
          <Btn t={t} onClick={() => setShowAdd(true)} style={{ background: t.accent, color: '#fff', borderRadius: 12, padding: '10px 20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> New Coupon
          </Btn>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Coupons', value: stats.total, color: t.accent, icon: <Ticket size={18} /> },
          { label: 'Active Codes', value: stats.active, color: t.green, icon: <Check size={18} /> },
          { label: 'Redemption Rate', value: `${stats.redemptionRate}%`, color: t.blue, icon: <BarChart size={18} /> },
          { label: 'Top Performer', value: stats.topCode, color: t.yellow, icon: <TrendingUp size={18} />, small: true },
        ].map(({ label, value, color, icon, small }) => (
          <Card key={label} t={t} style={{ padding: '14px 18px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.text4, textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: small ? 14 : 22, fontWeight: 900, color, fontFamily: small ? 'monospace' : 'inherit', letterSpacing: small ? 1 : 0 }}>{value}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
              { id: 'all', label: 'All Coupons' },
              { id: 'active', label: 'Active Only' },
              { id: 'expired', label: 'Expired' },
              { id: 'exhausted', label: 'Exhausted' }
          ].map(tab => (
              <button key={tab.id} onClick={() => setFilterStatus(tab.id)} style={{
                  padding: '8px 16px', borderRadius: 20, border: 'none',
                  background: filterStatus === tab.id ? t.accent : t.bg3,
                  color: filterStatus === tab.id ? '#fff' : t.text3,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
              }}>
                  {tab.label}
              </button>
          ))}
      </div>

      {/* Demo Hint */}
      <div style={{ background: `${t.yellow}10`, border: `1px solid ${t.yellow}30`, borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Zap size={16} color={t.yellow} />
        <span style={{ fontSize: 13, color: t.text2, fontWeight: 600 }}>
          Test codes at POS checkout:&nbsp;
          {['FANDAY10', 'WELCOME20', 'FREESHIP'].map(code => (
            <code key={code} style={{ background: `${t.yellow}20`, padding: '2px 8px', borderRadius: 6, fontWeight: 900, fontSize: 12, marginRight: 6, letterSpacing: 1 }}>{code}</code>
          ))}
        </span>
      </div>

      {filtered.length === 0 ? (
        <Card t={t} style={{ padding: 60, textAlign: 'center', borderRadius: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎟️</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{filterStatus === 'all' ? 'No Coupons Yet' : 'No Results Found'}</div>
          <div style={{ fontSize: 13, color: t.text3, marginTop: 4 }}>
            {filterStatus === 'all' 
              ? 'Create your first coupon to drive sales and reward customers.' 
              : 'Try adjusting your filters to see more coupons.'}
          </div>
          {filterStatus === 'all' && (
            <Btn t={t} onClick={() => setShowAdd(true)} style={{ margin: '20px auto 0', background: t.accent, color: '#fff', borderRadius: 12, padding: '10px 24px', fontWeight: 700 }}>+ Create First Coupon</Btn>
          )}
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 90vw), 1fr))', gap: 16 }}>
          {filtered.map(c => {
            const usagePct = getUsagePercent(c)
            const isNearlyFull = usagePct > 80
            return (
              <Card key={c.id} t={t} style={{
                borderRadius: 18, padding: 0, overflow: 'hidden',
                borderLeft: `4px solid ${c.active ? t.accent : t.border}`,
                opacity: c.active ? 1 : 0.7
              }}>
                {/* Coupon Header */}
                <div style={{ padding: '16px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: t.text, fontFamily: 'monospace', letterSpacing: 2 }}>{c.code}</span>
                      <button onClick={() => handleCopy(c.code, c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === c.id ? t.green : t.text4, padding: 2, display: 'flex' }}>
                        {copiedId === c.id ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                    <div style={{ fontSize: 12, color: t.text3, marginTop: 2 }}>{c.description}</div>
                  </div>
                  <Badge t={t} text={c.active ? 'Active' : 'Off'} color={c.active ? 'green' : 'red'} />
                </div>

                {/* Coupon Body */}
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
                    <div style={{ fontWeight: 900, color: t.accent, fontSize: 16 }}>{getTypeLabel(c)}</div>
                    <div style={{ fontSize: 12, color: t.text3 }}>Min: {fmt(c.minOrder, settings?.sym)}</div>
                  </div>

                  {/* Usage Bar */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: t.text4, marginBottom: 4 }}>
                      <span>Usage</span>
                      <span style={{ color: isNearlyFull ? t.red : t.text3 }}>{c.uses || 0} / {c.maxUses} uses</span>
                    </div>
                    <div style={{ height: 6, background: t.bg4, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${usagePct}%`, background: isNearlyFull ? t.red : t.accent, borderRadius: 3, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: t.text4, marginBottom: 12 }}>
                    Expires: <strong style={{ color: t.text2 }}>{c.expiry}</strong>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn t={t} variant={c.active ? 'outline' : 'ghost'} size="sm" style={{ flex: 1, fontSize: 12, fontWeight: 700, color: c.active ? t.red : t.green }}
                      onClick={() => handleToggle(c.id, c.code, c.active)}>
                      {c.active ? <><X size={12} /> Disable</> : <><Check size={12} /> Enable</>}
                    </Btn>
                    <Btn t={t} variant="ghost" size="sm" style={{ color: t.red, padding: '4px 10px' }}
                      onClick={() => handleDelete(c.id, c.code)}>
                      <Trash2 size={14} />
                    </Btn>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAdd && (
        <Modal t={t} title="Create New Coupon" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input t={t} label="Coupon Code *" value={form.code}
                onChange={v => setForm(f => ({ ...f, code: v.toUpperCase().replace(/\s/g, '') }))}
                placeholder="SAVE20" required />
              <Select t={t} label="Discount Type" value={form.type}
                onChange={v => setForm(f => ({ ...f, type: v }))}
                options={[{ value: 'percent', label: '% Percentage Off' }, { value: 'fixed', label: '£ Fixed Amount Off' }, { value: 'delivery', label: '🚚 Free Delivery' }]} />
              <Input t={t} label={form.type === 'percent' ? 'Discount %' : form.type === 'fixed' ? `Amount (${settings?.sym || '£'})` : 'N/A (Free Delivery)'}
                value={form.value} onChange={v => setForm(f => ({ ...f, value: +v }))} type="number" disabled={form.type === 'delivery'} />
              <Input t={t} label={`Min Order (${settings?.sym || '£'})`} value={form.minOrder}
                onChange={v => setForm(f => ({ ...f, minOrder: +v }))} type="number" />
              <Input t={t} label="Max Uses" value={form.maxUses}
                onChange={v => setForm(f => ({ ...f, maxUses: +v }))} type="number" />
              <Input t={t} label="Expiry Date" value={form.expiry}
                onChange={v => setForm(f => ({ ...f, expiry: v }))} type="date" />
            </div>
            <Input t={t} label="Description" value={form.description}
              onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="e.g. Welcome offer for new members" />

            {/* Live Preview */}
            {form.code && (
              <div style={{ padding: '14px 18px', borderRadius: 14, border: `2px dashed ${t.accent}`, background: `${t.accent}05` }}>
                <div style={{ fontSize: 11, color: t.text4, fontWeight: 700, marginBottom: 6 }}>COUPON PREVIEW</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: t.accent, fontFamily: 'monospace', letterSpacing: 3 }}>{form.code}</div>
                <div style={{ fontSize: 14, color: t.text2, marginTop: 4 }}>
                  {form.type === 'percent' ? `${form.value}% off orders over ${fmt(form.minOrder, settings?.sym)}` :
                   form.type === 'fixed' ? `${fmt(form.value, settings?.sym)} off orders over ${fmt(form.minOrder, settings?.sym)}` :
                   'Free delivery on qualifying orders'}
                </div>
              </div>
            )}

            <Btn t={t} onClick={handleAdd} disabled={!form.code}
              style={{ background: t.accent, color: '#fff', borderRadius: 12, padding: 14, fontWeight: 800 }}>
              <Ticket size={16} /> Create Coupon Code
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
