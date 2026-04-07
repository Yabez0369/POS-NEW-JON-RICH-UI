import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { ImgWithFallback } from '@/components/shared'
import { isBannerActive } from '@/lib/utils'
import { Store, MonitorPlay, Zap } from 'lucide-react'

export const CustomerDisplay = ({ banners = [], settings = {} }) => {
  const { t } = useTheme()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [bIdx, setBIdx] = useState(0)
  const activeBanners = banners.filter(b => isBannerActive(b))

  useEffect(() => {
    if (activeBanners.length < 2) return
    const currentBanner = activeBanners[bIdx]
    const duration = currentBanner?.duration || 6000 // 6 seconds default
    
    const interval = setTimeout(() => {
      setBIdx((prev) => (prev + 1) % activeBanners.length)
    }, duration)
    
    return () => clearTimeout(interval)
  }, [activeBanners.length, bIdx, activeBanners])

  if (activeBanners.length === 0) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg, flexDirection: 'column' }}>
        <MonitorPlay size={64} color={t.text4} style={{ marginBottom: 20 }} />
        <h1 style={{ fontSize: 32, color: t.text3, fontWeight: 900 }}>Welcome!</h1>
        <p style={{ color: t.text4, fontSize: 18 }}>Please proceed to the nearest counter.</p>
      </div>
    )
  }

  const current = activeBanners[bIdx] || activeBanners[0]

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden', 
      display: 'flex', 
      background: current?.grad || current?.color || t.bg,
      position: 'relative'
    }}>
      
      {/* Dynamic Background */}
      {current?.image && (
        <img 
          src={current.image} 
          alt={current.title} 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            opacity: current.themeStyle === 'cyberpunk' ? 0.9 : 1,
            filter: current.themeStyle === 'cyberpunk' ? 'saturate(1.5) contrast(1.2)' : 'none'
          }} 
        />
      )}
      
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
        zIndex: 1 
      }} />

      {/* Main Content Area */}
      <div 
        key={current.id} 
        style={{ 
          position: 'relative', 
          zIndex: 10, 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          padding: '0 8%',
          animation: current.transitionType === 'slide' ? 'slideInRight 1s cubic-bezier(0.16, 1, 0.3, 1)' :
                     current.transitionType === 'zoom' ? 'zoomIn 1s cubic-bezier(0.16, 1, 0.3, 1)' :
                     'fadeIn 1s ease-in-out'
        }}
      >
        <div style={{ maxWidth: 900 }}>
          {current.offerDiscount > 0 && (
             <div style={{ 
               display: 'inline-flex', 
               alignItems: 'center', 
               gap: 12, 
               background: t.accent, 
               color: '#fff',
               padding: '8px 24px', 
               borderRadius: 30, 
               fontSize: 24, 
               fontWeight: 900, 
               marginBottom: 24,
               boxShadow: `0 8px 30px ${t.accent}60`,
               animation: 'pulseScale 2s infinite'
             }}>
               🔥 {current.offerDiscount}% OFF {current.offerTarget?.toUpperCase()}
             </div>
          )}
          
          <h1 style={{ 
            fontSize: 'clamp(64px, 8vw, 120px)', 
            fontWeight: 900, 
            color: '#fff', 
            lineHeight: 1, 
            marginBottom: 24, 
            letterSpacing: -2,
            textShadow: current.themeStyle === 'cyberpunk' ? `0 0 20px ${t.accent}, 0 0 40px ${t.accent}` : '0 10px 40px rgba(0,0,0,0.5)'
          }}>
            {current.title}
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(24px, 3vw, 42px)', 
            color: 'rgba(255,255,255,0.9)', 
            fontWeight: 600, 
            lineHeight: 1.4,
            marginBottom: 48,
            maxWidth: 800,
            textShadow: '0 4px 10px rgba(0,0,0,0.5)'
          }}>
            {current.subtitle}
          </p>
          
          <div style={{ 
             display: 'inline-block', 
             background: current.themeStyle === 'glass' ? 'rgba(255,255,255,0.2)' : '#fff', 
             color: current.themeStyle === 'glass' ? '#fff' : (current.color || t.accent), 
             padding: '24px 48px', 
             borderRadius: 20, 
             fontSize: 32, 
             fontWeight: 900,
             backdropFilter: current.themeStyle === 'glass' ? 'blur(20px)' : 'none',
             border: current.themeStyle === 'glass' ? '2px solid rgba(255,255,255,0.5)' : 'none',
             boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}>
            {current.cta || 'Discover Now'}
          </div>
        </div>
      </div>

      {/* Persistent Sidebar/Branding */}
      <div style={{ 
        width: 360, 
        background: 'rgba(0,0,0,0.6)', 
        backdropFilter: 'blur(30px)', 
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 40px'
      }}>
          <div 
            onClick={() => navigate('/app/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 60, cursor: 'pointer' }}
          >
            <div style={{ width: 64, height: 64, background: t.accent, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 32, fontWeight: 900 }}>
              S
            </div>
            <div style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>
              SCSTix
            </div>
          </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, flex: 1, justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
             <Store size={48} color={t.accent} style={{ marginBottom: 16 }} />
             <div style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>Visit the Store</div>
             <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginTop: 8 }}>Explore all collections</div>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', width: '100%' }} />
          <div style={{ textAlign: 'center' }}>
             <Zap size={48} color={t.yellow} style={{ marginBottom: 16 }} />
             <div style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>Join Rewards</div>
             <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginTop: 8 }}>Earn points on every purchase</div>
          </div>
          
          {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', width: '100%' }} />
              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={() => navigate('/app/dashboard')}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 800,
                    cursor: 'pointer', fontSize: 14, transition: 'all 0.2s', width: '100%'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  Exit to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Progress indicators for banners */}
        <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
          {activeBanners.map((_, i) => (
            <div 
              key={i} 
              style={{ 
                width: i === bIdx ? 48 : 12, 
                height: 12, 
                borderRadius: 6, 
                background: `rgba(255,255,255,${i === bIdx ? 1 : 0.3})`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
              }} 
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(1.1); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulseScale {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
