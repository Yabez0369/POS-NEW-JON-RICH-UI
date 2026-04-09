import { useState } from 'react'
import { Btn, Input, Badge, Card, Modal, Select, Toggle } from '@/components/ui'
import { notify } from '@/components/shared'
import { isBannerActive } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import { 
  Monitor, Plus, Calendar, Tag, Trash2, Copy, Sparkles, 
  Layout, Eye, Play, Pause, AlertCircle, ChevronRight, Zap 
} from 'lucide-react'

export const BannerManagement = ({ banners = [], setBanners, addAudit, currentUser, t }) => {
  const [showAdd, setShowAdd] = useState(false)
  const empty = {
    title: '', subtitle: '', cta: 'Shop Now', color: '#6366F1',
    grad: 'linear-gradient(135deg,#6366F1,#1E1B4B)', emoji: '✨', active: true,
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

  const handleToggle = (id, active) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, active } : b))
    notify(active ? 'Banner activated' : 'Banner paused', 'success')
  }

  const handleDelete = (id) => {
    if (window.confirm('Purge this asset from display?')) {
      setBanners(prev => prev.filter(b => b.id !== id))
      notify('Banner deleted', 'success')
    }
  }

  const handleDuplicate = (b) => {
    setBanners(prev => [...prev, { ...b, id: Date.now().toString(), title: b.title + ' (Copy)' }])
    notify('Banner duplicated', 'success')
  }

  return (
    <div className="merchandising-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .merchandising-root {
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

        .page-header {
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

        .studio-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
          box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.3);
        }
        .studio-btn:hover { transform: translateY(-2px); opacity: 0.95; }

        /* Banner Cards Grid */
        .banner-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 32px;
        }
        .banner-card {
          background: white;
          border-radius: 32px;
          overflow: hidden;
          border: 1px solid var(--glass-border);
          box-shadow: 0 12px 40px -15px rgba(0, 0, 0, 0.05);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .banner-card:hover { border-color: var(--primary); transform: translateY(-8px); box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.1); }
        
        .card-preview {
          height: 180px;
          position: relative;
          background: #EEF2FF;
          overflow: hidden;
        }
        .card-preview.gradient { background-size: cover; background-position: center; }
        .preview-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          display: flex; flex-direction: column; justify-content: flex-end; padding: 24px;
        }
        .preview-title { color: white; font-weight: 900; font-size: 20px; letter-spacing: -0.02em; }
        .preview-subtitle { color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 600; }

        .card-body { padding: 24px; }
        .logic-row { display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 800; color: var(--text-muted); margin-bottom: 20px; }
        .offer-pill { background: #EEF2FF; color: var(--primary); padding: 4px 10px; border-radius: 8px; font-size: 11px; display: inline-flex; align-items: center; gap: 6px; }

        .card-actions { display: flex; gap: 10px; }
        .card-action-btn {
          flex: 1; border: none; padding: 10px; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; background: #F8FAFC; color: var(--text-muted);
        }
        .card-action-btn.active-now { background: #ECFDF5; color: #059669; }
        .card-action-btn.paused-now { background: #F8FAFC; color: var(--text-muted); }
        .card-action-btn:hover { background: #EEF2FF; color: var(--primary); }
        .card-action-btn.delete:hover { background: #FEE2E2; color: #EF4444; }

        /* Studio Overlay */
        .studio-overlay {
          position: fixed; inset: 0; z-index: 9999; background: white;
          display: flex; flex-direction: column; animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .studio-header {
          height: 80px; padding: 0 40px; border-bottom: 1px solid var(--glass-border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .studio-main { flex: 1; display: flex; overflow: hidden; }
        .studio-sidebar { width: 420px; border-right: 1px solid var(--glass-border); padding: 40px; overflow-y: auto; background: #F9FAFB; }
        .studio-preview-pane { flex: 1; background: #0F172A; display: flex; align-items: center; justify-content: center; padding: 60px; position: relative; }

        .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1.5px; margin: 32px 0 16px 0; }
        .section-title:first-child { margin-top: 0; }

        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>

      {showAdd ? (
        <div className="studio-overlay">
          <div className="studio-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, background: 'var(--primary)', borderRadius: 14, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'white' }}>
                <Zap size={22} fill="white" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em' }}>Creative Studio</h2>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Crafting premium display experience</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <Btn variant="outline" style={{ borderRadius: 16, height: 48, padding: '0 24px', fontWeight: 700 }} onClick={() => { setShowAdd(false); setForm(empty); }}>Discard</Btn>
              <button className="studio-btn" style={{ borderRadius: 16, height: 48 }} onClick={handleAdd} disabled={!form.title}>
                 Commit to Display <Sparkles size={16} />
              </button>
            </div>
          </div>

          <div className="studio-main">
            <div className="studio-sidebar">
              <div className="section-title">Headline & Copy</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Input t={t} label="Headline" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Wait till you see these..." />
                <Input t={t} label="Description" value={form.subtitle} onChange={v => setForm(f => ({ ...f, subtitle: v }))} placeholder="Briefly describe the offer" />
                <Input t={t} label="Action Text" value={form.cta} onChange={v => setForm(f => ({ ...f, cta: v }))} placeholder="SHOP NOW" />
              </div>

              <div className="section-title">Visual Architecture</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Select t={t} label="Design Language" value={form.themeStyle} onChange={v => setForm(f => ({ ...f, themeStyle: v }))}
                  options={[
                    { value: 'minimal', label: 'Structured (Flat)' },
                    { value: 'glass', label: 'Frosted (Glassmorphic)' },
                    { value: 'cyberpunk', label: 'Dynamic (High Energy)' }
                  ]} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-deep)' }}>Hero Image</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload}
                    style={{ background: 'white', border: '1px solid #E2E8F0', padding: 10, borderRadius: 12, fontSize: 12 }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-deep)', marginBottom: 8 }}>Accent Profile</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input type="color" value={form.color} onChange={e => {
                      const c = e.target.value;
                      setForm(f => ({ ...f, color: c, grad: `linear-gradient(135deg,${c},#0F172A)` }))
                    }} style={{ width: 60, height: 44, border: 'none', borderRadius: 10, cursor: 'pointer' }} />
                    <div style={{ flex: 1, background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, padding: 12, fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>
                      HEX CODE: {form.color.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-title">Intelligence & Duration</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Select t={t} label="Logic Integration" value={form.offerType} onChange={v => setForm(f => ({ ...f, offerType: v }))}
                  options={[{ value: 'none', label: 'None' }, { value: 'category', label: 'Category Smart-Offer' }]} />

                {form.offerType === 'category' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Select t={t} label="Target Category" value={form.offerTarget} onChange={v => setForm(f => ({ ...f, offerTarget: v }))}
                      options={(CATEGORIES || []).map(c => ({ value: c, label: c }))} />
                    <Input t={t} label="Yield (%)" value={form.offerDiscount} onChange={v => setForm(f => ({ ...f, offerDiscount: +v }))} type="number" />
                  </div>
                )}
              </div>
            </div>

            <div className="studio-preview-pane">
              <div style={{
                width: '100%', height: '100%', borderRadius: 32, position: 'relative', overflow: 'hidden',
                background: form.grad || form.color, boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%'
              }}>
                {form.image && (
                   <img src={form.image} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, transparent 100%)' }} />
                
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '70%' }}>
                  {form.offerDiscount > 0 && (
                    <div style={{ display: 'inline-flex', padding: '8px 20px', background: 'var(--primary)', color: 'white', borderRadius: 99, fontWeight: 900, fontSize: 18, marginBottom: 24, boxShadow: '0 10px 20px rgba(99,102,241,0.3)' }}>
                      {form.offerDiscount}% EXCLUSIVE DISCOUNT
                    </div>
                  )}
                  <h1 style={{ fontSize: 80, fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: 20, letterSpacing: '-0.04em' }}>{form.title || 'Headline'}</h1>
                  <p style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 40 }}>{form.subtitle || 'Sub-headline goes here'}</p>
                  <div style={{ height: 64, width: 'fit-content', padding: '0 40px', background: 'white', color: 'var(--text-deep)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20 }}>
                    {form.cta}
                  </div>
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: 30, right: 30, color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: 11, letterSpacing: 2 }}>
                 ULTRA-HUD PREVIEW NODE
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade">
          {/* Header */}
          <div className="page-header">
            <div className="header-title-box">
              <div className="header-breadcrumb">Marketing Engine</div>
              <h1>Merchandising Command</h1>
            </div>
            <button className="studio-btn" onClick={() => setShowAdd(true)}>
               Initialize Studio <Layout size={18} strokeWidth={2.5} />
            </button>
          </div>

          {banners.length === 0 ? (
            <div style={{ background: 'white', padding: 100, borderRadius: 40, border: '1px solid var(--glass-border)', textAlign: 'center' }}>
               <Monitor size={64} style={{ opacity: 0.1, marginBottom: 24 }} />
               <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 12px 0' }}>Display Grid Depleted</h2>
               <p style={{ color: 'var(--text-muted)', fontWeight: 600, maxWidth: 400, margin: '0 auto 32px' }}>Initialize your creative assets to begin generating engagement at customer nodes.</p>
               <button className="studio-btn" style={{ margin: '0 auto' }} onClick={() => setShowAdd(true)}>Start Crafting</button>
            </div>
          ) : (
            <div className="banner-grid">
              {banners.map((b, idx) => (
                <div key={b.id} className="banner-card animate-fade" style={{ animationDelay: `${0.1 + idx * 0.1}s`, opacity: b.active ? 1 : 0.6 }}>
                  <div className={`card-preview ${b.image ? 'gradient' : ''}`} style={b.image ? { backgroundImage: `url(${b.image})` } : { background: b.grad }}>
                    <div className="preview-overlay">
                      <div className="preview-title">{b.title}</div>
                      <div className="preview-subtitle">{b.subtitle}</div>
                    </div>
                    <Badge 
                      text={b.active ? 'ACTIVE' : 'PAUSED'} 
                      style={{ position: 'absolute', top: 20, right: 20, fontWeight: 900, padding: '4px 12px', borderRadius: 8, fontSize: 10, border: 'none', background: b.active ? '#10B981' : '#64748B', color: 'white' }} 
                    />
                  </div>
                  
                  <div className="card-body">
                    <div className="logic-row">
                      <Calendar size={14} /> {(b.startDate || '').slice(0, 10)} <ChevronRight size={10} /> {(b.endDate || '').slice(0, 10)}
                    </div>
                    
                    {b.offerType !== 'none' && (
                      <div style={{ marginBottom: 20 }}>
                         <div className="offer-pill"><Tag size={12} /> {b.offerDiscount}% OFF {b.offerTarget}</div>
                      </div>
                    )}

                    <div className="card-actions">
                      <button className={`card-action-btn ${b.active ? 'paused-now' : 'active-now'}`} onClick={() => handleToggle(b.id, !b.active)}>
                         {b.active ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Activate</>}
                      </button>
                      <button className="card-action-btn" onClick={() => handleDuplicate(b)}>
                         <Copy size={16} />
                      </button>
                      <button className="card-action-btn delete" onClick={() => handleDelete(b.id)}>
                         <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
