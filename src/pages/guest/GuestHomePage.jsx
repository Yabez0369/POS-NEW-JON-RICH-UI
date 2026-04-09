import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Zap, BarChart3, Package, Users, ShieldCheck, ArrowRight,
  CheckCircle, Star, ChevronDown, Menu, X, Globe,
  Clock, TrendingUp, Repeat, Award
} from 'lucide-react'

const FEATURES = [
  {
    icon: Zap,
    color: '#2563EB',
    bg: 'rgba(37,99,235,0.1)',
    title: 'Lightning-Fast Billing',
    desc: 'Process sales in seconds with barcode scanning, quick-add products, and instant receipt printing. Designed for peak-hour speed.',
  },
  {
    icon: Package,
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
    title: 'Real-Time Inventory',
    desc: 'Track stock levels across all outlets instantly. Get low-stock alerts, damage reports, and stock transfer tools out of the box.',
  },
  {
    icon: Users,
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.1)',
    title: 'Multi-Role Access',
    desc: 'Separate dashboards for Admin, Manager, and Cashier — each tailored to their responsibilities with granular permissions.',
  },
  {
    icon: BarChart3,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    title: 'Powerful Analytics',
    desc: 'Revenue trends, top products, outlet performance, and daily Z-Reports — all the data you need to make smart decisions.',
  },
  {
    icon: Globe,
    color: '#EC4899',
    bg: 'rgba(236,72,153,0.1)',
    title: 'Multi-Outlet Support',
    desc: "Manage multiple venues and sites from a single admin dashboard. Monitor each location's performance in real time.",
  },
  {
    icon: Repeat,
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.1)',
    title: 'Returns & Exchanges',
    desc: 'Handle customer returns and exchanges with ease. Full audit trail and refund management built right in.',
  },
]

const STATS = [
  { value: '2s', label: 'Average transaction time', icon: Clock },
  { value: '99.9%', label: 'System uptime', icon: ShieldCheck },
  { value: '1000+', label: 'Daily transactions handled', icon: TrendingUp },
  { value: '100%', label: 'Cloud-synced data', icon: Award },
]

const TESTIMONIALS = [
  {
    name: 'Maria Johnson',
    role: 'Retail Store Owner',
    quote: 'SCSTIX transformed our checkout process. Queues are shorter, stock errors are gone, and our team loves it.',
    rating: 5,
    avatar: 'M',
    color: '#2563EB',
  },
  {
    name: 'Ben Clarke',
    role: 'Venue Manager',
    quote: 'Managing 3 sites used to be a nightmare. Now I get a live view of all locations from one screen.',
    rating: 5,
    avatar: 'B',
    color: '#10B981',
  },
  {
    name: 'Aisha Patel',
    role: 'Head Cashier',
    quote: 'The POS is fast and intuitive. Even new staff can learn it within minutes — no training headaches.',
    rating: 5,
    avatar: 'A',
    color: '#7C3AED',
  },
]

const NAV_LINKS = ['Features', 'Pricing', 'About', 'Contact']

function NavBar({ onLogin }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all .3s',
      background: scrolled ? 'rgba(15,23,42,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, background: '#2563EB', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} color="#fff" />
          </div>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 18, letterSpacing: -0.5 }}>SCSTIX</span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="desktop-nav">
          {NAV_LINKS.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => { e.target.style.color = '#fff' }}
              onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.75)' }}
            >{l}</a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={onLogin}
            style={{ padding: '9px 20px', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Sign In
          </button>
          <button
            style={{ padding: '9px 20px', fontSize: 14, fontWeight: 700, color: '#fff', background: '#2563EB', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Get Started
          </button>
          {/* Hamburger */}
          <button onClick={() => setOpen(v => !v)} style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }} className="hamburger-btn" id="hamburger">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: 'rgba(15,23,42,0.98)', backdropFilter: 'blur(20px)', padding: '16px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {NAV_LINKS.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)} style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 600, textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>{l}</a>
          ))}
          <button onClick={onLogin} style={{ marginTop: 16, width: '100%', padding: '13px', fontWeight: 700, color: '#fff', background: '#2563EB', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontFamily: 'inherit' }}>Sign In</button>
        </div>
      )}
    </nav>
  )
}

