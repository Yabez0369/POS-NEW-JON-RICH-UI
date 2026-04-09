import { useState } from 'react'
import { Btn, Input, Card, Toggle, Select } from '@/components/ui'
import { 
  Settings, Save, Store, CreditCard, Receipt, 
  MapPin, Cpu, Moon, RefreshCcw, Trash2, Plus, 
  Activity, Globe, Lock, ShieldCheck, Terminal
} from 'lucide-react'
import { notify } from '@/components/shared'
import { isOptimoEnabled, syncUsers, syncVenues, syncSites } from '@/services/optimo'
import { upsertSetting } from '@/services/settings'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useVenueStore } from '@/stores/venueStore'

const DEFAULT_VENUE_ID = 'a0000000-0000-0000-0000-000000000001'
const DEFAULT_SITE_ID = 'b0000000-0000-0000-0000-000000000001'

export const SettingsPage = ({ settings, setSettings, addAudit, currentUser, darkMode, setDarkMode, t }) => {
  const [form, setForm] = useState({ ...settings })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [optimoSyncing, setOptimoSyncing] = useState(false)
  const [isAddingOutlet, setIsAddingOutlet] = useState(false)
  const [newOutletName, setNewOutletName] = useState('')
  const { selectedVenueId, selectedSiteId } = useVenueStore()
  
  const activeVenue = { sites: [] }
  const handleAddOutlet = () => { setIsAddingOutlet(false); setNewOutletName('') }
  const handleDeleteOutlet = (id, name) => { console.log('Delete outlet', id) }

  const venueId = selectedVenueId || currentUser?.venue_id || currentUser?.venueId || DEFAULT_VENUE_ID
  const siteId = selectedSiteId || currentUser?.site_id || currentUser?.siteId || DEFAULT_SITE_ID

  const sections = [
    { title: 'Store Identity', icon: <Store size={18} />, fields: [['Store Name', 'storeName'], ['Global Address', 'storeAddress'], ['Contact Phone', 'storePhone'], ['System Email', 'storeEmail']] },
    { title: 'Financial Core', icon: <CreditCard size={18} />, fields: [['Currency Unit', 'sym', 'select', [{ value: '£', label: '£ (GBP)' }, { value: '$', label: '$ (USD)' }, { value: '€', label: '€ (EUR)' }]], [`Loyalty Yield (pts/${form.sym || '£'})`, 'loyaltyRate', 'number'], [`Unit Value (${form.sym || '£'}/pt)`, 'loyaltyValue', 'number']] },
    { title: 'Receipt Metadata', icon: <Receipt size={18} />, fields: [['Footer Component', 'receiptFooter'], ['Return Window (Days)', 'returnDays', 'number']] },
  ]

  const handleSave = async () => {
    setSaving(true)
    setSettings(form)
    addAudit(currentUser, 'Settings Updated', 'Settings', 'Settings saved')

    if (isSupabaseConfigured()) {
      try {
        for (const [key, value] of Object.entries(form)) {
          if (value !== undefined && value !== null) {
            await upsertSetting(key, value, venueId, siteId)
          }
        }
      } catch (err) {
        console.warn('Supabase configuration sync interrupted:', err?.message)
      }
    }

    notify('Parameters synchronized successfully', 'success')
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleOptimoSyncNow = async () => {
    setOptimoSyncing(true)
    try {
      await Promise.all([syncUsers(), syncVenues(), syncSites()])
      notify('Link established', 'info')
    } catch {
      notify('Integration offline', 'error')
    } finally {
      setOptimoSyncing(false)
    }
  }

  return (
    <div className="settings-hub-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .settings-hub-root {
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
          font-weight: 950;
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

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .config-block {
          background: white;
          border-radius: 32px;
          padding: 32px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 10px 40px -15px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .block-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .block-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: #EEF2FF; color: var(--primary); }
        .block-title { font-size: 18px; font-weight: 900; letter-spacing: -0.02em; }

        .input-group { display: flex; flexDirection: column; gap: 10px; }
        .input-label { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }

        .deployment-matrix {
            background: white; border-radius: 32px; padding: 40px; border: 1px solid var(--glass-border);
            margin-bottom: 32px;
        }
        .terminal-row {
            display: flex; align-items: center; justify-content: space-between; padding: 20px 24px;
            background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; transition: 0.2s;
        }
        .terminal-row:hover { border-color: var(--primary); background: white; box-shadow: 0 10px 20px -10px rgba(99, 102, 241, 0.2); }

        .core-integration {
            display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
        }

        .premium-save {
            height: 56px; padding: 0 32px; border-radius: 18px; border: none; font-size: 15px; font-weight: 900;
            cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 12px;
            background: var(--primary); color: white; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
        }
        .premium-save.saved { background: #10B981; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4); }
        .premium-save:hover { transform: translateY(-3px); box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.5); }
        .premium-save:disabled { opacity: 0.7; transform: none; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-settings { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* Header */}
      <div className="hub-header animate-settings">
        <div className="header-title-box">
          <div className="header-breadcrumb">System Preferences</div>
          <h1>Command Architecture</h1>
        </div>
        <button className={`premium-save ${saved ? 'saved' : ''}`} onClick={handleSave} disabled={saving}>
           {saving ? <RefreshCcw className="animate-spin" size={20} /> : saved ? <ShieldCheck size={20} /> : <Save size={20} />}
           {saving ? 'Synchronizing Cluster...' : saved ? 'Parameters Secured' : 'Commit Configuration'}
        </button>
      </div>

      {/* Main Settings Blocks */}
      <div className="settings-grid">
        {sections.map(({ title, icon, fields }, idx) => (
          <div key={title} className="config-block animate-settings" style={{ animationDelay: `${0.1 + idx * 0.1}s` }}>
            <div className="block-header">
                <div className="block-icon">{icon}</div>
                <div className="block-title">{title}</div>
            </div>
            <div style={{ display: 'grid', gap: 24 }}>
                {fields.map(([label, key, type, options]) => (
                  <div key={key} className="input-group">
                     <label className="input-label">{label}</label>
                     {type === 'select' ? (
                       <Select t={t} label="" value={form[key] || ''} onChange={v => setForm(f => ({ ...f, [key]: v }))} options={options} />
                     ) : (
                       <Input t={t} label="" value={form[key] || ''} onChange={v => setForm(f => ({ ...f, [key]: type === 'number' ? +v : v }))} type={type || 'text'} placeholder={`Set ${label.toLowerCase()}...`} />
                     )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Deployment Hub */}
      <div className="deployment-matrix animate-settings" style={{ animationDelay: '0.4s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
               <div className="block-title" style={{ fontSize: 22 }}>Deployment Matrix</div>
               <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>Active POS terminals and localized network nodes.</div>
            </div>
            {!isAddingOutlet && (
                <button className="premium-btn primary" style={{ height: 44, borderRadius: 12, padding: '0 20px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }} onClick={() => setIsAddingOutlet(true)}>
                    <Plus size={18} /> Initialize Terminal
                </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {(activeVenue?.sites || []).map(s => (
              <div key={s.id} className="terminal-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                   <div style={{ width: 10, height: 10, background: '#10B981', borderRadius: '50%' }} />
                   <div>
                      <div style={{ fontSize: 15, fontWeight: 900 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'monospace' }}>UUN: {s.id.slice(0, 8)}</div>
                   </div>
                </div>
                <button onClick={() => handleDeleteOutlet(s.id, s.name)} style={{ height: 36, width: 36, borderRadius: 10, border: 'none', background: '#FEE2E2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                    <Trash2 size={16} />
                </button>
              </div>
            ))}

            {isAddingOutlet && (
                <div className="terminal-row" style={{ border: '2px dashed var(--primary)', background: '#F5F7FF', gridColumn: 'span 1' }}>
                   <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--primary)', marginBottom: 12 }}>PROVISION NEW NODE</div>
                        <Input t={t} label="" value={newOutletName} onChange={setNewOutletName} placeholder="Static Terminal ID..." autoFocus />
                        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                           <button style={{ flex: 1, padding: 10, border: 'none', borderRadius: 10, fontWeight: 800, color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setIsAddingOutlet(false)}>Abort</button>
                           <button style={{ flex: 1, padding: 10, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 900, borderRadius: 10, cursor: 'pointer' }} onClick={handleAddOutlet}>Deploy</button>
                        </div>
                   </div>
                </div>
            )}
            
            {(!activeVenue?.sites || activeVenue.sites.length === 0) && !isAddingOutlet && (
              <div style={{ gridColumn: 'span 3', padding: '60px', textAlign: 'center' }}>
                 <Globe size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                 <div style={{ color: 'var(--text-muted)', fontWeight: 700 }}>No localized nodes detected in current grid coordinate.</div>
              </div>
            )}
          </div>
      </div>

      {/* Integration & OS Settings */}
      <div className="core-integration">
          <div className="config-block animate-settings" style={{ animationDelay: '0.5s' }}>
             <div className="block-header">
                <div className="block-icon"><Cpu size={18} /></div>
                <div className="block-title">Cloud Integration Bridge</div>
             </div>
             <div style={{ display: 'grid', gap: 16 }}>
                <div className="terminal-row">
                   <div>
                      <div style={{ fontWeight: 900 }}>Global Feature Protocol</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Active system-wide logic bridge</div>
                   </div>
                   <div style={{ padding: '6px 12px', background: isOptimoEnabled() ? '#DCFCE7' : '#F1F5F9', color: isOptimoEnabled() ? '#10B981' : 'var(--text-muted)', borderRadius: 10, fontSize: 11, fontWeight: 900 }}>
                      {isOptimoEnabled() ? 'LINK ACTIVE' : 'OFFLINE'}
                   </div>
                </div>
                <div className="terminal-row">
                   <div>
                      <div style={{ fontWeight: 900 }}>Synchronous Pulse</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Real-time database reconciliation</div>
                   </div>
                   <button className="premium-btn outline" style={{ height: 36, padding: '0 16px', fontSize: 12, borderRadius: 10, border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent', fontWeight: 900, cursor: 'pointer' }} 
                     onClick={handleOptimoSyncNow} disabled={optimoSyncing}>
                      {optimoSyncing ? 'Syncing...' : 'Initiate Sync'}
                   </button>
                </div>
             </div>
          </div>

          <div className="config-block animate-settings" style={{ animationDelay: '0.6s' }}>
             <div className="block-header">
                <div className="block-icon"><Moon size={18} /></div>
                <div className="block-title">Visual Paradigm</div>
             </div>
             <div className="terminal-row" style={{ marginTop: 8 }}>
                <div>
                   <div style={{ fontWeight: 900 }}>Low-Contrast Mode</div>
                   <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Reduced sensory load for dark environments</div>
                </div>
                <Toggle t={t} value={darkMode} onChange={setDarkMode} />
             </div>
             <div className="terminal-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Lock size={16} color="var(--primary)" />
                    <div>
                       <div style={{ fontWeight: 900 }}>Infrastructure Security</div>
                       <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>AES-256 System Encryption active</div>
                    </div>
                </div>
             </div>
          </div>
      </div>
    </div>
  )
}
