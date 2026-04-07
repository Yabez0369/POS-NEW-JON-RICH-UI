import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Btn, Input, Badge, Card, Modal, Table } from '@/components/ui'
import { notify } from '@/components/shared'
import { genId, ts } from '@/lib/utils'
import { syncVenues, syncSites } from '@/services/optimo'

const INITIAL_VENUES = [
  { id: 'VEN-001', name: 'Central Arena', address: '123 High Street, London EC1A 1BB', type: 'Arena', sites: [
    { id: 'SITE-001', name: 'Main Hall', capacity: 5000, status: 'active' },
    { id: 'SITE-002', name: 'VIP Lounge', capacity: 200, status: 'active' },
  ]},
  { id: 'VEN-002', name: 'Riverside Theatre', address: '45 River Walk, Manchester M1 2AB', type: 'Theatre', sites: [
    { id: 'SITE-003', name: 'Stage 1', capacity: 800, status: 'active' },
  ]},
]

export const VenueSiteManagement = ({ t: tProp }) => {
  const { t: tCtx } = useTheme()
  const { currentUser } = useAuth()
  const t = tProp || tCtx

  const [venues, setVenues] = useState(INITIAL_VENUES)
  const [showVenueForm, setShowVenueForm] = useState(false)
  const [editVenue, setEditVenue] = useState(null)
  const [venueForm, setVenueForm] = useState({ name: '', address: '', type: 'Venue' })
  const [showSiteForm, setShowSiteForm] = useState(null)
  const [editSite, setEditSite] = useState(null)
  const [siteForm, setSiteForm] = useState({ name: '', capacity: '', status: 'active' })
  const [expandedVenue, setExpandedVenue] = useState(null)
  const [syncStatus, setSyncStatus] = useState({})
  const [optimoSyncing, setOptimoSyncing] = useState(false)
  const [lastOptimoSync, setLastOptimoSync] = useState(null)

  const openVenueAdd = () => {
    setVenueForm({ name: '', address: '', type: 'Venue' })
    setEditVenue(null)
    setShowVenueForm(true)
  }

  const openVenueEdit = (venue) => {
    setVenueForm({ name: venue.name, address: venue.address, type: venue.type })
    setEditVenue(venue)
    setShowVenueForm(true)
  }

  const saveVenue = () => {
    if (!venueForm.name.trim()) { notify('Venue name is required', 'error'); return }
    if (!venueForm.address.trim()) { notify('Address is required', 'error'); return }
    if (editVenue) {
      setVenues(vs => vs.map(v => v.id === editVenue.id ? { ...v, name: venueForm.name, address: venueForm.address, type: venueForm.type } : v))
      notify('Venue updated', 'success')
    } else {
      const nv = { id: genId('VEN'), name: venueForm.name, address: venueForm.address, type: venueForm.type, sites: [] }
      setVenues(vs => [...vs, nv])
      notify('Venue added: ' + nv.name, 'success')
    }
    setShowVenueForm(false)
  }

  const deleteVenue = (venueId) => {
    setVenues(vs => vs.filter(v => v.id !== venueId))
    notify('Venue deleted', 'success')
  }

  const openSiteAdd = (venueId) => {
    setSiteForm({ name: '', capacity: '', status: 'active' })
    setEditSite(null)
    setShowSiteForm(venueId)
  }

  const openSiteEdit = (venueId, site) => {
    setSiteForm({ name: site.name, capacity: site.capacity.toString(), status: site.status })
    setEditSite(site)
    setShowSiteForm(venueId)
  }

  const saveSite = () => {
    if (!siteForm.name.trim()) { notify('Site name is required', 'error'); return }
    const cap = parseInt(siteForm.capacity) || 0
    if (editSite) {
      setVenues(vs => vs.map(v => v.id === showSiteForm ? { ...v, sites: v.sites.map(s => s.id === editSite.id ? { ...s, name: siteForm.name, capacity: cap, status: siteForm.status } : s) } : v))
      notify('Site updated', 'success')
    } else {
      const ns = { id: genId('SITE'), name: siteForm.name, capacity: cap, status: siteForm.status }
      setVenues(vs => vs.map(v => v.id === showSiteForm ? { ...v, sites: [...v.sites, ns] } : v))
      notify('Site added: ' + ns.name, 'success')
    }
    setShowSiteForm(null)
  }

  const deleteSite = (venueId, siteId) => {
    setVenues(vs => vs.map(v => v.id === venueId ? { ...v, sites: v.sites.filter(s => s.id !== siteId) } : v))
    notify('Site deleted', 'success')
  }

  const syncVenue = (venueId) => {
    setSyncStatus(prev => ({ ...prev, [venueId]: 'syncing' }))
    setTimeout(() => {
      setSyncStatus(prev => ({ ...prev, [venueId]: 'error' }))
      notify('Optimo integration not yet configured', 'warning')
    }, 1500)
  }

  const handleOptimoSyncNow = async () => {
    setOptimoSyncing(true)
    try {
      const [venuesRes, sitesRes] = await Promise.all([syncVenues(), syncSites()])
      if (venuesRes.synced > 0 || sitesRes.synced > 0) {
        setLastOptimoSync(new Date())
        notify('Sync completed', 'success')
      } else {
        notify('Optimo integration not yet configured', 'warning')
      }
    } catch {
      notify('Optimo integration not yet configured', 'warning')
    } finally {
      setOptimoSyncing(false)
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
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 12, letterSpacing: '-0.03em' }}>
            <Globe size={32} color="#4f46e5" strokeWidth={2.5} /> Venue Infrastructure
          </h1>
          <p style={{ fontSize: 16, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Manage multi-site venues and synchronize metadata with Optimo.</p>
        </div>
        <Btn t={t} onClick={openVenueAdd} style={{ 
          borderRadius: 14, 
          background: 'linear-gradient(135deg, #4f46e5, #4338ca)', 
          color: '#fff', 
          padding: '12px 28px', 
          fontWeight: 900, 
          fontSize: 14,
          display: 'flex', 
          alignItems: 'center', 
          gap: 10,
          boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
          border: 'none'
        }}>
          <Plus size={20} /> Add Venue
        </Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {[
              { label: 'Total Venues', value: venues.length, color: '#4f46e5', icon: <Building2 size={24} /> },
              { label: 'Primary Sites', value: venues.reduce((s, v) => s + v.sites.length, 0), color: '#8b5cf6', icon: <Activity size={24} /> },
              { label: 'Total Capacity', value: venues.reduce((s, v) => s + v.sites.reduce((ss, sss) => ss + (sss.capacity || 0), 0), 0).toLocaleString(), color: '#22c55e', icon: <Users size={24} /> },
              { label: 'Sync Status', value: 'Live', color: '#3b82f6', icon: <RefreshCw size={24} /> },
          ].map(({ label, value, color, icon }) => (
              <div key={label} style={{ background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
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

      <div style={{ background: '#fff', padding: '28px 32px', borderRadius: 28, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '-0.02em' }}>
                <Settings size={20} color="#4f46e5" strokeWidth={2.5} /> Optimo Production Integration
            </div>
            {lastOptimoSync && <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Last updated: {lastOptimoSync.toLocaleTimeString()}</div>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 32 }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', position: 'relative' }}>
                   <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid #ef4444', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                </div>
                <div style={{ fontSize: 15, color: '#0f172a', fontWeight: 900 }}>Infrastructure Pipeline: <span style={{ color: '#ef4444' }}>Disconnected</span></div>
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 6, fontWeight: 600 }}>Synchronize venue metadata, dynamic floorplans, and endpoint station mappings from the Optimo cloud architecture.</div>
          </div>
          <Btn t={t} variant={optimoSyncing ? 'ghost' : 'outline'} onClick={handleOptimoSyncNow} disabled={optimoSyncing} style={{ 
            borderRadius: 16, 
            padding: '14px 28px',
            fontSize: 14,
            fontWeight: 800,
            border: '1px solid #e2e8f0',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transition: 'all 0.2s'
          }}>
            {optimoSyncing ? <><RefreshCw size={16} className="spin" /> Syncing Cloud...</> : <><RefreshCw size={16} color="#4f46e5" /> Synchronize All Infrastructure</>}
          </Btn>
        </div>
      </div>

      {venues.length === 0 ? (
        <div style={{ background: '#fff', padding: 100, textAlign: 'center', borderRadius: 32, boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🏟️</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>No Venue Infrastructure Found</div>
          <div style={{ fontSize: 15, color: '#64748b', marginTop: 8, fontWeight: 600 }}>Create your first venue to begin configuring localized operation sites.</div>
          <Btn t={t} onClick={openVenueAdd} style={{ 
            marginTop: 32, 
            background: '#4f46e5', 
            color: '#fff', 
            borderRadius: 16, 
            padding: '16px 32px', 
            fontWeight: 900,
            fontSize: 15,
            boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)',
            border: 'none'
          }}>+ Initialize Venue</Btn>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {venues.map(venue => {
            const isExpanded = expandedVenue === venue.id
            const sync = syncStatus[venue.id]
            return (
              <div key={venue.id} style={{
                background: '#fff',
                borderRadius: 28, 
                padding: '24px 32px', 
                boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9',
                transition: 'all 0.3s ease',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', gap: 20 }} onClick={() => setExpandedVenue(isExpanded ? null : venue.id)}>
                    <div style={{ 
                      width: 48, height: 48, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a',
                      transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s'
                    }}>
                      <Globe size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em' }}>{venue.name}</div>
                      <div style={{ fontSize: 14, color: '#64748b', marginTop: 2, fontWeight: 600 }}>{venue.address}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ padding: '6px 12px', borderRadius: 10, background: '#eef2ff', color: '#4f46e5', fontSize: 11, fontWeight: 900 }}>{venue.type.toUpperCase()}</div>
                    <div style={{ padding: '6px 12px', borderRadius: 10, background: '#f5f3ff', color: '#8b5cf6', fontSize: 11, fontWeight: 900 }}>{venue.sites.length} AREAS</div>
                    
                    <div style={{ display: 'flex', gap: 4, background: '#f8fafc', padding: 6, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                      <Btn t={t} variant="ghost" style={{ color: '#4f46e5', width: 36, height: 36, padding: 0 }} onClick={(e) => { e.stopPropagation(); syncVenue(venue.id); }} disabled={sync === 'syncing'}>
                        {sync === 'syncing' ? <RefreshCw size={16} className="spin" /> : <RefreshCw size={16} />}
                      </Btn>
                      <Btn t={t} variant="ghost" style={{ color: '#64748b', width: 36, height: 36, padding: 0 }} onClick={(e) => { e.stopPropagation(); openVenueEdit(venue); }}>✏️</Btn>
                      <Btn t={t} variant="ghost" style={{ color: '#ef4444', width: 36, height: 36, padding: 0 }} onClick={(e) => { e.stopPropagation(); deleteVenue(venue.id); }}>🗑️</Btn>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ 
                    marginTop: 24, padding: 32, background: '#f8fafc', borderRadius: 24, border: '1px solid #e2e8f0',
                    animation: 'fadeIn 0.3s ease-out'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em' }}>Operational Sites & Areas</div>
                      <Btn t={t} style={{ 
                        background: '#4f46e5', color: '#fff', borderRadius: 12, padding: '10px 20px', 
                        fontWeight: 900, fontSize: 13, border: 'none', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' 
                      }} onClick={() => openSiteAdd(venue.id)}>+ Add Area</Btn>
                    </div>
                    {venue.sites.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>No localized sites configured for this venue.</div>
                    ) : (
                      <Table t={t} cols={['Identity', 'Occupancy / Capacity', 'Operational Status', 'Actions']}
                        rows={venue.sites.map(site => [
                          <div>
                            <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 14 }}>{site.name}</div>
                            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, marginTop: 2 }}>{site.id}</div>
                          </div>,
                          <div style={{ fontWeight: 900, color: '#4f46e5', fontSize: 14 }}>{site.capacity.toLocaleString()}</div>,
                          <Badge t={t} text={site.status.toUpperCase()} color={site.status === 'active' ? 'green' : 'red'} style={{ fontWeight: 900, padding: '6px 12px', borderRadius: 8 }} />,
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Btn t={t} variant="ghost" style={{ background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 16px', fontWeight: 800, fontSize: 12 }} onClick={() => openSiteEdit(venue.id, site)}>Edit</Btn>
                            <Btn t={t} variant="ghost" style={{ background: '#fff', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 16px', fontWeight: 800, fontSize: 12 }} onClick={() => deleteSite(venue.id, site.id)}>Remove</Btn>
                          </div>
                        ])} empty="No sites found" />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showVenueForm && (
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
        }} onClick={() => setShowVenueForm(false)}>
          <div style={{ 
            maxWidth: 500, 
            width: '100%', 
            borderRadius: 40, 
            padding: 48, 
            background: '#fff',
            boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
            position: 'relative',
            animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 1000, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>{editVenue ? 'Initialize Infrastructure' : 'Add New Venue'}</h2>
              <p style={{ fontSize: 15, color: '#64748b', fontWeight: 600 }}>Configure the identity and location of your new operational venue.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Identity Name</label>
                <input 
                  type="text" 
                  value={venueForm.name} 
                  onChange={e => setVenueForm(f => ({ ...f, name: e.target.value }))} 
                  placeholder="e.g. Central Arena"
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Physical Address</label>
                <input 
                  type="text" 
                  value={venueForm.address} 
                  onChange={e => setVenueForm(f => ({ ...f, address: e.target.value }))} 
                  placeholder="Full physical address"
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Infrastructure Type</label>
                <Select t={t} label="" value={venueForm.type} onChange={v => setVenueForm(f => ({ ...f, type: v }))} options={[{ value: 'Venue', label: '🏟️ Standard Venue' }, { value: 'Theatre', label: '🎭 Theatre / Cinema' }, { value: 'Stadium', label: '🏟️ Sports Stadium' }, { value: 'Retail', label: '🏪 Retail Hub' }]} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <Btn t={t} variant="ghost" fullWidth style={{ borderRadius: 16, padding: 16, fontWeight: 800, color: '#64748b', background: '#f8fafc' }} onClick={() => setShowVenueForm(false)}>Cancel</Btn>
                <Btn t={t} fullWidth style={{ 
                  borderRadius: 16, 
                  padding: 16, 
                  fontWeight: 900, 
                  background: 'linear-gradient(135deg, #4f46e5, #4338ca)', 
                  color: '#fff',
                  boxShadow: '0 8px 20px rgba(79, 70, 229, 0.2)',
                  border: 'none'
                }} onClick={saveVenue}>{editVenue ? 'Save Changes' : 'Add Venue'}</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSiteForm && (
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
        }} onClick={() => setShowSiteForm(null)}>
          <div style={{ 
            maxWidth: 450, 
            width: '100%', 
            borderRadius: 40, 
            padding: 48, 
            background: '#fff',
            boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
            position: 'relative',
            animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 1000, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>{editSite ? 'Edit Area' : 'Add New Area'}</h2>
              <p style={{ fontSize: 15, color: '#64748b', fontWeight: 600 }}>Define a specific operational area within the venue.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Identity Area Name</label>
                <input 
                  type="text" 
                  value={siteForm.name} 
                  onChange={e => setSiteForm(f => ({ ...f, name: e.target.value }))} 
                  placeholder="e.g. Main Stand, East Hall"
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Maximum Occupancy</label>
                <input 
                  type="number" 
                  value={siteForm.capacity} 
                  onChange={e => setSiteForm(f => ({ ...f, capacity: e.target.value }))} 
                  placeholder="0" 
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Deployment Status</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['active', 'inactive'].map(s => (
                    <button key={s} onClick={() => setSiteForm(f => ({ ...f, status: s }))} style={{ 
                      flex: 1, padding: '14px', borderRadius: 16, 
                      border: siteForm.status === s ? '2px solid #4f46e5' : '1px solid #e2e8f0', 
                      background: siteForm.status === s ? '#eef2ff' : '#fff', 
                      color: siteForm.status === s ? '#4f46e5' : '#64748b', 
                      fontSize: 14, fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 
                    }}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <Btn t={t} variant="ghost" fullWidth style={{ borderRadius: 16, padding: 16, fontWeight: 800, color: '#64748b', background: '#f8fafc' }} onClick={() => setShowSiteForm(null)}>Cancel</Btn>
                <Btn t={t} fullWidth style={{ 
                  borderRadius: 16, padding: 16, fontWeight: 900, 
                  background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: '#fff',
                  boxShadow: '0 8px 20px rgba(79, 70, 229, 0.2)', border: 'none'
                }} onClick={saveSite}>{editSite ? 'Save Changes' : 'Confirm Area'}</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
