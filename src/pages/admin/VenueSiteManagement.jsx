import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Btn, Input, Badge, Card, Modal, Table } from '@/components/ui'
import { notify } from '@/components/shared'
import { genId, ts, fmt } from '@/lib/utils'
import { syncVenues, syncSites } from '@/services/optimo'
import { Building2, MapPin, Users, Activity, RefreshCw, Plus, Globe, Settings } from 'lucide-react'

import { INITIAL_VENUES } from '@/core'

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: t.text, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Globe size={26} color={t.accent} /> Venue Infrastructure
          </h1>
          <p style={{ fontSize: 13, color: t.text3, marginTop: 4 }}>Manage multi-site venues and synchronize metadata with Optimo.</p>
        </div>
        <Btn t={t} onClick={openVenueAdd} style={{ background: t.accent, color: '#fff', borderRadius: 12, padding: '10px 24px', fontWeight: 800 }}>
          <Plus size={18} style={{ marginRight: 8 }} /> Add Venue
        </Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
              { label: 'Total Venues', value: venues.length, color: t.accent, icon: <Building2 size={18} /> },
              { label: 'Primary Sites', value: venues.reduce((s, v) => s + v.sites.length, 0), color: t.purple, icon: <Activity size={18} /> },
              { label: 'Total Capacity', value: venues.reduce((s, v) => s + v.sites.reduce((ss, sss) => ss + (sss.capacity || 0), 0), 0).toLocaleString(), color: t.green, icon: <Users size={18} /> },
              { label: 'Sync Status', value: 'Live', color: t.blue, icon: <RefreshCw size={18} /> },
          ].map(({ label, value, color, icon }) => (
              <Card key={label} t={t} style={{ padding: '14px 18px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                    {icon}
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: t.text4, textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontSize: 20, fontWeight: 1000, color }}>{value}</div>
                </div>
              </Card>
          ))}
      </div>

      <Card t={t} style={{ padding: '16px 20px', borderRadius: 18, border: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: t.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Settings size={16} /> Optimo Production Integration
            </div>
            {lastOptimoSync && <div style={{ fontSize: 11, color: t.text4 }}>Last updated: {lastOptimoSync.toLocaleTimeString()}</div>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.red }} />
                <div style={{ fontSize: 13, color: t.text2, fontWeight: 700 }}>Legacy Connection: <span style={{ color: t.red }}>Disconnected</span></div>
            </div>
            <div style={{ fontSize: 12, color: t.text4, marginTop: 4 }}>Sync venue metadata, floorplans, and station mappings from the Optimo cloud.</div>
          </div>
          <Btn t={t} variant={optimoSyncing ? 'ghost' : 'outline'} onClick={handleOptimoSyncNow} disabled={optimoSyncing} style={{ borderRadius: 12, padding: '10px 20px' }}>
            {optimoSyncing ? <><RefreshCw size={14} className="spin" /> Syncing Network...</> : <><RefreshCw size={14} /> Synchronize All Data</>}
          </Btn>
        </div>
      </Card>

      {venues.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: t.text3 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏟️</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No venues</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>Add your first venue to get started</div>
          <Btn t={t} onClick={openVenueAdd}>+ Add Venue</Btn>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {venues.map(venue => {
            const isExpanded = expandedVenue === venue.id
            const sync = syncStatus[venue.id]
            return (
              <Card t={t} key={venue.id} style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => setExpandedVenue(isExpanded ? null : venue.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{isExpanded ? '▾' : '▸'}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>{venue.name}</div>
                        <div style={{ fontSize: 12, color: t.text3, marginTop: 2 }}>{venue.address}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    <Badge t={t} text={venue.type} color="blue" />
                    <Badge t={t} text={`${venue.sites.length} site${venue.sites.length !== 1 ? 's' : ''}`} color="purple" />
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    <Badge t={t} text={venue.type} color="blue" />
                    <Badge t={t} text={`${venue.sites.length} Areas`} color="purple" />
                    <Btn t={t} variant="ghost" size="sm" onClick={() => syncVenue(venue.id)} disabled={sync === 'syncing'} style={{ color: t.accent }}>
                      {sync === 'syncing' ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />}
                    </Btn>
                    <Btn t={t} variant="ghost" size="sm" onClick={() => openVenueEdit(venue)} style={{ color: t.text3 }}>✏️</Btn>
                    <Btn t={t} variant="ghost" size="sm" onClick={() => deleteVenue(venue.id)} style={{ color: t.red }}>🗑️</Btn>
                  </div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${t.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: t.text }}>Sites</div>
                      <Btn t={t} variant="secondary" size="sm" onClick={() => openSiteAdd(venue.id)}>+ Add Site</Btn>
                    </div>
                    {venue.sites.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: t.text3, fontSize: 13 }}>No sites yet</div>
                    ) : (
                      <Table t={t} cols={['Site', 'Capacity', 'Status', 'Actions']}
                        rows={venue.sites.map(site => [
                          <div>
                            <div style={{ fontWeight: 700, color: t.text }}>{site.name}</div>
                            <div style={{ fontSize: 11, color: t.text3 }}>{site.id}</div>
                          </div>,
                          site.capacity.toLocaleString(),
                          <Badge t={t} text={site.status} color={site.status === 'active' ? 'green' : 'red'} />,
                          <div style={{ display: 'flex', gap: 5 }}>
                            <Btn t={t} variant="secondary" size="sm" onClick={() => openSiteEdit(venue.id, site)}>✏️</Btn>
                            <Btn t={t} variant="danger" size="sm" onClick={() => deleteSite(venue.id, site.id)}>🗑️</Btn>
                          </div>
                        ])} empty="No sites" />
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {showVenueForm && (
        <Modal t={t} title={editVenue ? '✏️ Edit Venue' : '+ Add Venue'} onClose={() => setShowVenueForm(false)} width={460}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input t={t} label="Venue Name" value={venueForm.name} onChange={v => setVenueForm(f => ({ ...f, name: v }))} placeholder="e.g. Central Arena" />
            <Input t={t} label="Address" value={venueForm.address} onChange={v => setVenueForm(f => ({ ...f, address: v }))} placeholder="Full address" />
            <Input t={t} label="Type" value={venueForm.type} onChange={v => setVenueForm(f => ({ ...f, type: v }))} placeholder="e.g. Arena, Theatre, Stadium" />
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn t={t} variant="secondary" fullWidth onClick={() => setShowVenueForm(false)}>Cancel</Btn>
              <Btn t={t} variant="success" fullWidth onClick={saveVenue}>{editVenue ? 'Save Changes' : 'Add Venue'}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {showSiteForm && (
        <Modal t={t} title={editSite ? '✏️ Edit Site' : '+ Add Site'} onClose={() => setShowSiteForm(null)} width={420}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input t={t} label="Site Name" value={siteForm.name} onChange={v => setSiteForm(f => ({ ...f, name: v }))} placeholder="e.g. Main Hall" />
            <Input t={t} label="Capacity" value={siteForm.capacity} onChange={v => setSiteForm(f => ({ ...f, capacity: v }))} placeholder="0" type="number" />
            <div style={{ display: 'flex', gap: 8 }}>
              {['active', 'inactive'].map(s => (
                <button key={s} onClick={() => setSiteForm(f => ({ ...f, status: s }))} style={{ flex: 1, padding: '8px', borderRadius: 9, border: `1px solid ${siteForm.status === s ? t.accent : t.border}`, background: siteForm.status === s ? t.accent + '15' : 'transparent', color: siteForm.status === s ? t.accent : t.text3, fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>{s}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn t={t} variant="secondary" fullWidth onClick={() => setShowSiteForm(null)}>Cancel</Btn>
              <Btn t={t} variant="success" fullWidth onClick={saveSite}>{editSite ? 'Save Changes' : 'Add Site'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
