import { useState, useEffect } from 'react'
import { Btn, Input, Badge, Card, Modal, Select, Toggle } from '@/components/ui'
import { notify } from '@/components/shared'
import { isBannerActive } from '@/lib/utils'
import { fetchCategories } from '@/services/categories'
import { Image, Plus, Trash2, Eye, EyeOff, Calendar, Tag, Zap, Copy, Smartphone, Monitor } from 'lucide-react'

export const BannerManagement = ({ banners = [], setBanners, addAudit, currentUser, t }) => {
  const [showAdd, setShowAdd] = useState(false)
  const empty = {
    title: '', subtitle: '', cta: 'Shop Now', color: '#dc2626',
    grad: 'linear-gradient(135deg,#dc2626,#7f1d1d)', emoji: '⚽', active: true,
    offerType: 'none', offerTarget: '', offerDiscount: 0,
    startDate: new Date().toISOString().slice(0, 16), endDate: '2026-12-31T23:59', image: '',
  }
  const [form, setForm] = useState(empty)
  const [categories, setCategories] = useState([])

  // Load dynamic categories for promotion targeting
  useEffect(() => {
    fetchCategories().then(cats => {
      if (cats && cats.length > 0) setCategories(cats.map(c => c.name))
    }).catch(err => console.error("Error loading categories", err))
  }, [])

  const activeCount = banners.filter(b => isBannerActive(b)).length
  const scheduledCount = banners.filter(b => b.active && !isBannerActive(b)).length

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setForm(f => ({ ...f, image: ev.target.result }))
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = (id, title) => {
    setBanners(bs => bs.filter(x => x.id !== id))
    addAudit?.(currentUser, 'Banner Deleted', 'Banners', `${title} removed`)
    notify('Banner deleted', 'warning')
  }

  const handleToggle = (id, val, title) => {
    setBanners(bs => bs.map(x => x.id === id ? { ...x, active: val } : x))
    notify(`Banner ${val ? 'activated' : 'hidden'}`, 'info')
  }

  const handleAdd = () => {
    if (!form.title) return
    setBanners(bs => [...bs, { id: Date.now(), ...form }])
    addAudit?.(currentUser, 'Banner Created', 'Banners', `${form.title} banner added`)
    notify('Banner added!', 'success')
    setShowAdd(false)
    setForm(empty)
  }

  const handleDuplicate = (b) => {
    const nextWay = { ...b, id: Date.now(), title: b.title + ' (Copy)', active: false }
    setBanners(bs => [...bs, nextWay])
    notify('Banner duplicated!', 'success')
  }

  const getProgress = (b) => {
    const now = new Date().getTime()
    const start = new Date(b.startDate).getTime()
    const end = new Date(b.endDate).getTime()
    if (now < start) return 0
    if (now > end) return 100
    return ((now - start) / (end - start)) * 100
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease-out' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: t.text, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image size={26} color={t.accent} /> Banner Management
          </h1>
          <p style={{ fontSize: 13, color: t.text3, marginTop: 4 }}>Active banners display on login &amp; guest pages to drive engagement.</p>
        </div>
        <Btn t={t} onClick={() => setShowAdd(true)} style={{ background: t.accent, color: '#fff', borderRadius: 12, padding: '10px 20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Banner
        </Btn>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Banners', value: banners.length, color: t.accent, icon: '🖼️' },
          { label: 'Live Now', value: activeCount, color: t.green, icon: '🟢' },
          { label: 'Scheduled', value: scheduledCount, color: t.yellow, icon: '📅' },
          { label: 'Hidden', value: banners.length - activeCount - scheduledCount, color: t.red, icon: '🔴' },
        ].map(({ label, value, color, icon }) => (
          <Card key={label} t={t} style={{ padding: '14px 18px', borderRadius: 14 }}>
            <div style={{ fontSize: 20 }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color, marginTop: 6 }}>{value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.text4, textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
          </Card>
        ))}
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <Card t={t} style={{ padding: 60, textAlign: 'center', borderRadius: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🖼️</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>No Banners Yet</div>
          <div style={{ fontSize: 13, color: t.text3, marginTop: 4 }}>Create your first banner to promote products and campaigns.</div>
          <Btn t={t} onClick={() => setShowAdd(true)} style={{ margin: '20px auto 0', background: t.accent, color: '#fff', borderRadius: 12, padding: '10px 24px', fontWeight: 700 }}>+ Add First Banner</Btn>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {banners.map(b => {
            const active = isBannerActive(b)
            const status = active ? 'Live Now' : b.active ? 'Scheduled' : 'Hidden'
            const statusColor = active ? 'green' : b.active ? 'yellow' : 'red'
            return (
              <Card key={b.id} t={t} style={{ borderRadius: 18, overflow: 'hidden', padding: 0, boxShadow: active ? `0 0 0 2px ${t.green}` : 'none' }}>
                {/* Banner Preview */}
                <div style={{ position: 'relative', height: 130, overflow: 'hidden' }}>
                  {b.image ? (
                    <img src={b.image} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ background: b.grad || b.color, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 36 }}>{b.emoji}</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.1))', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px 16px' }}>
                    <div style={{ color: '#fff', fontSize: 15, fontWeight: 900 }}>{b.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{b.subtitle}</div>
                  </div>
                  <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <Badge t={t} text={status} color={statusColor} />
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '14px 16px' }}>
                  {b.offerType !== 'none' && (
                    <div style={{ background: `${t.green}10`, border: `1px solid ${t.green}30`, borderRadius: 8, padding: '6px 10px', marginBottom: 10, fontSize: 12, color: t.green, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Tag size={12} /> {b.offerDiscount}% off {b.offerTarget}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, fontSize: 11, color: t.text4, marginBottom: 8 }}>
                    <span><Calendar size={11} style={{ marginRight: 3 }} />{b.startDate?.slice(0, 10)}</span>
                    <span>→</span>
                    <span>{b.endDate?.slice(0, 10)}</span>
                  </div>

                  {/* Progress Bar */}
                  {active && (
                    <div style={{ height: 4, background: t.bg4, borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
                      <div style={{ height: '100%', width: `${getProgress(b)}%`, background: t.green, borderRadius: 2 }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Toggle t={t} value={b.active} onChange={v => handleToggle(b.id, v, b.title)} />
                      <Btn t={t} variant="ghost" style={{ padding: 6, color: t.text3 }} onClick={() => handleDuplicate(b)}>
                        <Copy size={14} />
                      </Btn>
                    </div>
                    <Btn t={t} variant="ghost" style={{ color: t.red, padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(b.id, b.title)}>
                      <Trash2 size={14} /> Delete
                    </Btn>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal with Side-by-Side Preview */}
      {showAdd && (
        <Modal t={t} title="Design Promotional Banner" onClose={() => { setShowAdd(false); setForm(empty) }} width={980}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 450px) 1fr', gap: 32 }}>

            {/* Left Column: Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input t={t} label="Banner Title *" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Match Day Special!" required />
                <Input t={t} label="Subtitle / Tagline" value={form.subtitle} onChange={v => setForm(f => ({ ...f, subtitle: v }))} placeholder="e.g. 20% off Jerseys today" />
                <Input t={t} label="Call-to-Action Text" value={form.cta} onChange={v => setForm(f => ({ ...f, cta: v }))} placeholder="Shop Now" />
                <Input t={t} label="Emoji Icon" value={form.emoji} onChange={v => setForm(f => ({ ...f, emoji: v }))} placeholder="⚽" />
                <Input t={t} label="Image URL" value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} placeholder="https://..." />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, color: t.text3, fontWeight: 800, textTransform: 'uppercase' }}>Image File</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload}
                    style={{ border: `1px solid ${t.border}`, borderRadius: 9, padding: '8px 12px', color: t.text, fontSize: 12, background: t.bg }} />
                </div>

                <Input t={t} label="Launch Date" value={form.startDate} onChange={v => setForm(f => ({ ...f, startDate: v }))} type="datetime-local" />
                <Input t={t} label="End Date" value={form.endDate} onChange={v => setForm(f => ({ ...f, endDate: v }))} type="datetime-local" />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <Select t={t} label="Promotion Type" value={form.offerType} onChange={v => setForm(f => ({ ...f, offerType: v }))}
                    options={[{ value: 'none', label: 'General Announcement' }, { value: 'category', label: 'Category Promotion' }]} />
                </div>
                <div style={{ width: 120 }}>
                  <label style={{ display: 'block', fontSize: 11, color: t.text3, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>Base Color</label>
                  <input type="color" value={form.color} onChange={e => {
                    const c = e.target.value;
                    setForm(f => ({ ...f, color: c, grad: `linear-gradient(135deg,${c},#000000)` }))
                  }} style={{ width: '100%', height: 38, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                </div>
              </div>

              {form.offerType === 'category' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Select t={t} label="Category" value={form.offerTarget} onChange={v => setForm(f => ({ ...f, offerTarget: v }))}
                    options={(categories.length > 0 ? categories : []).map(c => ({ value: c, label: c }))} />
                  <Input t={t} label="Offer Value %" value={form.offerDiscount} onChange={v => setForm(f => ({ ...f, offerDiscount: +v }))} type="number" />
                </div>
              )}

              <Btn t={t} onClick={handleAdd} disabled={!form.title}
                style={{ background: t.accent, color: '#fff', borderRadius: 12, padding: 16, fontWeight: 900, marginTop: 8, boxShadow: `0 8px 16px ${t.accent}30` }}>
                <Plus size={18} style={{ marginRight: 8 }} /> Create Advertisement
              </Btn>
            </div>

            {/* Right Column: Live Mobile Device Preview */}
            <div style={{ background: t.bg3, borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: t.text4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Smartphone size={16} /> MOBILE APP PREVIEW
              </div>

              {/* Phone Frame */}
              <div style={{
                width: 250, height: 500, background: '#000', borderRadius: 36, border: '8px solid #333',
                position: 'relative', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
                display: 'flex', flexDirection: 'column'
              }}>
                {/* Notch */}
                <div style={{ width: 100, height: 20, background: '#333', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }} />

                {/* App Content Simulation */}
                <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: 60, background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: t.accent }} />
                    <div style={{ height: 8, width: 60, background: '#cbd5e1', borderRadius: 4 }} />
                  </div>

                  {/* The Live Banner Preview */}
                  <div style={{ height: 180, position: 'relative', overflow: 'hidden', background: form.grad || form.color }}>
                    {form.image && <img src={form.image} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)' }} />
                    <div style={{ position: 'relative', height: '100%', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff' }}>
                      {form.offerType === 'category' && (
                        <div style={{ fontSize: 8, fontWeight: 900, background: t.accent, padding: '2px 6px', borderRadius: 10, alignSelf: 'flex-start', marginBottom: 4 }}>
                          🔥 {form.offerDiscount}% OFF {form.offerTarget?.toUpperCase() || 'ALL'}
                        </div>
                      )}
                      <div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.1, marginBottom: 4 }}>{form.title || 'Your Title Here'}</div>
                      <div style={{ fontSize: 10, opacity: 0.8, marginBottom: 12 }}>{form.subtitle || 'Tagline here...'}</div>
                      <div style={{ fontSize: 10, fontWeight: 900, background: '#fff', color: form.color, padding: '6px 12px', borderRadius: 6, alignSelf: 'flex-start' }}>
                        {form.cta || 'Shop Now'} →
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ height: 12, width: '40%', background: '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div style={{ height: 100, background: '#f1f5f9', borderRadius: 12 }} />
                      <div style={{ height: 100, background: '#f1f5f9', borderRadius: 12 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
