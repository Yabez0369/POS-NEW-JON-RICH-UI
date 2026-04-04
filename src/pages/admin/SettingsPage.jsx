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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: t.text }}>System Settings</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(340px,100%),1fr))', gap: 16 }}>
        {sections.map(({ title, fields }) => (
          <Card t={t} key={title}>
            <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 14 }}>{title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11, color: t.text3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7 }}>{label}</label>
                    <textarea
                      value={form[key] || ''}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ 
                        background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, 
                        padding: '10px 14px', color: t.text, fontSize: 13, outline: 'none', 
                        width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', minHeight: 80, resize: 'vertical'
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
                  />
                )
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card t={t}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: t.text }}>Outlets & Stations</div>
          {!isAddingOutlet && (
            <Btn t={t} size="sm" variant="secondary" onClick={() => setIsAddingOutlet(true)}>+ Add Outlet</Btn>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(activeVenue?.sites || []).map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: t.bg3, borderRadius: 12, border: `1px solid ${t.border}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{s.name}</div>
                <div style={{ fontSize: 11, color: t.text4 }}>Ref: {s.id}</div>
              </div>
              <button 
                onClick={() => handleDeleteOutlet(s.id, s.name)}
                style={{ padding: 6, color: t.red, background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.7, fontSize: 14 }}
              >
                🗑️
              </button>
            </div>
          ))}

          {isAddingOutlet && (
            <div style={{ marginTop: 6, padding: 12, background: t.bg4, borderRadius: 12, border: `1px dashed ${t.accent}` }}>
              <Input 
                t={t} 
                label="New Outlet Name" 
                placeholder="e.g. North Gate Bar" 
                value={newOutletName} 
                onChange={setNewOutletName} 
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Btn t={t} variant="ghost" fullWidth onClick={() => setIsAddingOutlet(false)}>Cancel</Btn>
                <Btn t={t} fullWidth onClick={handleAddOutlet}>Save Outlet</Btn>
              </div>
            </div>
          )}

          {(!activeVenue?.sites || activeVenue.sites.length === 0) && !isAddingOutlet && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: t.text4, fontSize: 13 }}>
              No outlets configured for this venue.
            </div>
          )}
        </div>
      </Card>

      <Card t={t}>
        <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 14 }}>Optimo Integration</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Feature flag</div>
              <div style={{ fontSize: 12, color: t.text3 }}>{isOptimoEnabled() ? 'Enabled' : 'Disabled'}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: isOptimoEnabled() ? t.green : t.text3 }}>
              {isOptimoEnabled() ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: `1px solid ${t.border}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Connection status</div>
              <div style={{ fontSize: 12, color: t.text3 }}>Not Connected</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: `1px solid ${t.border}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Sync</div>
              <div style={{ fontSize: 12, color: t.text3 }}>Sync users, venues, and sites from Optimo</div>
            </div>
            <Btn t={t} variant="secondary" onClick={handleOptimoSyncNow} disabled={optimoSyncing}>
              {optimoSyncing ? '⏳ Syncing...' : 'Sync Now'}
            </Btn>
          </div>
        </div>
      </Card>

      <Card t={t}>
        <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 14 }}>Appearance</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Dark Mode</div>
            <div style={{ fontSize: 12, color: t.text3 }}>Switch interface theme</div>
          </div>
          <Toggle t={t} value={darkMode} onChange={setDarkMode} />
        </div>
      </Card>

      <Btn t={t} size="lg" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
      </Btn>
    </div>
  )
}