export function GuestHomePage() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#fff', color: '#111827' }}>
      <NavBar onLogin={() => navigate('/login')} />

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(150deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative glows */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.35)', borderRadius: 100, padding: '7px 18px', marginBottom: 28, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%' }} />
          <span style={{ color: '#93C5FD', fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>Now with Multi-Outlet Support</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(32px,6vw,72px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: -2, maxWidth: 820, marginBottom: 24, position: 'relative', zIndex: 1 }}>
          The EPOS system your<br />
          <span style={{ background: 'linear-gradient(90deg, #2563EB, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            business deserves
          </span>
        </h1>
        <p style={{ fontSize: 'clamp(15px,2vw,19px)', color: 'rgba(255,255,255,0.65)', maxWidth: 600, lineHeight: 1.7, marginBottom: 40, position: 'relative', zIndex: 1 }}>
          SCSTIX is a professional EPOS platform built for speed, clarity, and growth. From fast billing to deep analytics — everything your team needs in one place.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => navigate('/login')}
            id="hero-get-started"
            style={{ padding: '15px 32px', fontSize: 16, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', border: 'none', borderRadius: 14, cursor: 'pointer', boxShadow: '0 8px 30px rgba(37,99,235,0.4)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'transform .2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Get Started Free <ArrowRight size={18} />
          </button>
          <button
            id="hero-book-demo"
            style={{ padding: '15px 32px', fontSize: 16, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 14, cursor: 'pointer', backdropFilter: 'blur(8px)', fontFamily: 'inherit', transition: 'transform .2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Book a Demo
          </button>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, animation: 'float 2.4s ease-in-out infinite' }}>
          <ChevronDown size={20} color="rgba(255,255,255,0.3)" />
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────── */}
      <section style={{ background: '#1F2937', padding: '36px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24 }}>
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(37,99,235,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color="#60A5FA" />
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 24, fontWeight: 900, lineHeight: 1, letterSpacing: -0.5 }}>{value}</div>
                <div style={{ color: '#9CA3AF', fontSize: 13, marginTop: 3 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="features" style={{ padding: 'clamp(60px,8vw,100px) 24px', background: '#F9FAFB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ display: 'inline-block', color: '#2563EB', fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Everything you need</span>
            <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, color: '#111827', letterSpacing: -1, marginBottom: 16 }}>Built for modern retail</h2>
            <p style={{ color: '#6B7280', fontSize: 17, maxWidth: 540, margin: '0 auto', lineHeight: 1.65 }}>Every feature is purpose-built for small and medium businesses who need a powerful, easy-to-use system.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title}
                style={{ background: '#fff', borderRadius: 18, padding: '28px 28px 32px', border: '1.5px solid #E5E7EB', transition: 'transform .25s, box-shadow .25s, border-color .25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor = color }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E7EB' }}
              >
                <div style={{ width: 50, height: 50, background: bg, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 10 }}>{title}</h3>
                <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLE SHOWCASE ─────────────────────────────────────── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ display: 'inline-block', color: '#10B981', fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Role-based access</span>
            <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, color: '#111827', letterSpacing: -1, marginBottom: 14 }}>One system, every role</h2>
            <p style={{ color: '#6B7280', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>Each team member gets exactly what they need — nothing more, nothing less.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { title: 'Admin', color: '#7C3AED', bg: 'linear-gradient(135deg, #7C3AED, #6D28D9)', icon: ShieldCheck, perks: ['Full system control','User & role management','Multi-outlet oversight','Financial reports & Z-Reports'] },
              { title: 'Manager', color: '#2563EB', bg: 'linear-gradient(135deg, #2563EB, #1D4ED8)', icon: BarChart3, perks: ['Inventory management','Team scheduling','Sales reports','Product catalogue'] },
              { title: 'Cashier', color: '#10B981', bg: 'linear-gradient(135deg, #10B981, #059669)', icon: Zap, perks: ['Lightning-fast POS','Barcode scanning','Customer lookup','Cash management'] },
            ].map(({ title, color, bg, icon: Icon, perks }) => (
              <div key={title} style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
                <div style={{ background: bg, padding: '28px 28px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color="#fff" />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>{title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>Role Access</div>
                  </div>
                </div>
                <div style={{ background: '#fff', padding: '20px 28px 26px', border: '1.5px solid #E5E7EB', borderTop: 'none', borderRadius: '0 0 20px 20px' }}>
                  {perks.map(p => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <CheckCircle size={15} color={color} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: '#374151', fontWeight: 600 }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section id="about" style={{ padding: 'clamp(60px,8vw,100px) 24px', background: '#F9FAFB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ display: 'inline-block', color: '#F59E0B', fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Trusted by businesses</span>
            <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, color: '#111827', letterSpacing: -1 }}>What our users say</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 24 }}>
            {TESTIMONIALS.map(({ name, role, quote, rating, avatar, color }) => (
              <div key={name} style={{ background: '#fff', borderRadius: 18, padding: '28px', border: '1.5px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={16} color="#F59E0B" fill="#F59E0B" />
                  ))}
                </div>
                <p style={{ color: '#374151', fontSize: 15, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16 }}>{avatar}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{name}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(26px,5vw,50px)', fontWeight: 900, color: '#fff', letterSpacing: -1.5, marginBottom: 16 }}>Ready to grow your business?</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, marginBottom: 36, lineHeight: 1.65 }}>
            Join growing businesses using SCSTIX EPOS to power their retail operations — from day one.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              id="cta-sign-in"
              style={{ padding: '15px 36px', fontSize: 16, fontWeight: 800, color: '#fff', background: '#2563EB', border: 'none', borderRadius: 14, cursor: 'pointer', boxShadow: '0 8px 30px rgba(37,99,235,0.4)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1D4ED8' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#2563EB' }}
            >
              Sign In Now <ArrowRight size={18} />
            </button>
            <button
              id="cta-book-demo"
              style={{ padding: '15px 36px', fontSize: 16, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ background: '#0f172a', padding: '36px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 30, height: 30, background: '#2563EB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={16} color="#fff" />
          </div>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>SCSTIX EPOS</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
          © {new Date().getFullYear()} SCSTIX. Professional EPOS for Modern Business.
        </p>
      </footer>

      <style>{`
        @keyframes float { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-8px)} }
        @media (max-width:768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
        @media (min-width:769px) {
          .desktop-nav { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
