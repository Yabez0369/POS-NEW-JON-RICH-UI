import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Btn, Input, Card } from '@/components/ui'
import { fmt } from '@/lib/utils'
import { TIER_CONFIG } from '@/lib/constants'

export function ProfilePage() {
  const { t } = useTheme()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  if (!currentUser) {
    navigate('/login')
    return null
  }

  const isCustomer = currentUser.role === 'customer'
  const tierInfo = TIER_CONFIG[currentUser.tier] || TIER_CONFIG.Bronze

  const handleSave = () => {
    // TODO: persist profile updates
    setEditing(false)
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 5%' }}>
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: t.text3, cursor: 'pointer', fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>← Back</button>
        <div style={{ fontSize: 28, fontWeight: 900, color: t.text }}>Profile</div>
        <div style={{ fontSize: 14, color: t.text3, marginTop: 4 }}>Manage your account</div>
      </div>

      <Card t={t} style={{ padding: 24, marginBottom: 20 }}>
        {/* Avatar & basic info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg,${t.accent},${t.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: '#fff' }}>
            {currentUser.avatar || currentUser.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: t.text }}>{currentUser.name}</div>
            <div style={{ fontSize: 14, color: t.text3, marginTop: 4 }}>{currentUser.email}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, background: t.bg3, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: t.text2 }}>
              {tierInfo.icon} {currentUser.role}
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {editing ? (
            <>
              <Input t={t} label="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Your name" />
              <Input t={t} label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+44 7700 900000" />
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn t={t} onClick={handleSave}>Save</Btn>
                <Btn t={t} variant="ghost" onClick={() => setEditing(false)}>Cancel</Btn>
              </div>
            </>
          ) : (
            <>
              <div>
                <div style={{ fontSize: 11, color: t.text4, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>Name</div>
                <div style={{ fontSize: 15, color: t.text }}>{currentUser.name}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: t.text4, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>Email</div>
                <div style={{ fontSize: 15, color: t.text }}>{currentUser.email}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: t.text4, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>Phone</div>
                <div style={{ fontSize: 15, color: t.text }}>{currentUser.phone || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: t.text4, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>Role</div>
                <div style={{ fontSize: 15, color: t.text }}>{currentUser.role}</div>
              </div>
              <Btn t={t} variant="outline" size="sm" onClick={() => { setForm({ name: currentUser.name, phone: currentUser.phone || '' }); setEditing(true); }}>Edit Profile</Btn>
            </>
          )}
        </div>
      </Card>

      {/* Password change (UI only) */}
      <Card t={t} style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 12 }}>Change Password</div>
        <div style={{ fontSize: 13, color: t.text3, marginBottom: 16 }}>Update your password to keep your account secure.</div>
        {showPasswordForm ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input t={t} label="Current Password" type="password" placeholder="••••••••" />
            <Input t={t} label="New Password" type="password" placeholder="••••••••" />
            <Input t={t} label="Confirm New Password" type="password" placeholder="••••••••" />
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn t={t} size="sm">Update Password</Btn>
              <Btn t={t} variant="ghost" size="sm" onClick={() => setShowPasswordForm(false)}>Cancel</Btn>
            </div>
          </div>
        ) : (
          <Btn t={t} variant="outline" size="sm" onClick={() => setShowPasswordForm(true)}>Change Password</Btn>
        )}
      </Card>

      {/* Loyalty info (customers only) */}
      {isCustomer && (
        <Card t={t} style={{ padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 16 }}>Loyalty Programme</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
            <div style={{ background: t.bg3, borderRadius: 12, padding: 16, border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 11, color: t.text4, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7 }}>Tier</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: tierInfo.color, marginTop: 4 }}>{tierInfo.icon} {currentUser.tier || 'Bronze'}</div>
            </div>
            <div style={{ background: t.bg3, borderRadius: 12, padding: 16, border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 11, color: t.text4, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7 }}>Points</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: t.text, marginTop: 4 }}>{currentUser.loyaltyPoints ?? 0}</div>
            </div>
            <div style={{ background: t.bg3, borderRadius: 12, padding: 16, border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 11, color: t.text4, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7 }}>Total Spent</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: t.green, marginTop: 4 }}>{fmt(currentUser.totalSpent ?? 0)}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
