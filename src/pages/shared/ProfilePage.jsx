import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Btn, Input, Card } from '@/components/ui'
import { fmt } from '@/lib/utils'
import { TIER_CONFIG } from '@/lib/constants'

export function ProfilePage({ settings = {} }) {
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
    <div style={{ 
      background: '#f8fafc',
      margin: '-24px',
      padding: '40px 32px',
      minHeight: 'calc(100vh - 64px)',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, 
              color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 800,
              padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5' }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
          >
            ← Back to System
          </button>
          <div style={{ marginTop: 24 }}>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>User Account Profile</h1>
            <p style={{ fontSize: 16, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Manage your personal identity and security configurations.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#fff', borderRadius: 32, padding: 40, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 40 }}>
              <div style={{ 
                width: 100, height: 100, borderRadius: 28, 
                background: 'linear-gradient(135deg, #4f46e5, #4338ca)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: 36, fontWeight: 900, color: '#fff',
                boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
                transform: 'rotate(-2deg)'
              }}>
                {currentUser.avatar || currentUser.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{currentUser.name}</div>
                <div style={{ fontSize: 15, color: '#64748b', marginTop: 4, fontWeight: 700 }}>{currentUser.email}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, background: '#f5f3ff', padding: '6px 16px', borderRadius: 12, fontSize: 12, fontWeight: 900, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  🛡️ {currentUser.role} Clearanced
                </div>
              </div>
              {!editing && (
                <Btn t={t} style={{ 
                  borderRadius: 14, background: '#f8fafc', color: '#4f46e5', 
                  border: '1px solid #e2e8f0', padding: '12px 24px', fontWeight: 900, fontSize: 14 
                }} onClick={() => { setForm({ name: currentUser.name, phone: currentUser.phone || '' }); setEditing(true); }}>Edit Profile</Btn>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
              {editing ? (
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <Input t={t} label="Full Legal Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Your name" style={{ borderRadius: 16 }} />
                    <Input t={t} label="Primary Contact" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+44 7700 900000" style={{ borderRadius: 16 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Btn t={t} style={{ borderRadius: 16, padding: '14px 28px', background: '#4f46e5', color: '#fff', border: 'none', fontWeight: 900 }} onClick={handleSave}>Save Identity Updates</Btn>
                    <Btn t={t} variant="ghost" style={{ borderRadius: 16, padding: '14px 28px', background: '#f8fafc', color: '#64748b', fontWeight: 800 }} onClick={() => setEditing(false)}>Cancel Changes</Btn>
                  </div>
                </div>
              ) : (
                <>
                  {[
                    { label: 'Display Name', value: currentUser.name },
                    { label: 'Email Protocol', value: currentUser.email },
                    { label: 'Mobile Reference', value: currentUser.phone || 'Not Configured' },
                    { label: 'Access Level', value: currentUser.role.toUpperCase() },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</div>
                      <div style={{ fontSize: 16, color: '#0f172a', fontWeight: 800 }}>{value}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isCustomer ? '1fr 1fr' : '1fr', gap: 24 }}>
            <div style={{ background: '#fff', borderRadius: 32, padding: 32, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.01em' }}>Security Configuration</div>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24, fontWeight: 600 }}>Modify your access credentials to maintain account integrity.</div>
              
              {showPasswordForm ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Input t={t} label="Current Access Key" type="password" placeholder="••••••••" style={{ borderRadius: 14 }} />
                  <Input t={t} label="New Access Key" type="password" placeholder="••••••••" style={{ borderRadius: 14 }} />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Btn t={t} style={{ borderRadius: 14, background: '#0f172a', color: '#fff', padding: '12px 24px', fontWeight: 900 }}>Update Key</Btn>
                    <Btn t={t} variant="ghost" onClick={() => setShowPasswordForm(false)} style={{ fontWeight: 800 }}>Cancel</Btn>
                  </div>
                </div>
              ) : (
                <Btn t={t} style={{ 
                  borderRadius: 14, border: '1px solid #0f172a', color: '#0f172a', 
                  background: '#fff', padding: '12px 24px', fontWeight: 900 
                }} onClick={() => setShowPasswordForm(true)}>Change Access Password</Btn>
              )}
            </div>

            {isCustomer && (
              <div style={{ background: '#fff', borderRadius: 32, padding: 32, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 16, letterSpacing: '-0.01em' }}>Loyalty Credentials</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: '#f8fafc', borderRadius: 16, padding: 16, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tier Rank</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: tierInfo.color, marginTop: 4 }}>{tierInfo.icon} {currentUser.tier || 'BRONZE'}</div>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: 16, padding: 16, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>Points Wallet</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>{currentUser.loyaltyPoints ?? 0}</div>
                  </div>
                </div>
                <div style={{ background: '#f0fdf4', borderRadius: 16, padding: 16, border: '1px solid #dcfce7', marginTop: 16 }}>
                    <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Ecosystem Spend</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#166534', marginTop: 4 }}>{fmt(currentUser.totalSpent ?? 0, settings?.sym)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
