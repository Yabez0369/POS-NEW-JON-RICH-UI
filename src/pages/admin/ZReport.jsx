import { useState } from 'react'
import dayjs from 'dayjs'
import { Btn, Badge, Card, StatCard } from '@/components/ui'
import { notify } from '@/components/shared'
import { fmt } from '@/lib/utils'
import { 
  FileText, Calendar, Download, TrendingUp, CreditCard, 
  Banknote, QrCode, Scissors, Landmark, RotateCcw, 
  Activity, Users, Package, ChevronRight, Sparkles
} from 'lucide-react'

export const ZReport = ({ orders, settings, t }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const reportDate = dayjs(selectedDate)
  const dateLabel = reportDate.format('DD/MM/YYYY')
  const dayOrders = orders.filter(o => {
    if (!o.date) return false
    const orderDate = dayjs(o.date, 'DD/MM/YYYY, HH:mm:ss')
    return orderDate.isValid() && orderDate.isSame(reportDate, 'day')
  })

  const total = dayOrders.reduce((s, o) => s + o.total, 0)
  const card = dayOrders.filter(o => o.payment === 'Card').reduce((s, o) => s + o.total, 0)
  const cash = dayOrders.filter(o => o.payment === 'Cash').reduce((s, o) => s + o.total, 0)
  const qr = dayOrders.filter(o => o.payment === 'QR').reduce((s, o) => s + o.total, 0)
  const split = dayOrders.filter(o => o.payment === 'Split').reduce((s, o) => s + o.total, 0)
  const tax = dayOrders.reduce((s, o) => s + (o.tax || 0), 0)
  const refunded = dayOrders.filter(o => o.status === 'refunded').reduce((s, o) => s + o.total, 0)

  const productSales = {}
  dayOrders.forEach(o => o.items.forEach(i => { productSales[i.name] = (productSales[i.name] || 0) + i.qty }))

  const counterRev = {}
  dayOrders.forEach(o => {
    const c = o.counter || 'Unknown'
    if (!counterRev[c]) counterRev[c] = { orders: 0, rev: 0 }
    counterRev[c].orders++
    counterRev[c].rev += o.total
  })

  const exportCsv = () => {
    const d = `Z-REPORT,${dateLabel}\nTotal Revenue,${fmt(total, settings?.sym)}\nCard,${fmt(card, settings?.sym)}\nCash,${fmt(cash, settings?.sym)}\nQR,${fmt(qr, settings?.sym)}\nSplit,${fmt(split, settings?.sym)}\nTax,${fmt(tax, settings?.sym)}\nOrders,${dayOrders.length}\nRefunds,${fmt(refunded, settings?.sym)}`
    const b = new Blob([d], { type: 'text/csv' })
    const url = URL.createObjectURL(b)
    const a = document.createElement('a')
    a.href = url
    a.download = `zreport-${dateLabel.replace(/\//g, '-')}.csv`
    a.click()
    notify('Ledger exported successfully', 'success')
  }

  return (
    <div className="zreport-hub-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .zreport-hub-root {
          --primary: #6366F1;
          --bg-main: #F4F7FE;
          --text-deep: #0F172A;
          --text-muted: #64748B;
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(226, 232, 240, 0.8);
          
          background: var(--bg-main);
          min-height: calc(100vh - 64px);
          margin: -24px;
          padding: 32px 40px;
          font-family: 'Outfit', sans-serif;
          color: var(--text-deep);
        }

        .hub-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }
        .header-title-box h1 {
          font-size: 36px;
          font-weight: 950;
          letter-spacing: -0.04em;
          margin: 0;
          color: var(--text-deep);
        }
        .header-breadcrumb {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        .premium-date-wrap {
            display: flex; align-items: center; gap: 12px; background: white;
            padding: 8px 16px; border-radius: 16px; border: 1px solid var(--glass-border);
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .premium-date-wrap input {
            border: none; outline: none; font-family: inherit; font-weight: 800; font-size: 14px; color: var(--text-deep);
        }

        /* Hero Card */
        .revenue-vault {
          background: linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%);
          color: white; border-radius: 40px; padding: 48px; position: relative;
          overflow: hidden; margin-bottom: 40px; box-shadow: 0 20px 50px -15px rgba(67, 56, 202, 0.4);
        }
        .vault-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; opacity: 0.7; margin-bottom: 12px; }
        .vault-value { font-size: 64px; font-weight: 950; letter-spacing: -0.05em; margin-bottom: 12px; }
        .vault-meta { font-size: 14px; font-weight: 600; opacity: 0.8; display: flex; align-items: center; gap: 8px; }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }
        .mini-stat {
          background: white; border-radius: 28px; padding: 24px; border: 1px solid var(--glass-border);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 16px;
        }
        .ms-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: #F8FAFC; color: var(--text-muted); }
        .ms-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; }
        .ms-value { font-size: 20px; font-weight: 900; letter-spacing: -0.02em; }

        /* Tables Grid */
        .ledger-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .ledger-card {
            background: white; border-radius: 32px; padding: 32px; border: 1px solid var(--glass-border);
            box-shadow: 0 10px 40px -15px rgba(0,0,0,0.05);
        }
        .ledger-title { font-size: 20px; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }

        .item-row { 
            display: flex; justify-content: space-between; align-items: center; padding: 16px 0;
            border-bottom: 1px solid #F1F5F9;
        }
        .item-row:last-child { border: none; }
        .item-name { font-weight: 800; font-size: 14px; color: var(--text-deep); }
        .item-val { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 800; color: var(--primary); }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-hub { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* Header */}
      <div className="hub-header animate-hub">
        <div className="header-title-box">
          <div className="header-breadcrumb">Financial Reconciliation</div>
          <h1>EOD Ledger</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
            <div className="premium-date-wrap">
               <Calendar size={18} color="var(--primary)" />
               <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>
            <button className="premium-btn primary" style={{ height: 48, borderRadius: 16, padding: '0 24px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }} onClick={exportCsv}>
               <Download size={18} /> Export Schema
            </button>
        </div>
      </div>

      {/* Vault Card */}
      <div className="revenue-vault animate-hub" style={{ animationDelay: '0.1s' }}>
          <div className="vault-label">Total Gross Pipeline — {dateLabel}</div>
          <div className="vault-value">{fmt(total, settings?.sym)}</div>
          <div className="vault-meta">
             <Activity size={18} /> {dayOrders.length} Transactional Nodes Processed
             <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={16} /> Optimized</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={16} /> Finalized</div>
             </div>
          </div>
          <TrendingUp size={160} style={{ position: 'absolute', right: -20, bottom: -40, opacity: 0.1, transform: 'rotate(-15deg)' }} />
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {[
          { label: 'Card Proceeds', value: fmt(card, settings?.sym), icon: <CreditCard size={18} />, color: '#6366F1' },
          { label: 'Cash Reserves', value: fmt(cash, settings?.sym), icon: <Banknote size={18} />, color: '#10B981' },
          { label: 'QR Payments', value: fmt(qr, settings?.sym), icon: <QrCode size={18} />, color: '#8B5CF6' },
          { label: 'Split Yield', value: fmt(split, settings?.sym), icon: <Scissors size={18} />, color: '#F59E0B' },
          { label: 'Fiscal Tax', value: fmt(tax, settings?.sym), icon: <Landmark size={18} />, color: '#64748B' },
          { label: 'Refund Vector', value: fmt(refunded, settings?.sym), icon: <RotateCcw size={18} />, color: '#EF4444' },
          { label: 'Net Liquidity', value: fmt(total - refunded, settings?.sym), icon: <Activity size={18} />, color: '#1E1B4B' },
          { label: 'Transaction Count', value: dayOrders.length, icon: <Users size={18} />, color: '#4F46E5' },
        ].map((s, idx) => (
          <div key={idx} className="mini-stat animate-hub" style={{ animationDelay: `${0.2 + idx * 0.05}s` }}>
             <div className="ms-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
             <div>
                <div className="ms-label">{s.label}</div>
                <div className="ms-value">{s.value}</div>
             </div>
          </div>
        ))}
      </div>

      {/* Leaderboards */}
      <div className="ledger-grid">
         <div className="ledger-card animate-hub" style={{ animationDelay: '0.6s' }}>
            <div className="ledger-title"><Package size={22} color="var(--primary)" /> High-Velocity Products</div>
            <div className="ledger-body">
               {Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([name, qty], i) => (
                 <div key={name} className="item-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', width: 20 }}>0{i+1}</span>
                       <span className="item-name">{name}</span>
                    </div>
                    <Badge t={t} text={`${qty} Units`} color="blue" style={{ fontWeight: 900, borderRadius: 8 }} />
                 </div>
               ))}
               {Object.keys(productSales).length === 0 && (
                 <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontWeight: 600 }}>Zero velocity detected.</div>
               )}
            </div>
         </div>

         <div className="ledger-card animate-hub" style={{ animationDelay: '0.7s' }}>
            <div className="ledger-title"><Terminal size={22} color="var(--primary)" /> Terminal Performance</div>
            <div className="ledger-body">
               {Object.entries(counterRev).sort((a, b) => b[1].rev - a[1].rev).map(([c, stats]) => (
                 <div key={c} className="item-row">
                    <span className="item-name">{c} Console</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                       <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>{stats.orders} Actions</span>
                       <span className="item-val">{fmt(stats.rev, settings?.sym)}</span>
                    </div>
                 </div>
               ))}
               {Object.keys(counterRev).length === 0 && (
                 <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontWeight: 600 }}>Consoles inactive.</div>
               )}
            </div>
         </div>
      </div>
    </div>
  )
}
