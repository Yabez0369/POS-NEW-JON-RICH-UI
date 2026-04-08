import { useState } from 'react'
import { Btn, Input, Badge, Card, Modal, Select, Toggle } from '@/components/ui'
import { notify } from '@/components/shared'
import { isBannerActive } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import { Monitor, Plus, Calendar, Tag, Trash2, Copy } from 'lucide-react'

export const BannerManagement = ({ banners = [], setBanners, addAudit, currentUser, t }) => {
  const [showAdd, setShowAdd] = useState(false)
  const empty = {
    title: '', subtitle: '', cta: 'Shop Now', color: '#dc2626',
    grad: 'linear-gradient(135deg,#dc2626,#7f1d1d)', emoji: '⚽', active: true,
    offerType: 'none', offerTarget: '', offerDiscount: 0,
    startDate: new Date().toISOString().slice(0, 16), endDate: '2026-12-31T23:59', image: '',
    themeStyle: 'minimal', transitionType: 'fade', duration: 6000
  }
  const [form, setForm] = useState(empty)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setForm(f => ({ ...f, image: ev.target.result }))
      reader.readAsDataURL(file)
    }
  }

  const handleAdd = () => {
    setBanners(prev => [...prev, { ...form, id: Date.now().toString() }])
    setShowAdd(false)
    setForm(empty)
    addAudit(currentUser, 'Banner Added', 'Marketing', 'New banner created')
    notify('Banner created and active', 'success')
  }

  const handleToggle = (id, active, title) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, active } : b))
    notify(active ? 'Banner activated' : 'Banner paused', 'success')
  }

  const handleDelete = (id, title) => {
    if (window.confirm('Delete banner?')) {
      setBanners(prev => prev.filter(b => b.id !== id))
      notify('Banner deleted', 'success')
    }
  }

  const handleDuplicate = (b) => {
    setBanners(prev => [...prev, { ...b, id: Date.now().toString(), title: b.title + ' (Copy)' }])
    notify('Banner duplicated', 'success')
  }

  const getProgress = (b) => {
    const start = new Date(b.startDate).getTime()
    const end = new Date(b.endDate).getTime()
    const now = Date.now()
    if (now < start) return 0
    if (now > end) return 100
    return ((now - start) / (end - start)) * 100
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

      {showAdd ? (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: t.bg,
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          {/* Studio Header */}
          <div style={{ height: 70, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: t.bg2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, background: `${t.accent}20`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Monitor size={20} color={t.accent} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: t.text }}>Creative Studio</h2>
                <div style={{ fontSize: 12, color: t.text4 }}>Design for Customer Display</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Btn t={t} variant="outline" onClick={() => { setShowAdd(false); setForm(empty); }}>Cancel</Btn>
              <Btn t={t} onClick={handleAdd} disabled={!form.title} style={{ background: t.accent, color: '#fff', padding: '10px 24px' }}>
                <Plus size={16} style={{ marginRight: 8 }} /> Publish to Display
              </Btn>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Left: Designer Tools */}
            <div style={{ width: 450, borderRight: `1px solid ${t.border}`, background: t.bg, overflowY: 'auto', padding: 32, paddingBottom: 100 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: t.text4, marginBottom: 20 }}>Content Settings</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                <Input t={t} label="Headline *" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. New Arrivals" required />
                <Input t={t} label="Sub-headline" value={form.subtitle} onChange={v => setForm(f => ({ ...f, subtitle: v }))} placeholder="Wait till you see these..." />
                <Input t={t} label="Button Text" value={form.cta} onChange={v => setForm(f => ({ ...f, cta: v }))} placeholder="Shop Now" />
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: t.text4, marginBottom: 20 }}>Visual Style</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                <Select t={t} label="Design Theme" value={form.themeStyle} onChange={v => setForm(f => ({ ...f, themeStyle: v }))}
                  options={[
                    { value: 'minimal', label: 'Minimalist (Clean & Flat)' },
                    { value: 'glass', label: 'Glassmorphism (Frosted)' },
                    { value: 'cyberpunk', label: 'Cyberpunk (Neon & High Contrast)' }
                  ]} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, color: t.text3, fontWeight: 800, textTransform: 'uppercase' }}>Background Image</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload}
                    style={{ border: `1px solid ${t.border}`, borderRadius: 9, padding: '8px 12px', color: t.text, fontSize: 12, background: t.bg2 }} />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 11, color: t.text3, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>Brand Color</label>
                    <input type="color" value={form.color} onChange={e => {
                      const c = e.target.value;
                      setForm(f => ({ ...f, color: c, grad: `linear-gradient(135deg,${c},#000000)` }))
                    }} style={{ width: '100%', height: 42, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: t.text4, marginBottom: 20 }}>Display Logic</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Select t={t} label="Transition Effect" value={form.transitionType} onChange={v => setForm(f => ({ ...f, transitionType: v }))}
                      options={[{ value: 'fade', label: 'Fade' }, { value: 'slide', label: 'Slide Right' }, { value: 'zoom', label: 'Zoom In' }]} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input t={t} label="Duration (ms)" value={form.duration} onChange={v => setForm(f => ({ ...f, duration: +v }))} type="number" />
                  </div>
                </div>

                <Select t={t} label="Promotion Integration" value={form.offerType} onChange={v => setForm(f => ({ ...f, offerType: v }))}
                  options={[{ value: 'none', label: 'None (Standard Ad)' }, { value: 'category', label: 'Category Discount' }]} />

                {form.offerType === 'category' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Select t={t} label="Category" value={form.offerTarget} onChange={v => setForm(f => ({ ...f, offerTarget: v }))}
                      options={(CATEGORIES || []).map(c => ({ value: c, label: c }))} />
                    <Input t={t} label="Discount %" value={form.offerDiscount} onChange={v => setForm(f => ({ ...f, offerDiscount: +v }))} type="number" />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Live Customer Display Preview */}
            <div style={{ flex: 1, background: '#111', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: form.grad || form.color,
                borderRadius: 24,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
              }}>
                {form.image && (
                  <img src={form.image} style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                    opacity: form.themeStyle === 'cyberpunk' ? 0.9 : 1,
                    filter: form.themeStyle === 'cyberpunk' ? 'saturate(1.5) contrast(1.2)' : 'none'
                  }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />

                <div style={{ position: 'relative', height: '100%', padding: '0 8%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ maxWidth: 800 }}>
                    {form.offerDiscount > 0 && (
                      <div style={{ display: 'inline-flex', padding: '6px 20px', background: t.accent, color: '#fff', borderRadius: 30, fontSize: 16, fontWeight: 900, marginBottom: 20 }}>
                        🔥 {form.offerDiscount}% OFF {form.offerTarget?.toUpperCase()}
                      </div>
                    )}
                    <h1 style={{
                      fontSize: 72, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 16, letterSpacing: -2,
                      textShadow: form.themeStyle === 'cyberpunk' ? `0 0 20px ${t.accent}, 0 0 40px ${t.accent}` : '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                      {form.title || 'Your Title Here'}
                    </h1>
                    <p style={{ fontSize: 24, color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginBottom: 32, textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                      {form.subtitle || 'Add a compelling subtitle to capture attention.'}
                    </p>
                    <div style={{
                      display: 'inline-flex',
                      background: form.themeStyle === 'glass' ? 'rgba(255,255,255,0.2)' : '#fff',
                      color: form.themeStyle === 'glass' ? '#fff' : (form.color || t.accent),
                      padding: '16px 36px',
                      borderRadius: 16,
                      fontSize: 20,
                      fontWeight: 900,
                      backdropFilter: form.themeStyle === 'glass' ? 'blur(20px)' : 'none',
                      border: form.themeStyle === 'glass' ? '2px solid rgba(255,255,255,0.5)' : 'none',
                    }}>
                      {form.cta || 'Shop Now'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution Label */}
              <div style={{ position: 'absolute', bottom: 20, right: 30, color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 800, letterSpacing: 2 }}>
                LIVE PREVIEW: 1920x1080 DISPLAY
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
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
                <Monitor size={24} color="#4f46e5" strokeWidth={2.5} /> Promo Displays
              </h1>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Btn onClick={() => setShowAdd(true)} style={{ 
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
                <Plus size={18} /> New Display 
              </Btn>
            </div>
          </div>

          {banners.length === 0 ? (
             <div style={{ background: '#fff', padding: 80, textAlign: 'center', borderRadius: 32, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', marginTop: 10 }}>
               <Monitor size={64} color="#94a3b8" style={{ marginBottom: 20, opacity: 0.3 }} />
               <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>No Displays Configured</div>
               <div style={{ fontSize: 15, color: '#64748b', marginTop: 8, fontWeight: 600 }}>
                 Set up your first banner to advertise products to customers at checkout. 
               </div>
               <Btn onClick={() => setShowAdd(true)} style={{ 
                  marginTop: 32, background: '#4f46e5', color: '#fff', borderRadius: 16, padding: '16px 32px', fontWeight: 900, fontSize: 15, border: 'none', boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)'
               }}>+ Create First Display</Btn>
             </div>
          ) : (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 24, marginTop: 10 }}>
               {banners.map(b => (
                 <div key={b.id} style={{
                   background: '#fff',
                   borderRadius: 28, 
                   overflow: 'hidden',
                   boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
                   border: '1px solid #f1f5f9',
                   display: 'flex',
                   flexDirection: 'column',
                   opacity: b.active ? 1 : 0.6,
                   transition: 'all 0.3s ease',
                   position: 'relative'
                 }}>
                   <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                     {b.image ? (
                       <img src={b.image} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                       <div style={{ background: b.grad, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 40 }}>{b.emoji}</span>
                       </div>
                     )}
                     <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                     <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                       <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>{b.title}</div>
                       <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{b.subtitle}</div>
                     </div>
                     <Badge text={b.active ? 'ACTIVE' : 'PAUSED'} style={{ position: 'absolute', top: 16, right: 16, background: b.active ? '#22c55e' : '#64748b', color: '#fff', fontWeight: 900, padding: '4px 10px', borderRadius: 8, fontSize: 10, border: 'none' }} />
                   </div>
                   
                   <div style={{ padding: 24 }}>
                     {b.offerType !== 'none' && (
                       <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#166534', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                         <Tag size={16} /> {b.offerDiscount}% OFF {b.offerTarget?.toUpperCase()}
                       </div>
                     )}
                     
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 16, background: '#f8fafc', padding: '10px', borderRadius: 12 }}>
                       <Calendar size={14} color="#0f172a" /> {(b.startDate || '').slice(0, 10)} <span style={{color:'#cbd5e1'}}>—</span> {(b.endDate || '').slice(0, 10)}
                     </div>

                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                       <div style={{ flex: 1, display: 'flex', gap: 12 }}>
                         <Btn variant="ghost" style={{ 
                           fontSize: 13, fontWeight: 800, padding: '10px 16px', borderRadius: 14,
                           color: b.active ? '#ef4444' : '#22c55e', background: b.active ? '#fef2f2' : '#f0fdf4'
                         }} onClick={() => handleToggle(b.id, !b.active, b.title)}>
                           {b.active ? 'Pause' : 'Activate'}
                         </Btn>
                         <Btn variant="ghost" style={{ padding: 10, color: '#64748b', background: '#f1f5f9', borderRadius: 14 }} onClick={() => handleDuplicate(b)}>
                           <Copy size={16} />
                         </Btn>
                       </div>
                       <Btn variant="ghost" style={{ padding: 10, color: '#ef4444', background: '#fff', borderRadius: 14 }} onClick={() => handleDelete(b.id, b.title)}>
                         <Trash2 size={16} />
                       </Btn>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </>
      )}
    </div>
  )
}
