import { useState } from 'react'
import dayjs from 'dayjs'
import { Btn, Badge, Card, StatCard } from '@/components/ui'
import { notify } from '@/components/shared'
import { fmt } from '@/lib/utils'

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
    notify('Z-Report exported!', 'success')
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
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>End-of-Day Z-Report</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ background: '#fff', border: `1px solid #e2e8f0`, borderRadius: 12, padding: '8px 12px', color: '#0f172a', fontSize: 13, outline: 'none', fontWeight: 700 }} />
          </div>
          <Btn t={t} onClick={exportCsv} style={{ borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 900, background: '#4f46e5', color: '#fff', border: 'none' }}>⬇ Export CSV</Btn>
        </div>
      </div>

      <div style={{ background: `linear-gradient(135deg,${t.accent},${t.accent2})`, borderRadius: 16, padding: 24, color: '#fff' }}>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Revenue Summary — {dateLabel}</div>
        <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2 }}>{fmt(total, settings?.sym)}</div>
        <div style={{ fontSize: 14, opacity: 0.75, marginTop: 4 }}>{dayOrders.length} transactions processed</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(180px,45vw),1fr))', gap: 14 }}>
        {[
          ['Card Sales', fmt(card, settings?.sym), t.blue, '💳'],
          ['Cash Sales', fmt(cash, settings?.sym), t.green, '💵'],
          ['QR Sales', fmt(qr, settings?.sym), t.purple, '📱'],
          ['Split Sales', fmt(split, settings?.sym), t.teal, '✂️'],
          ['Tax Collected', fmt(tax, settings?.sym), t.yellow, '🏛️'],
          ['Refunds', fmt(refunded, settings?.sym), t.red, '↩️'],
          ['Net Revenue', fmt(total - refunded, settings?.sym), t.accent, '💰'],
        ].map(([k, v, c, i]) => <StatCard key={k} t={t} title={k} value={v} color={c} icon={i} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="grid-2">
        <Card t={t}>
          <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 14 }}>Top Products</div>
          {Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, qty], i) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${t.border}`, fontSize: 13 }}>
              <span style={{ color: t.text }}>#{i + 1} {name}</span>
              <Badge t={t} text={`${qty} sold`} color="blue" />
            </div>
          ))}
          {Object.keys(productSales).length === 0 && (
            <div style={{ color: t.text3, fontSize: 13, textAlign: 'center', padding: 20 }}>No sales for this date</div>
          )}
        </Card>

        <Card t={t}>
          <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 14 }}>Counter Breakdown</div>
          {Object.entries(counterRev).sort((a, b) => b[1].rev - a[1].rev).map(([c, stats]) => (
            <div key={c} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${t.border}`, fontSize: 13 }}>
              <span style={{ color: t.text }}>{c}</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: t.text3 }}>{stats.orders} orders</span>
                <span style={{ fontWeight: 800, color: t.accent }}>{fmt(stats.rev, settings?.sym)}</span>
              </div>
            </div>
          ))}
          {Object.keys(counterRev).length === 0 && (
            <div style={{ color: t.text3, fontSize: 13, textAlign: 'center', padding: 20 }}>No counter data for this date</div>
          )}
        </Card>
      </div>
    </div>
  )
}
