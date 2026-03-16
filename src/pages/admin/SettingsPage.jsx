import { useState } from 'react'
import { Btn, Input, Card, Toggle } from '@/components/ui'
import { notify } from '@/components/shared'
import { isOptimoEnabled, syncUsers, syncVenues, syncSites } from '@/services/optimo'

export const SettingsPage = ({ settings, setSettings, addAudit, currentUser, darkMode, setDarkMode, t }) => {
  const [form, setForm] = useState({ ...settings })
  const [saved, setSaved] = useState(false)
  const [optimoSyncing, setOptimoSyncing] = useState(false)

  const sections = [
    { title: 'Store Info', fields: [['Store Name', 'storeName'], ['Address', 'storeAddress'], ['Phone', 'storePhone'], ['Email', 'storeEmail']] },
    { title: 'Financial', fields: [['Currency Symbol', 'sym'], ['VAT Rate (%)', 'vatRate', 'number'], ['Loyalty Rate (pts/£)', 'loyaltyRate', 'number'], ['Point Value (£/pt)', 'loyaltyValue', 'number']] },
    { title: 'Receipt', fields: [['Footer Text', 'receiptFooter'], ['Return Days', 'returnDays', 'number']] },
  ]

  const handleSave = () => {
    setSettings(form)
    addAudit(currentUser, 'Settings Updated', 'Settings', 'Settings saved')
    notify('Settings saved!', 'success')
    setSaved(true)
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: t.text }}>System Settings</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(340px,100%),1fr))', gap: 16 }}>
        {sections.map(({ title, fields }) => (
          <Card t={t} key={title}>
            <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 14 }}>{title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {fields.map(([label, key, type]) => (
                <Input
                  key={key}
                  t={t}
                  label={label}
                  value={form[key] || ''}
                  onChange={v => setForm(f => ({ ...f, [key]: type === 'number' ? +v : v }))}
                  type={type || 'text'}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>

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

      <Btn t={t} size="lg" onClick={handleSave}>
        {saved ? '✓ Saved!' : 'Save Settings'}
      </Btn>
    </div>
  )
}
