import { useState, useMemo, useRef } from 'react'
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
  Building,
  ScanFace,
  Camera,
  CheckCircle2,
  Trash2,
  CameraIcon
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
  
  // Face Recognition State
  const [showFaceScanner, setShowFaceScanner] = useState(false)
  const [scanningStatus, setScanningStatus] = useState('idle') // idle, scanning, success
  const [biometricForm, setBiometricForm] = useState({ name: '', age: '', phone: '', email: '' })
  
  // Image Upload Ref
  const avatarInputRef = useRef(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(null) // user id of being uploaded
  
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

  const handleStartScanner = (user) => {
    setSelectedUser(user)
    setBiometricForm({ name: user.name || '', age: user.age || '', phone: user.phone || '', email: user.email || '' })
    setScanningStatus('idle')
    setShowFaceScanner(true)
  }

  const handleScan = () => {
    setScanningStatus('scanning')
    setTimeout(() => {
      setScanningStatus('success')
      // Simulated DB update
      setUsers(us => us.map(u => u.id === selectedUser.id ? { ...u, faceIdActive: true, ...biometricForm } : u))
      notify('Biometric profile linked for ' + biometricForm.name, 'success')
      setTimeout(() => setShowFaceScanner(false), 2000)
    }, 3500)
  }

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
      setUsers(us => us.filter(u => u.id !== user.id))
      notify('User deleted permanently', 'info')
    }
  }

  const handleAvatarChange = (user) => {
    setSelectedUser(user)
    avatarInputRef.current?.click()
  }

  const onAvatarFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file || !selectedUser) return

    try {
      setUploadingAvatar(selectedUser.id)
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target.result
        
        // Simulating DB Update
        if (isSupabaseConfigured()) {
          await updateProfile(selectedUser.id, { avatar_url: base64 }) // Mocking it for now
        }
        
        setUsers(us => us.map(u => u.id === selectedUser.id ? { ...u, avatar: base64 } : u))
        notify(`Profile picture updated for ${selectedUser.name}`, 'success')
        setUploadingAvatar(null)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error(err)
      notify('Failed to update avatar', 'error')
      setUploadingAvatar(null)
    } finally {
      e.target.value = '' // Clear input
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
        avatar: finalData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
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
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>User RBAC</h1>
          <p style={{ fontSize: 16, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Manage system access, roles, and security permissions.</p>
        </div>
        <Btn t={t} onClick={() => setShowInvite(true)} style={{ 
          borderRadius: 14, 
          background: 'linear-gradient(135deg, #4f46e5, #4338ca)', 
          color: '#fff', 
          padding: '12px 28px', 
          fontWeight: 900,
          fontSize: 14,
          boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
          border: 'none'
        }}>
          <UserPlus size={20} style={{ marginRight: 8 }} /> Invite New User
        </Btn>
      </div>

      {/* Role Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        {[
            { label: 'Total Accounts', value: stats.total, color: '#4f46e5', icon: <Users size={24} /> },
            { label: 'Active Sessions', value: stats.active, color: '#22c55e', icon: <Activity size={24} /> },
            { label: 'Administrators', value: stats.admin, color: '#ef4444', icon: <Shield size={24} /> },
            { label: 'Managers', value: stats.manager, color: '#f59e0b', icon: <ShieldCheck size={24} /> },
        ].map(({ label, value, color, icon }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: color }} />
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginTop: 4, letterSpacing: '-0.02em' }}>{value}</div>
              </div>
            </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 320 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by name, email, or role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '14px 16px 14px 52px', 
              borderRadius: 16, 
              border: '1px solid #e2e8f0', 
              background: '#f8fafc', 
              color: '#0f172a',
              fontSize: 14,
              outline: 'none',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', background: '#f1f5f9', padding: 6, borderRadius: 16 }}>
          {[
            { id: 'all', label: 'All Roles' },
            { id: 'admin', label: 'Admins' },
            { id: 'manager', label: 'Managers' },
            { id: 'cashier', label: 'Cashiers' },
            { id: 'staff', label: 'Staff' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setFilterRole(tab.id)} style={{
              padding: '10px 20px', borderRadius: 12,
              border: 'none',
              background: filterRole === tab.id ? '#fff' : 'transparent',
              color: filterRole === tab.id ? '#4f46e5' : '#64748b',
              boxShadow: filterRole === tab.id ? '0 4px 10px rgba(0,0,0,0.08)' : 'none',
              fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <Table 
          t={t}
          cols={['User Account', 'Contact Info', 'Role & Access', 'Biometrics', 'Location Assignment', 'Activity Status', 'Actions']}
          rows={filteredUsers.map(u => [
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div 
                  className="avatar-container"
                  onClick={() => handleAvatarChange(u)}
                  style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 14, 
                    overflow: 'hidden',
                    background: '#f8fafc', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#4f46e5',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {/* Hover Overlay */}
                  <div className="avatar-overlay" style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(79, 70, 229, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    zIndex: 2
                  }}>
                    <CameraIcon size={18} />
                  </div>
                  
                  <ImgWithFallback 
                    src={ (u.avatar?.length > 4 || (u.avatar?.startsWith('http') || u.avatar?.startsWith('file:') || u.avatar?.startsWith('data:'))) ? u.avatar : null} 
                    alt={u.name} 
                    emoji={u.avatar?.length <= 2 ? u.avatar : (u.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  
                  {uploadingAvatar === u.id && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="spinner-mini" style={{ width: 20, height: 20, border: '2px solid #4f46e5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>Joined {u.joinDate || 'Jan 2024'}</div>
                </div>
              </div>,
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                 <div style={{ fontSize: 13, color: '#445569', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                   <Mail size={14} color="#94a3b8" /> {u.email}
                 </div>
                 <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                   <Smartphone size={14} color="#94a3b8" /> {u.phone || '—'}
                 </div>
              </div>,
              <Badge t={t} text={(u.role || 'user').toUpperCase()} color={roleColors[u.role] || 'blue'} style={{ fontWeight: 900, fontSize: 11, borderRadius: 8, padding: '4px 10px' }} />,
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: u.faceIdActive ? '#22c55e' : '#e2e8f0', boxShadow: u.faceIdActive ? '0 0 10px rgba(34, 197, 94, 0.4)' : 'none' }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: u.faceIdActive ? '#0f172a' : '#94a3b8' }}>{u.faceIdActive ? 'ACTIVE' : 'PENDING'}</span>
              </div>,
              u.role === 'manager' || u.role === 'admin' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {u.venue_id ? (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building size={14} color="#4f46e5" /> {allVenues.find(v => v.id === u.venue_id)?.name || 'Unknown Venue'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                        <MapPin size={12} color="#94a3b8" /> {allVenues.find(v => v.id === u.venue_id)?.sites?.find(s => s.id === u.site_id)?.name || 'Unassigned Site'}
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', fontWeight: 600 }}>Global Account</span>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600 }}>N/A</span>
              ),
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: u.active ? '#22c55e' : '#ef4444' }} />
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{u.active ? 'Active' : 'Offline'}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Last: {u.lastSeen || '2m ago'}</span>
                 </div>
              </div>,
            <div style={{ display: 'flex', gap: 8 }}>
              {u.role === 'manager' && (
                <Btn t={t} variant="ghost" style={{ width: 36, height: 36, padding: 0, color: '#8b5cf6', background: '#f5f3ff', borderRadius: 8 }} onClick={() => handleAssign(u)}>
                  <MapPin size={16} />
                </Btn>
              )}
              <Btn t={t} variant="ghost" style={{ width: 36, height: 36, padding: 0, color: '#4f46e5', background: '#eef2ff', borderRadius: 8 }} onClick={() => handleStartScanner(u)}>
                <ScanFace size={16} />
              </Btn>
              <Btn t={t} variant="ghost" style={{ width: 36, height: 36, padding: 0, color: u.active ? '#ef4444' : '#22c55e', background: u.active ? '#fef2f2' : '#f0fdf4', borderRadius: 8 }} onClick={() => handleToggleActive(u)}>
                {u.active ? <Lock size={16} /> : <Unlock size={16} />}
              </Btn>
              <Btn t={t} variant="ghost" style={{ width: 36, height: 36, padding: 0, color: '#ef4444', background: '#fef2f2', borderRadius: 8 }} onClick={() => handleDeleteUser(u)}>
                <Trash2 size={16} />
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
      </div>

      {/* RBAC Quick Tip */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 16, 
        padding: '24px 32px', 
        background: '#eef2ff', 
        border: '1px solid #e0e7ff',
        borderRadius: 24,
        color: '#4f46e5',
        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.05)'
      }}>
        <ShieldCheck size={24} />
        <div style={{ fontSize: 14, fontWeight: 600, color: '#4338ca' }}>
          <strong style={{ fontWeight: 900 }}>Pro Tip:</strong> Use Role-Based Access Control to limit cashier permissions to POS only, while managers can access inventory and reports.
        </div>
      </div>

      {showInvite && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 9999, 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24
        }} onClick={() => setShowInvite(false)}>
          <div style={{ 
            maxWidth: 480, 
            width: '100%', 
            borderRadius: 40, 
            padding: 48, 
            background: '#fff',
            boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
            position: 'relative',
            animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>Invite New User</h2>
              <p style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Grant infrastructure access to a new team member.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>User Identity (Email)</label>
                <input 
                  type="email"
                  placeholder="e.g. j.doe@fanstore.com" 
                  value={inviteForm.email}
                  onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  style={{ 
                    width: '100%', padding: '14px 18px', borderRadius: 16, border: '1px solid #e2e8f0', 
                    background: '#f8fafc', color: '#0f172a', fontSize: 14, outline: 'none', fontWeight: 700
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Assigned Security Role</label>
                <Select t={t} label="" options={[
                  { label: 'Admin (Full Infrastructure)', value: 'admin' },
                  { label: 'Manager (Operations & Reports)', value: 'manager' },
                  { label: 'Cashier (POS & Sales Only)', value: 'cashier' },
                  { label: 'Staff (Stock & Logistics)', value: 'staff' },
                ]} value={inviteForm.role} onChange={val => setInviteForm(f => ({ ...f, role: val }))} />
              </div>

              {inviteForm.role === 'manager' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Initial Venue Assignment</label>
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
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Initial Site Assignment</label>
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
                </div>
              )}

              <div style={{ padding: 16, background: '#fff9eb', borderRadius: 16, border: '1px dashed #fcd34d', fontSize: 13, color: '#92400e', fontWeight: 600, lineHeight: 1.5 }}>
                🔒 This user will inherit all permissions associated with the selected role.
              </div>

              <Btn t={t} style={{ 
                marginTop: 8, 
                padding: 18, 
                background: 'linear-gradient(135deg, #4f46e5, #4338ca)', 
                color: '#fff', 
                borderRadius: 18, 
                fontWeight: 900,
                fontSize: 15,
                boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
                border: 'none'
              }} onClick={handleInvite}>
                <Mail size={18} style={{ marginRight: 10 }} /> Send Digital Invite
              </Btn>
            </div>
          </div>
        </div>
      )}

      {showAssign && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 9999, 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24
        }} onClick={() => setShowAssign(false)}>
          <div style={{ 
            maxWidth: 480, 
            width: '100%', 
            borderRadius: 40, 
            padding: 48, 
            background: '#fff',
            boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
            position: 'relative',
            animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>Assign Boundary</h2>
              <p style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Assign {selectedUser?.name} to an operational site.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Operational Venue</label>
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
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Assigned Site / Area</label>
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

              <div style={{ padding: 16, background: '#f5f3ff', borderRadius: 16, border: '1px dashed #c084fc', fontSize: 13, color: '#6b21a8', fontWeight: 600, lineHeight: 1.5 }}>
                📍 resticts the manager's dashboard and reports to only show data from the selected location.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <Btn t={t} variant="outline" style={{ padding: 18, borderRadius: 18, fontWeight: 800, color: '#ef4444', borderColor: '#fecaca' }} onClick={clearAssignment}>Clear Boundary</Btn>
                <Btn t={t} style={{ 
                  padding: 18, 
                  background: '#7c3aed', 
                  color: '#fff', 
                  borderRadius: 18, 
                  fontWeight: 900, 
                  fontSize: 15,
                  boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)',
                  border: 'none'
                }} onClick={saveAssignment}>Confirm Assignment</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFaceScanner && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 9999, 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24
        }} onClick={() => setShowFaceScanner(false)}>
          <div style={{ 
            maxWidth: 550, 
            width: '100%', 
            borderRadius: 40, 
            padding: 48, 
            background: '#fff',
            boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
            position: 'relative',
            animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>Biometric Enrollment</h2>
              <p style={{ fontSize: 16, color: '#64748b', fontWeight: 600 }}>Enroll {selectedUser?.name} into focus face recognition</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Scanner Visual */}
              <div style={{ 
                height: 280, 
                background: '#000', 
                borderRadius: 24, 
                position: 'relative', 
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                border: `2px solid ${scanningStatus === 'success' ? '#22c55e' : '#4f46e5'}40`
              }}>
                {/* Camera Placeholder */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
                  <ImgWithFallback src={selectedUser.avatar} alt="Scanner" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%) brightness(0.6)' }} />
                </div>

                {/* Futuristic Biometric Overlay */}
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  opacity: scanningStatus === 'scanning' ? 0.8 : 0.2, 
                  transition: 'opacity 1s ease',
                  pointerEvents: 'none'
                }}>
                  <img 
                    src="file:///C:/Users/User/.gemini/antigravity/brain/c0ff7d9b-185d-45b9-afef-310c26deefc2/futuristic_face_scan_overlay_1775364685069.png" 
                    alt="Biometric Grid" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>

                {/* Scanning Frame */}
                <div style={{ 
                  width: 180, 
                  height: 180, 
                  borderRadius: '50%', 
                  border: `3px dashed ${scanningStatus === 'success' ? '#22c55e' : '#4f46e5'}`,
                  position: 'relative',
                  animation: scanningStatus === 'scanning' ? 'pulse 1.5s infinite ease-in-out' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {scanningStatus === 'scanning' && (
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, left: 0, right: 0, 
                      height: 3, 
                      background: '#4f46e5', 
                      boxShadow: '0 0 20px #4f46e5',
                      animation: 'scanLine 2s infinite linear' 
                    }} />
                  )}
                  <div style={{ textAlign: 'center' }}>
                     {scanningStatus === 'idle' && <Camera size={48} color="#4f46e5" style={{ opacity: 0.8 }} />}
                     {scanningStatus === 'scanning' && <ScanFace size={72} color="#4f46e5" />}
                     {scanningStatus === 'success' && <CheckCircle2 size={72} color="#22c55e" style={{ animation: 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />}
                  </div>
                </div>

                {/* Status Overlay */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: 20, 
                  padding: '8px 24px', 
                  borderRadius: 30, 
                  background: 'rgba(15, 23, 42, 0.8)', 
                  backdropFilter: 'blur(8px)',
                  color: '#fff', 
                  fontSize: 12, 
                  fontWeight: 900,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase'
                }}>
                  {scanningStatus === 'idle' && 'READY TO SCAN'}
                  {scanningStatus === 'scanning' && 'ANALYZING GEOMETRY...'}
                  {scanningStatus === 'success' && 'ENROLLED SUCCESSFULLY'}
                </div>
              </div>

              {/* Profile Data Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                   <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>Full Name</label>
                      <input 
                        type="text" 
                        value={biometricForm.name} 
                        onChange={e => setBiometricForm(f => ({ ...f, name: e.target.value }))}
                        disabled={scanningStatus !== 'idle'}
                        style={{ width: '100%', padding: '14px 18px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none' }}
                      />
                   </div>
                   <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>Age</label>
                      <input 
                        type="number" 
                        value={biometricForm.age} 
                        placeholder="25"
                        onChange={e => setBiometricForm(f => ({ ...f, age: e.target.value }))}
                        disabled={scanningStatus !== 'idle'}
                        style={{ width: '100%', padding: '14px 18px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none' }}
                      />
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                   <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>Phone Number</label>
                      <input 
                        type="text" 
                        value={biometricForm.phone} 
                        onChange={e => setBiometricForm(f => ({ ...f, phone: e.target.value }))}
                        disabled={scanningStatus !== 'idle'}
                        style={{ width: '100%', padding: '14px 18px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none' }}
                      />
                   </div>
                   <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>Recovery Email</label>
                      <input 
                        type="email" 
                        value={biometricForm.email} 
                        onChange={e => setBiometricForm(f => ({ ...f, email: e.target.value }))}
                        disabled={scanningStatus !== 'idle'}
                        style={{ width: '100%', padding: '14px 18px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none' }}
                      />
                   </div>
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                {scanningStatus === 'idle' ? (
                  <Btn t={t} style={{ 
                    width: '100%', 
                    padding: 20, 
                    background: 'linear-gradient(135deg, #4f46e5, #4338ca)', 
                    color: '#fff', 
                    borderRadius: 20, 
                    fontWeight: 900,
                    fontSize: 16,
                    boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
                    border: 'none'
                  }} onClick={handleScan}>
                    <ScanFace size={22} style={{ marginRight: 10 }} /> Start Biometric Enrollment
                  </Btn>
                ) : scanningStatus === 'scanning' ? (
                  <div style={{ width: '100%', height: 60, background: '#f1f5f9', borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: '#4f46e5', letterSpacing: 1.5 }}>
                      INITIALIZING SCAN...
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    width: '100%', 
                    padding: 20, 
                    background: '#f0fdf4', 
                    color: '#22c55e', 
                    borderRadius: 20, 
                    fontWeight: 900, 
                    fontSize: 16,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 10,
                    border: '2px solid #bbf7d0'
                  }}>
                    <CheckCircle2 size={24} /> PROFILE SECURED
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Hidden input for avatar upload */}
      <input 
        type="file" 
        ref={avatarInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={onAvatarFileSelect}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .avatar-container:hover .avatar-overlay {
          opacity: 1 !important;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  )
}
