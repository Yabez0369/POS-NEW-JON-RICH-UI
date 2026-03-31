import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useVenueStore } from '@/stores/venueStore'
import { venuesService } from '@/services'
import { Btn } from '@/components/ui'
import bgImage from '@/assets/traditional_store_bg.png'

const DEFAULT_VENUE_ID = 'a0000000-0000-0000-0000-000000000001'
const DEFAULT_SITE_ID = 'b0000000-0000-0000-0000-000000000001'

export function VenueSiteConfirmation() {
  const { t } = useTheme()
  const { currentUser } = useAuth()
  const { setVenue, setSite } = useVenueStore()
  const navigate = useNavigate()
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVenueId, setSelectedVenueId] = useState('')
  const [selectedSiteId, setSelectedSiteId] = useState('')

  // Detect venue/site from user profile
  const detectedVenueId = currentUser?.venue_id || currentUser?.venueId || DEFAULT_VENUE_ID
  const detectedSiteId = currentUser?.site_id || currentUser?.siteId || DEFAULT_SITE_ID

  useEffect(() => {
    venuesService.fetchVenuesWithSites().then((data) => {
      const list = data || []
      setVenues(list)
      const v = list.find(x => x.id === detectedVenueId)
      const sites = v?.sites || []
      const venueId = v ? detectedVenueId : (list[0]?.id || '')
      const siteId = sites.some(s => s.id === detectedSiteId) ? detectedSiteId : (sites[0]?.id || list[0]?.sites?.[0]?.id || '')
      setSelectedVenueId(venueId)
      setSelectedSiteId(siteId)
      setLoading(false)
    })
  }, [detectedVenueId, detectedSiteId])

  const selectedVenue = venues.find(v => v.id === selectedVenueId)
  const sites = selectedVenue?.sites || []

  useEffect(() => {
    if (!selectedVenueId || !venues.length) return
    const v = venues.find(x => x.id === selectedVenueId)
    const siteList = v?.sites || []
    const currentInList = siteList.some(s => s.id === selectedSiteId)
    if (!currentInList && siteList[0]) {
      setSelectedSiteId(siteList[0].id)
    }
  }, [selectedVenueId, venues])

  const handleConfirm = () => {
    const venueId = selectedVenueId || detectedVenueId
    const siteId = selectedSiteId || (sites[0]?.id || detectedSiteId)
    setVenue(venueId)
    setSite(siteId)
    navigate('/app')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid ' + t.border, borderTopColor: t.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>Detecting location...</div>
        </div>
      </div>
    )
  }

  const detectedVenue = venues.find(v => v.id === detectedVenueId)
  const detectedSite = detectedVenue?.sites?.find(s => s.id === detectedSiteId)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: t.bg }}>
      <div style={{ flex: 1.2, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '60px', position: 'relative', overflow: 'hidden', boxShadow: 'inset -20px 0 50px rgba(0,0,0,0.5)' }} className="hide-mobile">
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%)' }} />
        
        <div style={{ position: 'relative', color: '#fff', maxWidth: 500, zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: 30, marginBottom: 20, border: '1px solid rgba(255,255,255,0.3)' }}>
            <span style={{ fontSize: 18, marginRight: 8 }}>📍</span>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Workspace Setup</span>
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1, marginBottom: 16, lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            Welcome to<br/>the POS System
          </div>
          <div style={{ fontSize: 16, opacity: 0.9, lineHeight: 1.6, fontWeight: 300, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            Step into a premium retail experience. Please verify your working location to begin serving customers.
          </div>
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: 500, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px, 5vw, 60px)', background: t.bg }}>
        <div style={{ width: '100%', maxWidth: 420, padding: 40, background: t.bg2, borderRadius: 24, boxShadow: '0 24px 48px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)', border: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: t.text, marginBottom: 8, letterSpacing: -0.5 }}>Confirm your location</div>
          <div style={{ fontSize: 14, color: t.text3, marginBottom: 32, lineHeight: 1.5 }}>
            We've detected your default venue. You can confirm or switch to another location below.
          </div>

          {detectedVenue && detectedSite && (
            <div style={{ background: t.greenBg || 'rgba(16, 185, 129, 0.1)', border: `1px solid ${t.greenBorder || 'rgba(16, 185, 129, 0.2)'}`, borderRadius: 12, padding: '16px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ fontSize: 20 }}>✨</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: t.green || '#10b981', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Detected from profile</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>
                  {detectedVenue.name} &bull; {detectedSite.name}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: t.text3, marginBottom: 8 }}>Select Venue</label>
              <select
                value={selectedVenueId}
                onChange={e => { setSelectedVenueId(e.target.value); setSelectedSiteId('') }}
                style={{
                  width: '100%', background: t.input, border: `1px solid ${t.border}`, borderRadius: 12,
                  padding: '14px 16px', color: t.text, fontSize: 15, outline: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', fontWeight: 500
                }}
              >
                {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: t.text3, marginBottom: 8 }}>Select Site</label>
              <select
                value={selectedSiteId}
                onChange={e => setSelectedSiteId(e.target.value)}
                style={{
                  width: '100%', background: t.input, border: `1px solid ${t.border}`, borderRadius: 12,
                  padding: '14px 16px', color: t.text, fontSize: 15, outline: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', fontWeight: 500
                }}
              >
                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div style={{ marginTop: 12 }}>
               <Btn t={t} variant="primary" fullWidth onClick={handleConfirm} style={{ padding: '16px', borderRadius: 12, fontSize: 16, fontWeight: 700, letterSpacing: 0.2, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                 Confirm & Continue &rarr;
               </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
