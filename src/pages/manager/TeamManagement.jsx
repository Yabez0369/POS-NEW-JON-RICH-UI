import { useState, useMemo } from 'react'
import { Btn, Input, Badge, Card, StatCard, Modal, Table, Select } from '@/components/ui'
import { notify } from '@/components/shared'
import { fmt, ts } from '@/lib/utils'

const TeamManagement = ({ users, setUsers, counters, orders, addAudit, currentUser, t, settings }) => {
  const [viewMode, setViewMode] = useState('all') // 'all', 'cashier', 'staff'
  const [displayStyle, setDisplayStyle] = useState('table') // 'grid', 'table'
  const [showAdd, setShowAdd] = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'user123',
    role: 'cashier',
    counter: counters[0]?.name || ''
  })

  const team = useMemo(() => {
    return users.filter(u => u.role === 'cashier' || u.role === 'staff')
  }, [users])

  const filteredTeam = useMemo(() => {
    if (viewMode === 'all') return team
    return team.filter(u => u.role === viewMode)
  }, [team, viewMode])

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      password: 'user123',
      role: 'cashier',
      counter: counters[0]?.name || ''
    })
    setEditMember(null)
  }

  const handleSave = () => {
    if (editMember) {
      setUsers(us => us.map(u => u.id === editMember.id ? { ...u, ...form } : u))
      addAudit(currentUser, 'Team Member Updated', 'Team', form.name)
      notify(form.name + ' updated!', 'success')
    } else {
      const newUser = {
        id: Date.now(),
        ...form,
        avatar: form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        active: true,
        joinDate: ts(),
        loyaltyPoints: 0,
        tier: 'N/A'
      }
      setUsers(us => [...us, newUser])
      addAudit(currentUser, 'Team Member Added', 'Team', `${form.name} (${form.role}) at ${form.counter}`)
      notify(form.name + ' added to team!', 'success')
    }
    setShowAdd(false)
    resetForm()
  }

  const handleRemove = (m) => {
    setUsers(us => us.filter(u => u.id !== m.id))
    addAudit(currentUser, 'Team Member Removed', 'Team', m.name)
    notify(m.name + ' removed', 'warning')
  }

  const handleToggleActive = (m) => {
    setUsers(us => us.map(u => u.id === m.id ? { ...u, active: !u.active } : u))
    notify(m.name + ' ' + (m.active ? 'deactivated' : 'activated'), 'info')
  }

  const roleColors = {
    cashier: t.green,
    staff: t.teal,
    admin: t.red
  }

  return (
    <div style={{ 
      background: 'transparent',
      minHeight: '100%', padding: '32px', borderRadius: 24,
      display: 'flex', flexDirection: 'column', gap: 20, boxSizing: 'border-box' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 950, color: '#1E293B' }}>Team Management</div>
          <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Manage your store staff and cashiers</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ background: t.bg3, padding: 4, borderRadius: 10, display: 'flex', border: `1px solid ${t.border}` }}>
            <button onClick={() => setDisplayStyle('grid')} style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: displayStyle === 'grid' ? t.bg : 'transparent', color: displayStyle === 'grid' ? t.accent : t.text3, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Grid</button>
            <button onClick={() => setDisplayStyle('table')} style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: displayStyle === 'table' ? t.bg : 'transparent', color: displayStyle === 'table' ? t.accent : t.text3, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Table</button>
          </div>
          <Btn t={t} onClick={() => { resetForm(); setShowAdd(true) }}>+ Add Member</Btn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard t={t} title="Total Team" value={team.length} color={t.blue} icon="👥" />
        <StatCard t={t} title="Cashiers" value={team.filter(u => u.role === 'cashier').length} color={t.green} icon="🛒" />
        <StatCard t={t} title="Staff" value={team.filter(u => u.role === 'staff').length} color={t.teal} icon="🖥️" />
        <StatCard t={t} title="Active" value={team.filter(u => u.active).length} color={t.accent} icon="✅" />
      </div>

      <div style={{ display: 'flex', gap: 10, borderBottom: `1px solid ${t.border}`, paddingBottom: 10 }}>
        {['all', 'cashier', 'staff'].map(m => (
          <button
            key={m}
            onClick={() => setViewMode(m)}
            style={{
              padding: '6px 16px', borderRadius: 20, border: 'none',
              background: viewMode === m ? t.accent + '15' : 'transparent',
              color: viewMode === m ? t.accent : t.text3,
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {m === 'all' ? 'Everyone' : m + 's'}
          </button>
        ))}
      </div>

      {displayStyle === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filteredTeam.map(m => (
            <Card t={t} key={m.id} style={{
              padding: 0,
              background: `${t.bg2}BF`,
              backdropFilter: 'blur(12px)',
              border: `1px solid ${t.border}40`,
              borderRadius: 20,
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }} hover>
              <div style={{ height: 60, background: `linear-gradient(135deg, ${roleColors[m.role] || t.accent}40, transparent)`, borderBottom: `1px solid ${t.border}20` }} />
              <div style={{ padding: '0 20px 20px', marginTop: -30 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 15 }}>
                  <div style={{
                    width: 64, height: 64,
                    background: t.bg2,
                    border: `3px solid ${roleColors[m.role] || t.accent}`,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 900,
                    color: t.text,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    overflow: 'hidden'
                  }}>
                    {m.avatar?.startsWith('http') || m.avatar?.startsWith('data:') || m.avatar?.startsWith('/') ? (
                      <img src={m.avatar} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      m.avatar?.length <= 3 ? m.avatar : m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 5 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: t.text, letterSpacing: -0.3 }}>{m.name}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <Badge t={t} text={m.role} color={m.role === 'cashier' ? 'green' : 'teal'} />
                      <Badge t={t} text={m.active ? 'Active' : 'Inactive'} color={m.active ? 'green' : 'red'} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: `${t.bg3}40`, padding: 16, borderRadius: 12, border: `1px solid ${t.border}20` }}>
                  {[
                    ['📧 Email', m.email],
                    ['📞 Phone', m.phone || '—'],
                    ['📍 Counter', m.counter || 'Unassigned'],
                    ['📅 Joined', m.joinDate || '—'],
                    ...(m.role === 'cashier' ? [['💰 Revenue', fmt(orders.filter(o => o.cashierId === m.id).reduce((s, o) => s + o.total, 0), settings?.sym)]] : [])
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: t.text3, fontWeight: 600 }}>{k}</span>
                      <span style={{ color: t.text, fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <Btn t={t} variant="ghost" size="sm" style={{ flex: 1, border: `1px solid ${t.border}` }} onClick={() => {
                    setEditMember(m)
                    setForm({ name: m.name, email: m.email, phone: m.phone || '', password: m.password || '', role: m.role, counter: m.counter || '' })
                    setShowAdd(true)
                  }}>Edit</Btn>
                  <Btn t={t} variant={m.active ? 'danger' : 'success'} size="sm" style={{ flex: 1 }} onClick={() => handleToggleActive(m)}>
                    {m.active ? 'Deactivate' : 'Activate'}
                  </Btn>
                  <Btn t={t} variant="ghost" size="sm" onClick={() => handleRemove(m)} style={{ border: `1px solid ${t.border}` }}>🗑</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card t={t} style={{ padding: 0, overflow: 'hidden' }}>
          <Table
            t={t}
            cols={['Member', 'Role', 'Status', 'Counter', 'Email', 'Joined', 'Actions']}
            rows={filteredTeam.map(m => [
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, minWidth: 32, background: (roleColors[m.role] || t.accent) + '20', border: `1px solid ${(roleColors[m.role] || t.accent)}40`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: roleColors[m.role] || t.accent, overflow: 'hidden' }}>
                    {m.avatar?.startsWith('http') || m.avatar?.startsWith('data:') || m.avatar?.startsWith('/') ? (
                      <img src={m.avatar} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      m.avatar?.length <= 3 ? m.avatar : m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    )}
                </div>
                <span style={{ fontWeight: 700, color: t.text, whiteSpace: 'nowrap' }}>{m.name}</span>
              </div>,
              <Badge t={t} text={m.role} color={m.role === 'cashier' ? 'green' : 'teal'} />,
              <Badge t={t} text={m.active ? 'Active' : 'Inactive'} color={m.active ? 'green' : 'red'} />,
              <span style={{ fontSize: 12, color: t.text2 }}>{m.counter || '—'}</span>,
              <span style={{ fontSize: 12, color: t.text3 }}>{m.email}</span>,
              <span style={{ fontSize: 12, color: t.text3 }}>{m.joinDate || '—'}</span>,
              <div style={{ display: 'flex', gap: 5 }}>
                <Btn t={t} variant="ghost" size="sm" onClick={() => {
                  setEditMember(m)
                  setForm({ name: m.name, email: m.email, phone: m.phone || '', password: m.password || '', role: m.role, counter: m.counter || '' })
                  setShowAdd(true)
                }}>✏️</Btn>
                <Btn t={t} variant="ghost" size="sm" onClick={() => handleToggleActive(m)}>{m.active ? '⏸️' : '▶️'}</Btn>
                <Btn t={t} variant="ghost" size="sm" onClick={() => handleRemove(m)}>🗑</Btn>
              </div>,
            ])}
            empty="No team members found"
          />
        </Card>
      )}

      {showAdd && (
        <Modal t={t} title={editMember ? 'Edit Team Member' : 'Add Team Member'} onClose={() => { setShowAdd(false); resetForm() }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
              <Input t={t} label="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
              <Input t={t} label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} required />
              <Input t={t} label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
              <Input t={t} label="Password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} type="password" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
              <Select t={t} label="Role" value={form.role} onChange={v => setForm(f => ({ ...f, role: v }))} options={[
                { value: 'cashier', label: 'Cashier — POS' },
                { value: 'staff', label: 'Staff — Orders' }
              ]} />
              <Select t={t} label="Counter" value={form.counter} onChange={v => setForm(f => ({ ...f, counter: v }))} options={[
                { value: '', label: '— Unassigned —' },
                ...counters.filter(c => c.active).map(c => ({ value: c.name, label: c.name }))
              ]} />
            </div>
            <div style={{ marginTop: 5 }}>
              <Btn t={t} onClick={handleSave} disabled={!form.name || !form.email} style={{ width: '100%' }}>
                {editMember ? 'Update Member' : 'Add Team Member'}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default TeamManagement
