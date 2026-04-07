import { useState } from 'react'
import { Btn, Input, Card, Toggle, Select } from '@/components/ui'
import { notify } from '@/components/shared'
import { genId } from '@/lib/utils'
import { isOptimoEnabled, syncUsers, syncVenues, syncSites } from '@/services/optimo'
import { upsertSetting } from '@/services/settings'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useVenueStore } from '@/stores/venueStore'

const DEFAULT_VENUE_ID = 'a0000000-0000-0000-0000-000000000001'
const DEFAULT_SITE_ID = 'b0000000-0000-0000-0000-000000000001'

export const SettingsPage = ({ settings, setSettings, addAudit, currentUser, darkMode, setDarkMode, t, venues = [], setVenues }) => {
  const [form, setForm] = useState({ ...settings })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [optimoSyncing, setOptimoSyncing] = useState(false)
  const [isAddingOutlet, setIsAddingOutlet] = useState(false)
  const [newOutletName, setNewOutletName] = useState('')
  const { selectedVenueId, selectedSiteId } = useVenueStore()

  const venueId = selectedVenueId || currentUser?.venue_id || currentUser?.venueId || DEFAULT_VENUE_ID
  const siteId = selectedSiteId || currentUser?.site_id || currentUser?.siteId || DEFAULT_SITE_ID

  const sections = [
    { title: 'Store Info', fields: [['Store Name', 'storeName'], ['Address', 'storeAddress'], ['Phone', 'storePhone'], ['Email', 'storeEmail']] },
    { title: 'Financial', fields: [['Currency Symbol', 'sym', 'select', [{ value: '£', label: '£ (GBP)' }, { value: '$', label: '$ (USD)' }, { value: '€', label: '€ (EUR)' }]], [`Loyalty Rate (pts/${form.sym || '£'})`, 'loyaltyRate', 'number'], [`Point Value (${form.sym || '£'}/pt)`, 'loyaltyValue', 'number']] },
    { title: 'Receipt', fields: [['Footer Text', 'receiptFooter'], ['Return Days', 'returnDays', 'number']] },
    { title: 'Policies', fields: [['Return Policy', 'returnPolicy', 'textarea']] },
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
        console.warn('Supabase settings sync failed:', err?.message)
      }
    }

    notify('Settings saved!', 'success')
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleOptimoSyncNow = async () => {
    setOptimoSyncing(true)
    try {
      await Promise.all([syncUsers(), syncVenues(), syncSites()])
      notify('Optimo integration not yet configured', 'warning')
    } catch {
      notify('Optimo integration not yet configured', 'warning')
    } finally {
      setOptimoSyncing(false)
    }
  }

  const handleAddOutlet = async () => {
    if (!newOutletName.trim()) { notify('Please enter an outlet name', 'error'); return }
    const ns = { id: genId('SITE'), name: newOutletName, capacity: 500, status: 'active', venue_id: venueId, type: 'retail' }
    
    try {
      if (isSupabaseConfigured()) {
         const { error } = await supabase.from('sites').insert({
            id: ns.id, venue_id: ns.venue_id, name: ns.name, type: ns.type, capacity: ns.capacity, status: ns.status
         })
         if (error) throw error
      }
      setVenues(vs => vs.map(v => v.id === venueId ? { ...v, sites: [...(v.sites || []), ns] } : v))
      addAudit(currentUser, 'Outlet Added', 'Settings', `New outlet: ${newOutletName}`)
      notify(`Outlet "${newOutletName}" added`, 'success')
      setNewOutletName('')
      setIsAddingOutlet(false)
    } catch (err) {
      console.error(err)
      notify('Failed to add outlet to database', 'error')
    }
  }

  const handleDeleteOutlet = async (sid, sname) => {
    try {
      if (isSupabaseConfigured()) {
         const { error } = await supabase.from('sites').delete().eq('id', sid)
         if (error) throw error
      }
      setVenues(vs => vs.map(v => v.id === venueId ? { ...v, sites: v.sites.filter(s => s.id !== sid) } : v))
      addAudit(currentUser, 'Outlet Deleted', 'Settings', `Removed outlet: ${sname}`)
      notify(`Outlet "${sname}" removed`, 'success')
    } catch (err) {
      console.error(err)
      notify('Failed to delete outlet from database', 'error')
    }
  }

  const activeVenue = venues.find(v => v.id === venueId) || venues[0]

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
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>System Settings</h1>
          <p style={{ fontSize: 16, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Configure your store identity, financial protocols, and localized outlets.</p>
        </div>
        <Btn t={t} onClick={handleSave} disabled={saving} style={{ 
          borderRadius: 14, 
          background: saved ? '#22c55e' : 'linear-gradient(135deg, #4f46e5, #4338ca)', 
          color: '#fff', 
          padding: '12px 32px', 
          fontWeight: 900, 
          fontSize: 15,
          boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
          border: 'none',
          minWidth: 160
        }}>
          {saving ? '⏳ Saving...' : saved ? '✓ Settings Saved' : 'Save All Changes'}
        </Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(380px,100%),1fr))', gap: 24 }}>
        {sections.map(({ title, fields }) => (
          <div key={title} style={{ background: '#fff', borderRadius: 28, padding: 32, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 24, letterSpacing: '-0.01em' }}>{title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {fields.map(([label, key, type, options]) => (
                type === 'select' ? (
                  <Select
                    key={key}
                    t={t}
                    label={label}
                    value={form[key] || ''}
                    onChange={v => setForm(f => ({ ...f, [key]: v }))}
                    options={options}
                  />
                ) : type === 'textarea' ? (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 11, color: '#64748b', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>
                    <textarea
                      value={form[key] || ''}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={`Enter your ${label.toLowerCase()}...`}
                      style={{ 
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, 
                        padding: '14px 18px', color: '#0f172a', fontSize: 14, fontWeight: 600, outline: 'none', 
                        width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', minHeight: 120, resize: 'vertical'
                      }} 
                    />
                  </div>
                ) : (
                  <Input
                    key={key}
                    t={t}
                    label={label}
                    value={form[key] || ''}
                    onChange={v => setForm(f => ({ ...f, [key]: type === 'number' ? +v : v }))}
                    type={type || 'text'}
                    style={{ borderRadius: 16 }}
                  />
                )
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 28, padding: 32, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em' }}>Deployed Outlets & Stations</div>
          {!isAddingOutlet && (
            <Btn t={t} size="sm" style={{ 
              background: '#4f46e5', color: '#fff', borderRadius: 12, padding: '10px 20px', 
              fontWeight: 900, fontSize: 13, border: 'none', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' 
            }} onClick={() => setIsAddingOutlet(true)}>+ Add Outlet</Btn>
          )}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {(activeVenue?.sites || []).map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>{s.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, marginTop: 2 }}>{s.id}</div>
              </div>
              <button 
                onClick={() => handleDeleteOutlet(s.id, s.name)}
                style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', background: '#fff', border: '1px solid #fecaca', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                🗑️
              </button>
            </div>
          ))}

          {isAddingOutlet && (
            <div style={{ padding: 24, background: '#f8fafc', borderRadius: 20, border: '2px dashed #4f46e5', gridColumn: 'span 1' }}>
              <div style={{ fontSize: 12, color: '#4f46e5', fontWeight: 900, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Configure New POS Terminal</div>
              <input 
                type="text" 
                placeholder="e.g. North Gate Bar" 
                value={newOutletName} 
                onChange={e => setNewOutletName(e.target.value)} 
                autoFocus
                style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <Btn t={t} variant="ghost" fullWidth style={{ borderRadius: 12, padding: 12, fontWeight: 800, color: '#64748b' }} onClick={() => setIsAddingOutlet(false)}>Cancel</Btn>
                <Btn t={t} fullWidth style={{ 
                  borderRadius: 12, padding: 12, fontWeight: 900, 
                  background: '#4f46e5', color: '#fff', border: 'none'
                }} onClick={handleAddOutlet}>Save Outlet</Btn>
              </div>
            </div>
          )}

          {(!activeVenue?.sites || activeVenue.sites.length === 0) && !isAddingOutlet && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: 14, fontWeight: 600, gridColumn: 'span 1' }}>
              No localized outlets configured for this venue.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', borderRadius: 28, padding: 32, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 24, letterSpacing: '-0.01em' }}>Optimo Core Integration</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>Global Feature Protocol</div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 2 }}>System-wide integration bridge</div>
              </div>
              <div style={{ 
                padding: '6px 12px', 
                borderRadius: 10, 
                background: isOptimoEnabled() ? '#f0fdf4' : '#f8fafc', 
                color: isOptimoEnabled() ? '#22c55e' : '#64748b',
                fontSize: 11,
                fontWeight: 900,
                textTransform: 'uppercase' 
              }}>
                {isOptimoEnabled() ? '✓ Active' : 'Disabled'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>Direct Cloud Sync</div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 2 }}>Synchronize users, venues, and sites</div>
              </div>
              <Btn t={t} style={{ 
                background: '#fff', color: '#4f46e5', border: '1px solid #4f46e5', borderRadius: 12, padding: '10px 20px', 
                fontWeight: 900, fontSize: 12
              }} onClick={handleOptimoSyncNow} disabled={optimoSyncing}>
                {optimoSyncing ? '⏳ Processing...' : 'Sync Data Now'}
              </Btn>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 28, padding: 32, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 24, letterSpacing: '-0.01em' }}>Interface Performance</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: '#f8fafc', borderRadius: 20, border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a' }}>Global Dark Mode</div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginTop: 2 }}>Apply high-contrast low-light theme</div>
            </div>
            <Toggle t={t} value={darkMode} onChange={setDarkMode} />
          </div>
        </div>
      </div>


    </div>
  )
}
