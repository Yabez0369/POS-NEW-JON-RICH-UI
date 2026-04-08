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
  const [filterSite, setFilterSite] = useState('all')
  const [showInvite, setShowInvite] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [assignForm, setAssignForm] = useState({ venue_id: '', site_id: '' })
  const [detailUser, setDetailUser] = useState(null)
  
  // Face Recognition State
  const [showFaceScanner, setShowFaceScanner] = useState(false)
  const [scanningStatus, setScanningStatus] = useState('idle') // idle, scanning, success
  const [biometricForm, setBiometricForm] = useState({ name: '', age: '', phone: '', email: '' })
  
  // Image Upload Ref
  const avatarInputRef = useRef(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(null) // user id of being uploaded
  
  // Use local state if venues is missing
  const allVenues = venues || []

  // Flatten all sites for the filter dropdown
  const allSitesList = useMemo(() => {
    return allVenues.flatMap(v =>
      (v.sites || []).map(s => ({ ...s, venueName: v.name, venueId: v.id }))
    )
  }, [allVenues])

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchRole = filterRole === 'all' || u.role === filterRole
      const matchSite = filterSite === 'all' || u.site_id === filterSite
      return matchSearch && matchRole && matchSite
    })
  }, [users, searchTerm, filterRole, filterSite])

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

  const [inviteForm, setInviteForm] = useState({ name: '', email: '', phone: '', password: '', role: 'cashier', venue_id: '', site_id: '' })

  const handleInvite = async () => {
    try {
      if (!inviteForm.name.trim()) { notify('Full name is required', 'error'); return }
      if (!inviteForm.email.includes('@')) { notify('Enter a valid email address', 'error'); return }
      if (!inviteForm.password || inviteForm.password.length < 6) { notify('Password must be at least 6 characters', 'error'); return }
      
      const payload = {
        name: inviteForm.name.trim(),
        email: inviteForm.email,
        password: inviteForm.password,
        role: inviteForm.role,
        venueId: inviteForm.venue_id,
        siteId: inviteForm.site_id,
        phone: inviteForm.phone || null
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
        avatar: payload.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      }
      
      setUsers(us => [...us, newUser])
      notify(`${payload.name} added successfully!`, 'success');
      setShowInvite(false);
      setInviteForm({ name: '', email: '', phone: '', password: '', role: 'cashier', venue_id: '', site_id: '' })
    } catch (err) {
      console.error(err)
      notify('Failed to add user', 'error')
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: 16,
        position: 'sticky',
        top: -32,
        zIndex: 50,
        background: '#f8fafc',
        padding: '16px 0',
        margin: '-16px 0 0 0'
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Users size={24} color="#4f46e5" strokeWidth={2.5} /> User Management
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Btn t={t} onClick={() => setShowInvite(true)} style={{ 
            borderRadius: 14, 
            background: 'linear-gradient(135deg, #4f46e5, #4338ca)', 
            color: '#fff', 
            padding: '8px 20px', 
            fontWeight: 900,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
            border: 'none'
          }}>
            <UserPlus size={18} /> Add User
          </Btn>
        </div>
      </div>


      {/* Search and Filters */}
      <div style={{ background: '#fff', borderRadius: 24, padding: '20px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '11px 14px 11px 42px', 
              borderRadius: 14, 
              border: '1.5px solid #e2e8f0', 
              background: '#f8fafc', 
              color: '#0f172a',
              fontSize: 13,
              outline: 'none',
              fontWeight: 700,
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={e => e.target.style.borderColor = '#4f46e5'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Role Dropdown */}
        <div style={{ position: 'relative' }}>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            style={{
              padding: '11px 40px 11px 14px',
              borderRadius: 14,
              border: `1.5px solid ${filterRole !== 'all' ? '#4f46e5' : '#e2e8f0'}`,
              background: filterRole !== 'all' ? '#eef2ff' : '#f8fafc',
              color: filterRole !== 'all' ? '#4f46e5' : '#0f172a',
              fontSize: 13,
              fontWeight: 800,
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              minWidth: 140
            }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="manager">Managers</option>
            <option value="cashier">Cashiers</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {/* Site Dropdown */}
        <div style={{ position: 'relative' }}>
          <select
            value={filterSite}
            onChange={e => setFilterSite(e.target.value)}
            style={{
              padding: '11px 40px 11px 14px',
              borderRadius: 14,
              border: `1.5px solid ${filterSite !== 'all' ? '#22c55e' : '#e2e8f0'}`,
              background: filterSite !== 'all' ? '#f0fdf4' : '#f8fafc',
              color: filterSite !== 'all' ? '#16a34a' : '#0f172a',
              fontSize: 13,
              fontWeight: 800,
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              minWidth: 160
            }}
          >
            <option value="all">All Sites</option>
            {allVenues.map(v =>
              (v.sites || []).map(s => (
                <option key={s.id} value={s.id}>{s.name} — {v.name}</option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Directory Listing Count */}
      <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: -16 }}>
        Directory Listing ({filteredUsers.length})
      </div>

      {/* User Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredUsers.length === 0 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 60, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <Users size={40} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.3, color: '#94a3b8' }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#64748b' }}>No users found</div>
          </div>
        )}
        {filteredUsers.map((u, idx) => {
          const initials = u.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'
          const roleColor = { admin: '#ef4444', manager: '#f59e0b', cashier: '#22c55e', staff: '#3b82f6', customer: '#8b5cf6' }[u.role] || '#64748b'
          const avatarSrc = (u.avatar?.length > 4 && (u.avatar?.startsWith('http') || u.avatar?.startsWith('data:'))) ? u.avatar : null
          return (
            <div
              key={u.id}
              onClick={() => setDetailUser(u)}
              style={{
                background: u.active ? '#fff' : '#f8fafc',
                borderRadius: 20,
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                border: '1px solid',
                borderColor: u.active ? '#f1f5f9' : '#e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: u.active ? 1 : 0.7,
                animation: `slideInUp 0.3s ease-out ${idx * 0.04}s both`
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(79,70,229,0.12)'; e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = u.active ? '#f1f5f9' : '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, overflow: 'hidden',
                  background: `${roleColor}15`, border: `2px solid ${roleColor}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 900, color: roleColor
                }}>
                  {avatarSrc
                    ? <img src={avatarSrc} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initials
                  }
                </div>
                {/* Online dot */}
                <div style={{
                  position: 'absolute', bottom: 2, right: 2,
                  width: 12, height: 12, borderRadius: '50%',
                  background: u.active ? '#22c55e' : '#cbd5e1',
                  border: '2px solid #fff',
                  boxShadow: u.active ? '0 0 6px rgba(34,197,94,0.5)' : 'none'
                }} />
              </div>

              {/* Name & Email */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
              </div>

              {/* Role badge + Site + Status */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{
                    padding: '3px 8px', borderRadius: 6,
                    background: `${roleColor}15`, color: roleColor,
                    fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5
                  }}>
                    {u.role || 'user'}
                  </div>
                </div>
                {(() => {
                  const site = allSitesList.find(s => s.id === u.site_id)
                  return site ? (
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={10} color="#94a3b8" /> {site.name}
                    </div>
                  ) : null
                })()}
                <div style={{ fontSize: 10, fontWeight: 700, color: u.active ? '#22c55e' : '#94a3b8' }}>
                  {u.active ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Chevron */}
              <div style={{ color: '#cbd5e1', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          )
        })}
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

      {/* ============ USER DETAIL POPUP ============ */}
      {detailUser && (() => {
        const u = detailUser
        const roleColor = { admin: '#ef4444', manager: '#f59e0b', cashier: '#22c55e', staff: '#3b82f6', customer: '#8b5cf6' }[u.role] || '#64748b'
        const initials = u.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'
        const avatarSrc = (u.avatar?.length > 4 && (u.avatar?.startsWith('http') || u.avatar?.startsWith('data:'))) ? u.avatar : null
        const venueName = allVenues.find(v => v.id === u.venue_id)?.name
        const siteName = allVenues.find(v => v.id === u.venue_id)?.sites?.find(s => s.id === u.site_id)?.name
        return (
          <div
            onClick={() => setDetailUser(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 460,
                background: '#fff',
                borderRadius: 32,
                overflow: 'hidden',
                boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
                animation: 'modalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Hero Banner */}
              <div style={{
                height: 100,
                background: `linear-gradient(135deg, ${roleColor}cc, ${roleColor}55)`,
                position: 'relative'
              }}>
                {/* Close */}
                <button
                  onClick={() => setDetailUser(null)}
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    width: 36, height: 36, borderRadius: '50%',
                    border: 'none', background: 'rgba(255,255,255,0.25)',
                    color: '#fff', cursor: 'pointer', fontSize: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                  }}>
                  ✕
                </button>
                {/* Avatar (overlapping) */}
                <div
                  onClick={() => { setSelectedUser(u); avatarInputRef.current?.click() }}
                  style={{
                    position: 'absolute', bottom: -28, left: 28,
                    width: 72, height: 72, borderRadius: 22, overflow: 'hidden',
                    background: `${roleColor}22`, border: `3px solid #fff`,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, fontWeight: 900, color: roleColor, cursor: 'pointer'
                  }}>
                  {avatarSrc
                    ? <img src={avatarSrc} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initials
                  }
                  {/* Camera hover overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', opacity: 0, transition: 'opacity 0.2s',
                    borderRadius: 20
                  }} className="avatar-overlay">
                    <CameraIcon size={20} />
                  </div>
                </div>
                {/* Online dot on hero avatar */}
                <div style={{
                  position: 'absolute', bottom: -20, left: 84,
                  width: 14, height: 14, borderRadius: '50%',
                  background: u.active ? '#22c55e' : '#94a3b8',
                  border: '3px solid #fff',
                  boxShadow: u.active ? '0 0 8px rgba(34,197,94,0.6)' : 'none'
                }} />
              </div>

              {/* Identity section */}
              <div style={{ padding: '44px 28px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>{u.name}</h2>
                    <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>Joined {u.joinDate || 'Jan 2024'}</div>
                  </div>
                  <div style={{
                    padding: '6px 14px', borderRadius: 10,
                    background: `${roleColor}12`, color: roleColor,
                    fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.8
                  }}>
                    {u.role || 'user'}
                  </div>
                </div>

                {/* Detail rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 20, borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                  {[
                    { icon: <Mail size={15} color="#94a3b8" />, label: 'Email', value: u.email },
                    { icon: <Smartphone size={15} color="#94a3b8" />, label: 'Phone', value: u.phone || '—' },
                    { icon: <Activity size={15} color={u.active ? '#22c55e' : '#94a3b8'} />, label: 'Status', value: u.active ? 'Active' : 'Inactive', valueColor: u.active ? '#22c55e' : '#94a3b8' },
                    { icon: <ScanFace size={15} color="#94a3b8" />, label: 'Face ID', value: u.faceIdActive ? 'Enrolled' : 'Not enrolled', valueColor: u.faceIdActive ? '#22c55e' : '#94a3b8' },
                    venueName ? { icon: <Building size={15} color="#94a3b8" />, label: 'Venue', value: venueName } : null,
                    siteName ? { icon: <MapPin size={15} color="#94a3b8" />, label: 'Site', value: siteName } : null,
                  ].filter(Boolean).map((row, i, arr) => (
                    <div key={row.label} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '13px 16px',
                      background: i % 2 === 0 ? '#fff' : '#fafbfe',
                      borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}>
                      {row.icon}
                      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, minWidth: 60 }}>{row.label}</span>
                      <span style={{ fontSize: 13, color: row.valueColor || '#0f172a', fontWeight: 700, flex: 1, textAlign: 'right' }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
                  <button
                    onClick={() => { handleToggleActive(u); setDetailUser(prev => ({ ...prev, active: !prev.active })) }}
                    style={{
                      padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                      background: u.active ? '#fef2f2' : '#f0fdf4',
                      color: u.active ? '#ef4444' : '#22c55e',
                      fontSize: 13, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s'
                    }}
                  >
                    {u.active ? <><Lock size={15} /> Deactivate</> : <><Unlock size={15} /> Activate</>}
                  </button>

                  <button
                    onClick={() => { setSelectedUser(u); setBiometricForm({ name: u.name || '', age: u.age || '', phone: u.phone || '', email: u.email || '' }); setScanningStatus('idle'); setShowFaceScanner(true); setDetailUser(null) }}
                    style={{
                      padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                      background: '#eef2ff', color: '#4f46e5',
                      fontSize: 13, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s'
                    }}
                  >
                    <ScanFace size={15} /> Face ID
                  </button>

                  {(u.role === 'manager' || u.role === 'admin') && (
                    <button
                      onClick={() => { handleAssign(u); setDetailUser(null) }}
                      style={{
                        padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                        background: '#f5f3ff', color: '#7c3aed',
                        fontSize: 13, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'all 0.2s'
                      }}
                    >
                      <MapPin size={15} /> Assign Location
                    </button>
                  )}

                  <button
                    onClick={() => { handleDeleteUser(u); setDetailUser(null) }}
                    style={{
                      padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                      background: '#fef2f2', color: '#ef4444',
                      fontSize: 13, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s',
                      gridColumn: (u.role === 'manager' || u.role === 'admin') ? 'auto' : 'span 2'
                    }}
                  >
                    <Trash2 size={15} /> Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {showInvite && (
        <div
          onClick={() => setShowInvite(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 500,
              background: '#fff',
              borderRadius: 32,
              overflow: 'hidden',
              boxShadow: '0 40px 100px rgba(0,0,0,0.22)',
              animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
              padding: '28px 32px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={22} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Add New User</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: 2 }}>Fill in the details to create an account</div>
                </div>
              </div>
              <button
                onClick={() => setShowInvite(false)}
                style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>

            {/* Form Body */}
            <div style={{ padding: '28px 32px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Name + Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={inviteForm.name}
                    onChange={e => setInviteForm(f => ({ ...f, name: e.target.value }))}
                    autoFocus
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#4f46e5'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +44 7700 900123"
                    value={inviteForm.phone}
                    onChange={e => setInviteForm(f => ({ ...f, phone: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#4f46e5'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    placeholder="e.g. john@company.com"
                    value={inviteForm.email}
                    onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 14, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#4f46e5'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={inviteForm.password}
                    onChange={e => setInviteForm(f => ({ ...f, password: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 14, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#4f46e5'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { value: 'admin', label: 'Admin', color: '#ef4444', emoji: '👑' },
                    { value: 'manager', label: 'Manager', color: '#f59e0b', emoji: '🏆' },
                    { value: 'cashier', label: 'Cashier', color: '#22c55e', emoji: '💳' },
                    { value: 'staff', label: 'Staff', color: '#3b82f6', emoji: '📦' },
                  ].map(r => (
                    <button
                      key={r.value}
                      onClick={() => setInviteForm(f => ({ ...f, role: r.value }))}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 14,
                        border: `2px solid ${inviteForm.role === r.value ? r.color : '#e2e8f0'}`,
                        background: inviteForm.role === r.value ? `${r.color}12` : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.18s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{r.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: inviteForm.role === r.value ? r.color : '#94a3b8' }}>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Outlet Assignment — for cashier & staff */}
              {(inviteForm.role === 'cashier' || inviteForm.role === 'staff') && (() => {
                // Flatten all sites across all venues
                const allSites = allVenues.flatMap(v =>
                  (v.sites || []).map(s => ({ ...s, venueName: v.name, venueId: v.id }))
                )
                return (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #bbf7d0',
                    borderRadius: 16,
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    animation: 'fadeIn 0.25s ease'
                  }}>
                    {allSites.length === 0 ? (
                      <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, fontStyle: 'italic' }}>
                        No outlets configured yet. Add outlets in Outlet Management.
                      </div>
                    ) : (
                      <select
                        value={inviteForm.site_id || ''}
                        onChange={e => {
                          const selected = allSites.find(s => s.id === e.target.value)
                          setInviteForm(f => ({
                            ...f,
                            site_id: e.target.value,
                            venue_id: selected?.venueId || ''
                          }))
                        }}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 12,
                          border: `1.5px solid ${inviteForm.site_id ? '#22c55e' : '#e2e8f0'}`,
                          background: '#fff',
                          color: '#0f172a',
                          fontSize: 14,
                          fontWeight: 700,
                          outline: 'none',
                          cursor: 'pointer',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 14px center',
                          paddingRight: 40
                        }}
                      >
                        <option value="">— Select outlet (optional) —</option>
                        {allVenues.map(v => (
                          (v.sites || []).length > 0 && (
                            <optgroup key={v.id} label={v.name}>
                              {(v.sites || []).map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </optgroup>
                          )
                        ))}
                      </select>
                    )}
                    {inviteForm.site_id && (() => {
                      const picked = allSites.find(s => s.id === inviteForm.site_id)
                      return picked ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#16a34a', fontWeight: 700 }}>
                          <MapPin size={13} /> Assigned to: <strong>{picked.name}</strong> · {picked.venueName}
                        </div>
                      ) : null
                    })()}
                  </div>
                )
              })()}

              <button
                onClick={handleInvite}
                disabled={!inviteForm.name || !inviteForm.email || !inviteForm.password}
                style={{
                  marginTop: 4,
                  padding: '15px 24px',
                  borderRadius: 16,
                  border: 'none',
                  cursor: (!inviteForm.name || !inviteForm.email || !inviteForm.password) ? 'not-allowed' : 'pointer',
                  background: (!inviteForm.name || !inviteForm.email || !inviteForm.password)
                    ? '#e2e8f0'
                    : 'linear-gradient(135deg, #4f46e5, #4338ca)',
                  color: (!inviteForm.name || !inviteForm.email || !inviteForm.password) ? '#94a3b8' : '#fff',
                  fontSize: 15,
                  fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: (!inviteForm.name || !inviteForm.email || !inviteForm.password) ? 'none' : '0 10px 25px rgba(79,70,229,0.3)',
                  transition: 'all 0.2s'
                }}
              >
                <UserPlus size={18} /> Add User
              </button>
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
