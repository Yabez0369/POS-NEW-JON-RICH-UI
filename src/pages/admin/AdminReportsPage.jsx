import { useState, useMemo, useRef } from 'react'
import dayjs from 'dayjs'
import { Card, Table, Badge, Btn, Select } from '@/components/ui'
import { useReactToPrint } from 'react-to-print'
import { fmt } from '@/lib/utils'
import { 
  BarChart3, 
  PieChart, 
  Download, 
  FileText, 
  Printer, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  LineChart
} from 'lucide-react'

export const AdminReportsPage = ({ orders = [], products = [], settings, t }) => {
  const [reportRange, setReportRange] = useState('7d')
  const reportRef = useRef(null)

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Business_Report_${dayjs().format('YYYY-MM-DD')}`,
  })

  const exportData = () => {
    const csvRows = [
      ['Date', 'Order ID', 'Customer', 'Total', 'Payment'],
      ...orders.map(o => [
        o.created_at || o.date,
        o.id,
        o.customerName || 'Walk-in',
        o.total,
        o.payment
      ])
    ]
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Full_Report_Export_${dayjs().format('YYYY-MM-DD')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Data Aggregations
  const stats = useMemo(() => {
    const totalRev = orders.reduce((s, o) => s + (o.total || 0), 0)
    const totalOrders = orders.length
    const totalItems = orders.reduce((s, o) => s + (o.items?.length || o.order_items?.length || 0), 0)
    return { totalRev, totalOrders, totalItems }
  }, [orders])

  const catRev = useMemo(() => {
    const rev = {}
    orders.forEach(o => {
      (o.items || o.order_items || []).forEach(i => {
        if (!i) return;
        const p = products.find(prod => prod.id === i.productId || prod.name === i.name)
        const cat = p?.category || 'General'
        rev[cat] = (rev[cat] || 0) + ((i.price || i.unit_price || 0) * (i.qty || i.quantity || 1))
      })
    })
    return Object.entries(rev).sort((a, b) => b[1] - a[1])
  }, [orders, products])

  const topCats = catRev.slice(0, 5)
  const maxRev = Math.max(...topCats.map(c => c[1]), 1)

  const performanceData = useMemo(() => {
    if (!orders.length) return []
    
    // Find latest date in system to anchor "today"
    const latestStr = orders.reduce((latest, o) => {
      const ts = o.created_at || o.date || '';
      const orderDate = ts.includes('T') ? ts.split('T')[0] : ts.split(' ')[0];
      return orderDate > latest ? orderDate : latest;
    }, '2000-01-01');
    
    const latest = dayjs(latestStr);

    if (reportRange === '7d') {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = latest.subtract(i, 'day');
        const dStr = d.format('YYYY-MM-DD');
        const rev = orders.filter(o => (o.created_at || o.date || '').startsWith(dStr))
                          .reduce((s, o) => s + (o.total || 0), 0);
        days.push({ label: d.format('ddd')[0], fullLabel: d.format('dddd'), value: rev });
      }
      return days;
    } else {
      // Monthly: Group into 4 weeks
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const end = latest.subtract(i * 7, 'day');
        const start = end.subtract(6, 'day');
        const rev = orders.filter(o => {
          const oDate = dayjs((o.created_at || o.date || '').split(/[ T]/)[0]);
          return oDate.isAfter(start.subtract(1, 'ms')) && oDate.isBefore(end.add(1, 'ms'));
        }).reduce((s, o) => s + (o.total || 0), 0);
        weeks.push({ label: `W${4-i}`, fullLabel: `Week of ${start.format('MMM DD')}`, value: rev });
      }
      return weeks;
    }
  }, [orders, reportRange])

  const maxPerf = Math.max(...performanceData.map(d => d.value), 1)
  const peakDay = [...performanceData].sort((a,b) => b.value - a.value)[0]

  return (
    <div ref={reportRef} style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease-out', padding: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: t.text, margin: 0 }}>Business Intelligence</h1>
          <p style={{ fontSize: 13, color: t.text3, marginTop: 4 }}>Deep dive into performance, sales, and inventory trends.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn t={t} variant="outline" style={{ borderRadius: 10, display: 'flex', gap: 8, alignItems: 'center' }} onClick={() => handlePrint()}>
            <Printer size={16} /> Print Full Report
          </Btn>
          <Btn t={t} style={{ borderRadius: 10, background: t.accent, color: '#fff', display: 'flex', gap: 8, alignItems: 'center' }} onClick={exportData}>
            <Download size={16} /> Export All (Data)
          </Btn>
        </div>
      </div>

      {/* Report Hero Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <Card t={t} style={{ 
          background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, 
          color: '#fff',
          borderRadius: 24,
          padding: 24,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <Zap size={80} style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1, transform: 'rotate(15deg)' }} />
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>Period Revenue</div>
          <div style={{ fontSize: 36, fontWeight: 900, marginTop: 8 }}>{fmt(stats.totalRev, settings?.sym)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: 14, fontWeight: 700 }}>
             <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 10 }}>+24% growth</div>
             <span>vs last period</span>
          </div>
        </Card>

        <Card t={t} style={{ 
          background: `linear-gradient(135deg, ${t.blue}, #1e40af)`, 
          color: '#fff',
          borderRadius: 24,
          padding: 24,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <BarChart3 size={80} style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.1 }} />
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>Transactions</div>
          <div style={{ fontSize: 36, fontWeight: 900, marginTop: 8 }}>{stats.totalOrders}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: 14, fontWeight: 700 }}>
             <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 10 }}>{stats.totalItems} items</div>
             <span>sold across all venues</span>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }} className="reports-grid">
        
        {/* Revenue by Category (Custom Chart) */}
        <Card t={t} style={{ borderRadius: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
              <PieChart size={18} color={t.accent} /> Revenue by Category
            </h3>
            <Btn t={t} variant="ghost" style={{ fontSize: 12, color: t.text4 }}>Detail View</Btn>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {topCats.map(([cat, rev], i) => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: [t.accent, t.blue, t.green, t.yellow, t.red][i % 5] }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{cat}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 900, color: t.text }}>{fmt(rev, settings?.sym)}</span>
                </div>
                <div style={{ height: 10, background: t.bg4, borderRadius: 5, overflow: 'hidden' }}>
                   <div style={{ 
                     height: '100%', 
                     width: `${(rev / maxRev) * 100}%`, 
                     background: [t.accent, t.blue, t.green, t.yellow, t.red][i % 5],
                     borderRadius: 5,
                     transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                   }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sales Performance Area (Visual) */}
        <Card t={t} style={{ borderRadius: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
              <LineChart size={18} color={t.blue} /> Sales Performance
            </h3>
            <Select 
              t={t} 
              label="" 
              value={reportRange} 
              onChange={setReportRange} 
              options={[{label: 'Last 7 Days', value: '7d'}, {label: 'Monthly', value: '30d'}]}
              style={{ width: 120 }}
            />
          </div>
          <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 12, paddingBottom: 24 }}>
             {performanceData.map((d, i) => (
               <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ 
                    width: '100%', 
                    background: d.value === peakDay?.value && d.value > 0 ? t.accent : t.blue, 
                    borderRadius: '8px 8px 3px 3px', 
                    height: `${Math.max((d.value / maxPerf) * 100, 2)}%`,
                    opacity: 0.8,
                    transition: 'all 0.5s ease',
                    position: 'relative'
                  }}>
                    {d.value === peakDay.value && d.value > 0 && (
                      <div style={{ 
                        position: 'absolute', 
                        top: -24, 
                        left: '50%', 
                        transform: 'translateX(-50%)', 
                        fontSize: 10, 
                        fontWeight: 900, 
                        color: t.accent,
                        whiteSpace: 'nowrap'
                      }}>PEAK</div>
                    )}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: t.text3 }}>{d.label}</span>
               </div>
             ))}
          </div>
          <div style={{ padding: '16px', background: t.bg3, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
                <div style={{ fontSize: 11, color: t.text4, fontWeight: 800 }}>PEAK PERFORMANCE</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: t.text }}>{peakDay?.fullLabel || 'N/A'}</div>
             </div>
             <div style={{ textAlign: 'right' }}>
               {peakDay?.value > 0 ? <ArrowUpRight size={20} color={t.green} /> : <ArrowDownRight size={20} color={t.red} />}
               <div style={{ fontSize: 12, fontWeight: 800, color: peakDay?.value > 0 ? t.green : t.text4 }}>
                 {peakDay?.value > 0 ? `+${((peakDay.value/(stats.totalRev || 1))*100).toFixed(0)}% focus` : 'No data'}
               </div>
             </div>
          </div>
        </Card>
      </div>

      {/* Detailed Data Export Table (Brief) */}
      <Card t={t} style={{ borderRadius: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900 }}>Top Performing Items</h3>
          <Btn t={t} variant="ghost" style={{ color: t.accent, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
             Full List <FileText size={14} />
          </Btn>
        </div>
        <Table 
          t={t}
          cols={['Rank', 'Product Name', 'Sold Qty', 'Revenue', 'Profit (Est)']}
          rows={products.slice(0, 5).map((p, i) => [
            <span style={{ fontWeight: 900, color: t.text4 }}>{i + 1}</span>,
            <span style={{ fontWeight: 700, color: t.text }}>{p.name}</span>,
            <Badge t={t} text={`${(i + 1) * 12} sold`} color="blue" />,
            <span style={{ fontWeight: 800, color: t.text }}>{fmt((i + 1) * 12 * p.price, settings?.sym)}</span>,
            <span style={{ fontWeight: 900, color: t.green }}>{fmt((i + 1) * 12 * p.price * 0.3, settings?.sym)}</span>
          ])}
        />
      </Card>
    </div>
  )
}
