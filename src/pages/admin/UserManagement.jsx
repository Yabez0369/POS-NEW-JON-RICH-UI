import { useState, useMemo } from 'react'
import { Badge, Card, Table, Btn, Select } from '@/components/ui'
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Lock, 
  Unlock,
  Mail,
  Smartphone,
  Shield,
  Activity,
  Filter,
  MapPin,
  Building
} from 'lucide-react'
import { Modal } from '@/components/ui'
import { ImgWithFallback, notify } from '@/components/shared'
import { isSupabaseConfigured } from '@/lib/supabase'
import { updateProfile, createStaffMember } from '@/services/users'

export const UserManagement = ({ users = [], setUsers, venues = [], t }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showInvite, setShowInvite] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [assignForm, setAssignForm] = useState({ venue_id: '', site_id: '' })
  
  // Use local state if venues is missing
  const allVenues = venues || []

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchRole = filterRole === 'all' || u.role === filterRole
      return matchSearch && matchRole
    })
  }, [users, searchTerm, filterRole])

  const stats = useMemo(() => {
    const roles = { admin: 0, manager: 0, cashier: 0, staff: 0, customer: 0 }
    users.forEach(u => { if (roles[u.role] !== undefined) roles[u.role]++ })
    const active = users.filter(u => u.active).length
    return { ...roles, total: users.length, active, activePct: Math.round((active / (users.length || 1)) * 100) }
  }, [users])

  const roleColors = { 
    admin: 'red', 
    manager: 'yellow', 
    cashier: 'green', 
    staff: 'teal',
    customer: 'blue' 
  }

  const handleAssign = (user) => {
    setSelectedUser(user)
    setAssignForm({ 
      venue_id: user.venue_id || '', 
      site_id: user.site_id || '' 
    })
    setShowAssign(true)
  }

  const saveAssignment = async () => {
    try {
      if (isSupabaseConfigured()) {
        await updateProfile(selectedUser.id, { venue_id: assignForm.venue_id, site_id: assignForm.site_id })
      }
      setUsers(us => us.map(u => 
        u.id === selectedUser.id ? { ...u, ...assignForm } : u
      ))
      notify('Assignment updated for ' + selectedUser.name, 'success')
      setShowAssign(false)
    } catch (err) {
      console.error(err)
      notify('Failed to update assignment in DB', 'error')
    }
  }

  const clearAssignment = async () => {
    try {
      if (isSupabaseConfigured()) {
        await updateProfile(selectedUser.id, { venue_id: null, site_id: null })
      }
      setUsers(us => us.map(u => 
        u.id === selectedUser.id ? { ...u, venue_id: null, site_id: null } : u
      ))
      notify('Assignment cleared for ' + selectedUser.name, 'success')
      setShowAssign(false)
    } catch (err) {
      console.error(err)
      notify('Failed to clear assignment in DB', 'error')
    }
  }

  const handleToggleActive = async (u) => {
    const nextState = !u.active
    try {
      if (isSupabaseConfigured()) {
        await updateProfile(u.id, { active: nextState })
      }
      setUsers(us => us.map(x => x.id === u.id ? { ...x, active: nextState } : x))
      notify(`User ${u.name} ${nextState ? 'activated' : 'deactivated'}`, 'info')
    } catch (err) {
      console.error(err)
      notify('Failed to toggle active status in DB', 'error')
    }
  }

  const [inviteForm, setInviteForm] = useState({ email: '', role: 'cashier', venue_id: '', site_id: '' })

  const handleInvite = async () => {
    try {
      if (!inviteForm.email.includes('@')) {
         notify('Enter a valid email address', 'error')
         return
      }
      
      const payload = {
        name: inviteForm.email.split('@')[0].replace('.', ' '),
        email: inviteForm.email,
        password: 'ChangeMe123!', // Standard initial password for staff
        role: inviteForm.role,
        venueId: inviteForm.venue_id,
        siteId: inviteForm.site_id,
        phone: null
      }
      
      let finalData = { id: `USR-${Date.now()}`, ...payload }
      
      if (isSupabaseConfigured()) {
        const result = await createStaffMember(payload)
        finalData.id = result.id
      }
      
      const newUser = {
        ...finalData,
        venue_id: payload.venueId,
        site_id: payload.siteId,
        active: true,
        joinDate: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        avatar: finalData.name.charAt(0).toUpperCase()
      }
      
      setUsers(us => [...us, newUser])
      notify('Invitation dispatched!', 'success');
      setShowInvite(false);
      setInviteForm({ email: '', role: 'cashier', venue_id: '', site_id: '' })
    } catch (err) {
      console.error(err)
      notify('Failed to invite user via database', 'error')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: t.text, margin: 0 }}>User RBAC</h1>
          <p style={{ fontSize: 13, color: t.text3, marginTop: 4 }}>Manage system access, roles, and security permissions.</p>
        </div>
        <Btn t={t} onClick={() => setShowInvite(true)} style={{ borderRadius: 12, background: t.accent, color: '#fff', padding: '10px 24px', fontWeight: 800 }}>
          <UserPlus size={18} style={{ marginRight: 8 }} /> Invite New User
        </Btn>
      </div>

      {/* Role Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {[
            { label: 'Total Accounts', value: stats.total, color: t.accent, icon: <Users size={18} /> },
            { label: 'Active Sessions', value: stats.active, color: t.green, icon: <Activity size={18} /> },
            { label: 'Administrators', value: stats.admin, color: t.red, icon: <Shield size={18} /> },
            { label: 'Managers', value: stats.manager, color: t.yellow, icon: <ShieldCheck size={18} /> },
        ].map(({ label, value, color, icon }) => (
            <Card key={label} t={t} style={{ padding: '14px 18px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: t.text4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
              </div>
            </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card t={t} style={{ padding: '16px 20px', borderRadius: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: t.text4 }} />
          <input 
            type="text" 
            placeholder="Search by name, email, or role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '11px 12px 11px 44px', 
              borderRadius: 12, 
              border: `1px solid ${t.border}`, 
              background: t.bg, 
              color: t.text,
              fontSize: 13,
              outline: 'none',
              fontWeight: 600
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Roles' },
            { id: 'admin', label: 'Admins' },
            { id: 'manager', label: 'Managers' },
            { id: 'cashier', label: 'Cashiers' },
            { id: 'staff', label: 'Staff' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setFilterRole(tab.id)} style={{
              padding: '7px 14px', borderRadius: 20,
              border: `1px solid ${filterRole === tab.id ? t.accent : t.border}`,
              background: filterRole === tab.id ? `${t.accent}15` : 'transparent',
              color: filterRole === tab.id ? t.accent : t.text3,
              fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Users Table */}
      <Card t={t} style={{ padding: 0, overflow: 'hidden', borderRadius: 20 }}>
        <Table 
          t={t}
          cols={['User Account', 'Contact Info', 'Role & Access', 'Location Assignment', 'Activity Status', 'Actions']}
          rows={filteredUsers.map(u => [
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: 12, 
                  overflow: 'hidden',
                  background: `${t[roleColors[u.role] || 'accent']}15`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 900,
                  color: t[roleColors[u.role] || 'accent']
                }}>
                  {u.avatar ? <ImgWithFallback src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: t.text }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: t.text4, fontWeight: 700 }}>Joined {u.joinDate || 'Jan 2024'}</div>
                </div>
              </div>,
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                 <div style={{ fontSize: 12, color: t.text2, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                   <Mail size={12} color={t.text4} /> {u.email}
                 </div>
                 <div style={{ fontSize: 12, color: t.text3, display: 'flex', alignItems: 'center', gap: 6 }}>
                   <Smartphone size={12} color={t.text4} /> {u.phone || '—'}
                 </div>
              </div>,
              <Badge t={t} text={(u.role || 'user').toUpperCase()} color={roleColors[u.role] || 'blue'} style={{ fontWeight: 900, fontSize: 10, letterSpacing: 0.8, padding: '4px 8px' }} />,
              u.role === 'manager' || u.role === 'admin' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {u.venue_id ? (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 700, color: t.text, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Building size={12} color={t.accent} /> {allVenues.find(v => v.id === u.venue_id)?.name || 'Unknown Venue'}
                      </div>
                      <div style={{ fontSize: 11, color: t.text3, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={10} /> {allVenues.find(v => v.id === u.venue_id)?.sites?.find(s => s.id === u.site_id)?.name || 'Unassigned Site'}
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: 11, color: t.text4, fontStyle: 'italic' }}>Global / Unassigned</span>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: 11, color: t.text4 }}>N/A</span>
              ),
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                 <div style={{ width: 6, height: 6, borderRadius: '50%', background: u.active ? t.green : t.red }} />
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: u.active ? t.text2 : t.text4 }}>{u.active ? 'Active' : 'Offline'}</span>
                    <span style={{ fontSize: 10, color: t.text4 }}>Last: {u.lastSeen || '2m ago'}</span>
                 </div>
              </div>,
            <div style={{ display: 'flex', gap: 8 }}>
              {u.role === 'manager' && (
                <Btn t={t} variant="ghost" style={{ padding: 6, color: t.purple }} onClick={() => handleAssign(u)}>
                  <MapPin size={16} />
                </Btn>
              )}
              <Btn t={t} variant="ghost" style={{ padding: 6, color: t.accent }}>
                <ShieldCheck size={16} />
              </Btn>
              <Btn t={t} variant="ghost" style={{ padding: 6, color: u.active ? t.red : t.green }} onClick={() => handleToggleActive(u)}>
                {u.active ? <Lock size={16} /> : <Unlock size={16} />}
              </Btn>
            </div>
          ])}
        />
        {filteredUsers.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: t.text4 }}>
             <Users size={40} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.5 }} />
             <div style={{ fontSize: 14 }}>No users found matching your search.</div>
          </div>
        )}
      </Card>

      {/* RBAC Quick Tip */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        padding: '16px 20px', 
        background: `${t.blue}10`, 
        border: `1px solid ${t.blue}20`,
        borderRadius: 16,
        color: t.blue 
      }}>
        <ShieldCheck size={20} />
        <div style={{ fontSize: 13 }}>
          <strong>Pro Tip:</strong> Use Role-Based Access Control to limit cashier permissions to POS only, while managers can access inventory and reports.
        </div>
      </div>

      {showInvite && (
        <Modal t={t} title="Design System Invite" subtitle="An invitation email with access keys will be sent to the user." onClose={() => setShowInvite(false)} width={460}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: t.text3, marginBottom: 8, textTransform: 'uppercase' }}>User Identity (Email)</label>
                <input 
                  type="email"
                  placeholder="e.g. j.doe@fanstore.com" 
                  value={inviteForm.email}
                  onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  style={{ 
                    width: '100%', padding: 12, borderRadius: 12, border: `1px solid ${t.border}`, 
                    background: t.bg, color: t.text, fontSize: 13, outline: 'none', fontWeight: 600
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: t.text3, marginBottom: 8, textTransform: 'uppercase' }}>Assigned Security Role</label>
                <Select t={t} label="" options={[
                  { label: 'Admin (Full Infrastructure)', value: 'admin' },
                  { label: 'Manager (Operations & Reports)', value: 'manager' },
                  { label: 'Cashier (POS & Sales Only)', value: 'cashier' },
                  { label: 'Staff (Stock & Logistics)', value: 'staff' },
                ]} value={inviteForm.role} onChange={val => setInviteForm(f => ({ ...f, role: val }))} />
              </div>

              {inviteForm.role === 'manager' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: t.text3, marginBottom: 8, textTransform: 'uppercase' }}>Initial Venue Assignment</label>
                    <Select 
                      t={t} 
                      options={[
                        { label: '— Global Access —', value: '' },
                        ...allVenues.map(v => ({ label: v.name, value: v.id }))
                      ]} 
                      value={inviteForm.venue_id} 
                      onChange={val => setInviteForm(f => ({ ...f, venue_id: val, site_id: '' }))}
                    />
                  </div>
                  {inviteForm.venue_id && (
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: t.text3, marginBottom: 8, textTransform: 'uppercase' }}>Initial Site Assignment</label>
                      <Select 
                        t={t} 
                        options={[
                          { label: '— All Sites —', value: '' },
                          ...(allVenues.find(v => v.id === inviteForm.venue_id)?.sites || []).map(s => ({ label: s.name, value: s.id }))
                        ]} 
                        value={inviteForm.site_id} 
                        onChange={val => setInviteForm(f => ({ ...f, site_id: val }))}
                      />
                    </div>
                  )}
                </>
              )}

              <div style={{ padding: 12, background: `${t.yellow}10`, borderRadius: 12, border: `1px dashed ${t.yellow}30`, fontSize: 12, color: t.text3 }}>
                🔒 This user will inherit all permissions associated with the selected role.
              </div>

              <Btn t={t} style={{ marginTop: 8, padding: 16, background: t.accent, color: '#fff', borderRadius: 12, fontWeight: 900, boxShadow: `0 8px 16px ${t.accent}20` }} onClick={handleInvite}>
                <Mail size={16} style={{ marginRight: 8 }} /> Send Digital Invite
              </Btn>
            </div>
        </Modal>
      )}

      {showAssign && (
        <Modal t={t} title="Assign Manager Boundary" subtitle={`Assign ${selectedUser?.name} to a specific operational venue and site.`} onClose={() => setShowAssign(false)} width={460}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: t.text3, marginBottom: 8, textTransform: 'uppercase' }}>Operational Venue</label>
                <Select 
                  t={t} 
                  options={[
                    { label: '— No Specific Venue —', value: '' },
                    ...allVenues.map(v => ({ label: v.name, value: v.id }))
                  ]} 
                  value={assignForm.venue_id} 
                  onChange={val => setAssignForm(f => ({ ...f, venue_id: val, site_id: '' }))}
                />
              </div>

              {assignForm.venue_id && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: t.text3, marginBottom: 8, textTransform: 'uppercase' }}>Assigned Site / Area</label>
                  <Select 
                    t={t} 
                    options={[
                      { label: '— All Sites —', value: '' },
                      ...(allVenues.find(v => v.id === assignForm.venue_id)?.sites || []).map(s => ({ label: s.name, value: s.id }))
                    ]} 
                    value={assignForm.site_id} 
                    onChange={val => setAssignForm(f => ({ ...f, site_id: val }))}
                  />
                </div>
              )}

              <div style={{ padding: 12, background: `${t.purple}10`, borderRadius: 12, border: `1px dashed ${t.purple}30`, fontSize: 12, color: t.text3 }}>
                📍 Assigning a venue restricts the manager's dashboard and reports to only show data from the selected location.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <Btn t={t} variant="secondary" onClick={() => setShowAssign(false)}>Cancel</Btn>
                <Btn t={t} variant="outline" style={{ color: t.red, borderColor: `${t.red}40` }} onClick={clearAssignment}>Clear</Btn>
                <Btn t={t} style={{ background: t.purple, color: '#fff' }} onClick={saveAssignment}>Confirm</Btn>
              </div>
            </div>
        </Modal>
      )}
    </div>
  )
}
