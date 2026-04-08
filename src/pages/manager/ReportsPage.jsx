import { useState } from 'react'
import dayjs from 'dayjs'
import { Btn, Badge, Card, StatCard, Select } from '@/components/ui'
import { notify } from '@/components/shared'
import { fmt } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const exportCsvHelper = (filename, headers, rows) => {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
  const b = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(b)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  notify('Report exported as CSV!', 'success')
}

function getOrderItems(o) {
  const items = o?.items || o?.order_items || []
  return Array.isArray(items) ? items : []
}

function itemName(i) { return i?.product_name || i?.name || 'Unknown' }
function itemQty(i) { return i?.quantity ?? i?.qty ?? 0 }
function itemPrice(i) { return i?.unit_price ?? i?.price ?? 0 }

export const ReportsPage = ({ orders = [], users = [], products = [], t, settings }) => {
  const { currentUser } = useAuth()
  const isManager = currentUser?.role === 'manager'

  // Card-aware colors: light text for dark manager cards, theme tokens for normal cards
  const c = isManager ? {
    text: '#0F172A', text2: '#334155', text3: '#64748B', text4: '#94A3B8',
    accent: '#0D9488', border: 'rgba(0,0,0,0.06)', bg3: 'rgba(0,0,0,0.03)',
    bg4: 'rgba(0,0,0,0.05)', green: '#10B981', red: '#EF4444', yellow: '#F59E0B',
    blue: '#3B82F6', input: '#FFFFFF',
  } : {
    text: t.text, text2: t.text2, text3: t.text3, text4: t.text4,
    accent: t.accent, border: t.border, bg3: t.bg3, bg4: t.bg4,
    green: t.green, red: t.red, yellow: t.yellow, blue: t.blue, input: t.input,
  }

  const [activeReport, setActiveReport] = useState('sales-category')
  const [dateFrom, setDateFrom] = useState(dayjs().subtract(30, 'day').format('YYYY-MM-DD'))
  const [dateTo, setDateTo] = useState(dayjs().format('YYYY-MM-DD'))

  const filtered = (Array.isArray(orders) ? orders : []).filter(o => {
    const dateStr = o.date || o.created_at
    if (!dateStr) return true
    const d = dayjs(dateStr).isValid() ? dayjs(dateStr) : dayjs(dateStr, 'DD/MM/YYYY, HH:mm:ss')
    return d.isValid() && d.isAfter(dayjs(dateFrom).subtract(1, 'day')) && d.isBefore(dayjs(dateTo).add(1, 'day'))
  })

  const totalRev = filtered.reduce((s, o) => s + (o.total ?? 0), 0)
  const colors = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0d9488']

  const reports = [
    { id: 'sales-category', label: '📊 Sales by Category' },
    { id: 'sales-product', label: '📦 Sales by Product' },
    { id: 'sales-counter', label: '🏪 Sales by Counter' },
    { id: 'sales-operator', label: '👤 Sales by Operator' },
    { id: 'returns', label: '↩️ Returns Summary' },
    { id: 'stock', label: '📦 Stock Report' },
    { id: 'discounts', label: '🏷️ Discount/Coupon Usage' },
    { id: 'cash-recon', label: '💰 Cash Reconciliation' },
  ]

  const catRev = {}
  filtered.forEach(o => {
    getOrderItems(o).forEach(i => {
      const name = itemName(i)
      const p = (products || []).find(x => x.name === name)
      const cat = p?.category || 'Other'
      catRev[cat] = (catRev[cat] || 0) + itemPrice(i) * itemQty(i)
    })
  })
  const totalCatRev = Object.values(catRev).reduce((s, v) => s + v, 0)

  const productSales = {}
  filtered.forEach(o => {
    getOrderItems(o).forEach(i => {
      const name = itemName(i)
      if (!productSales[name]) productSales[name] = { qty: 0, rev: 0 }
      productSales[name].qty += itemQty(i)
      productSales[name].rev += itemPrice(i) * itemQty(i)
    })
  })
  const topProducts = Object.entries(productSales).sort((a, b) => b[1].rev - a[1].rev)

  const counterRev = {}
  filtered.forEach(o => {
    const c = o.counter || 'Unknown'
    if (!counterRev[c]) counterRev[c] = { orders: 0, rev: 0 }
    counterRev[c].orders++
    counterRev[c].rev += o.total ?? 0
  })

  const operatorPerf = {}
  filtered.forEach(o => {
    const name = o.cashier_name || o.cashierName || 'Unknown'
    if (!operatorPerf[name]) operatorPerf[name] = { orders: 0, rev: 0 }
    operatorPerf[name].orders++
    operatorPerf[name].rev += o.total ?? 0
  })
  const sortedOperators = Object.entries(operatorPerf).sort((a, b) => b[1].rev - a[1].rev)

  const returnOrders = filtered.filter(o => o.status === 'refunded')
  const discountOrders = filtered.filter(o => (o.discount_amount ?? o.discountAmt ?? 0) > 0 || (o.couponDiscount ?? 0) > 0)

  const cashOrders = filtered.filter(o => (o.payment_method || o.payment) === 'Cash' || (o.payment_method || o.payment) === 'Split')
  const cashReceived = cashOrders.reduce((s, o) => s + ((o.payment_method || o.payment) === 'Cash' ? (o.payment_details?.cash_given ?? o.cashGiven ?? 0) : (o.payment_details?.split_cash ?? o.splitCash ?? 0)), 0)
  const cashChangeGiven = cashOrders.reduce((s, o) => s + (o.payment_details?.cash_change ?? o.cashChange ?? 0), 0)
  const cashSales = cashOrders.reduce((s, o) => s + (o.total ?? 0), 0)
  const cashRefunds = returnOrders.filter(o => (o.payment_method || o.payment) === 'Cash').reduce((s, o) => s + (o.total ?? 0), 0)

  const handleExport = () => {
    if (activeReport === 'sales-category') {
      exportCsvHelper('sales-by-category.csv', ['Category', 'Revenue', '% Share'], Object.entries(catRev).map(([cat, rev]) => [cat, rev.toFixed(2), totalCatRev > 0 ? (rev / totalCatRev * 100).toFixed(1) + '%' : '0%']))
    } else if (activeReport === 'sales-product') {
      exportCsvHelper('sales-by-product.csv', ['Product', 'Qty Sold', 'Revenue'], topProducts.map(([name, s]) => [name, s.qty, s.rev.toFixed(2)]))
    } else if (activeReport === 'sales-counter') {
      exportCsvHelper('sales-by-counter.csv', ['Counter', 'Orders', 'Revenue'], Object.entries(counterRev).map(([c, s]) => [c, s.orders, s.rev.toFixed(2)]))
    } else if (activeReport === 'sales-operator') {
      exportCsvHelper('sales-by-operator.csv', ['Operator', 'Orders', 'Revenue'], sortedOperators.map(([name, s]) => [name, s.orders, s.rev.toFixed(2)]))
    } else if (activeReport === 'returns') {
      exportCsvHelper('returns-summary.csv', ['Order ID', 'Total', 'Date', 'Counter', 'Cashier'], returnOrders.map(o => [o.order_number || o.id, (o.total ?? 0).toFixed(2), o.date || o.created_at, o.counter || 'Unknown', o.cashier_name || o.cashierName || 'Unknown']))
    } else if (activeReport === 'stock') {
      exportCsvHelper('stock-report.csv', ['Product', 'Category', 'Stock', 'Status'], (products || []).map(p => [p.name, p.category || 'Other', p.stock ?? 0, (p.stock ?? 0) === 0 ? 'Out' : (p.stock ?? 0) < 15 ? 'Low' : 'OK']))
    } else if (activeReport === 'discounts') {
      const couponUse = {}
      discountOrders.forEach(o => {
        const code = o.coupon_code || o.couponCode
        if (code) {
          if (!couponUse[code]) couponUse[code] = { count: 0, savings: 0 }
          couponUse[code].count++
          couponUse[code].savings += o.couponDiscount ?? 0
        }
      })
      const totalDiscountAmt = discountOrders.reduce((sum, o) => sum + (o.discount_amount ?? o.discountAmt ?? 0) + (o.couponDiscount ?? 0), 0)
      const rows = [...Object.entries(couponUse).map(([code, s]) => ['Coupon', code, s.count, s.savings.toFixed(2)])]
      if (rows.length === 0) rows.push(['Discount', 'N/A', discountOrders.length, totalDiscountAmt.toFixed(2)])
      else rows.push(['Total Discounts', 'All', discountOrders.length, totalDiscountAmt.toFixed(2)])
      exportCsvHelper('discount-coupon-usage.csv', ['Type', 'Code', 'Count', 'Amount'], rows)
    } else if (activeReport === 'cash-recon') {
      exportCsvHelper('cash-reconciliation.csv', ['Metric', 'Amount'], [
        ['Cash Sales', cashSales.toFixed(2)],
        ['Cash Received', cashReceived.toFixed(2)],
        ['Change Given', cashChangeGiven.toFixed(2)],
        ['Cash Refunds', cashRefunds.toFixed(2)],
        ['Net Cash', (cashSales - cashRefunds).toFixed(2)]
      ])
    } else {
      exportCsvHelper('orders-report.csv', ['Order ID', 'Customer', 'Total', 'Payment', 'Date', 'Counter', 'Status'], filtered.map(o => [o.order_number || o.id, o.customer_name || o.customerName || 'Walk-in', o.total ?? 0, o.payment_method || o.payment || 'N/A', o.date || o.created_at, o.counter || 'Unknown', o.status]))
    }
  }

  return (
    <div style={{
      background: 'transparent',
      minHeight: '100%', padding: '24px', borderRadius: 24,
      display: 'flex', flexDirection: 'column', gap: 20
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: t.text }}>Sales Reports & Analytics</div>
        <Btn t={t} onClick={handleExport}>⬇ Export CSV</Btn>
      </div>

      <Card t={t}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 15, color: c.text3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ background: c.input, border: `1px solid ${c.border}`, borderRadius: 9, padding: '8px 12px', color: c.text, fontSize: 17, outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 15, color: c.text3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ background: c.input, border: `1px solid ${c.border}`, borderRadius: 9, padding: '8px 12px', color: c.text, fontSize: 17, outline: 'none' }} />
          </div>
          <div style={{ fontSize: 16, color: c.text3, padding: '8px 0' }}>{filtered.length} orders · {fmt(totalRev, settings?.sym)} revenue</div>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {reports.map(r => (
          <button key={r.id} onClick={() => setActiveReport(r.id)} style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${activeReport === r.id ? t.accent : t.border}`, background: activeReport === r.id ? t.accent + '15' : 'transparent', color: activeReport === r.id ? t.accent : t.text3, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            {r.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="grid-2">
        {activeReport === 'sales-category' && (
          <>
            <Card t={t}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 16 }}>Revenue by Category</div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                  <svg viewBox="0 0 42 42" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    {Object.entries(catRev).reduce((acc, [cat, rev], i) => {
                      const pct = totalCatRev > 0 ? rev / totalCatRev * 100 : 0
                      const prev = acc.offset
                      acc.offset += pct
                      acc.els.push(<circle key={cat} cx="21" cy="21" r="15.9" fill="none" stroke={colors[i % colors.length]} strokeWidth="5" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={100 - prev} />)
                      return acc
                    }, { offset: 0, els: [] }).els}
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <div style={{ fontSize: 14, color: c.text3, fontWeight: 700 }}>TOTAL</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>{fmt(totalCatRev, settings?.sym)}</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {Object.entries(catRev).map(([cat, rev], i) => (
                    <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: colors[i % colors.length], flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, marginBottom: 2 }}>
                          <span style={{ color: c.text2 }}>{cat}</span>
                          <span style={{ fontWeight: 800, color: c.text }}>{fmt(rev, settings?.sym)}</span>
                        </div>
                        <div style={{ height: 4, background: c.bg4, borderRadius: 2 }}>
                          <div style={{ height: '100%', width: `${totalCatRev > 0 ? (rev / totalCatRev) * 100 : 0}%`, background: colors[i % colors.length], borderRadius: 2 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            <Card t={t}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 16 }}>Category Breakdown</div>
              {Object.entries(catRev).sort((a, b) => b[1] - a[1]).map(([cat, rev], i) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${c.border}`, fontSize: 17 }}>
                  <span style={{ color: c.text }}>{cat}</span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ color: c.text3 }}>{totalCatRev > 0 ? (rev / totalCatRev * 100).toFixed(1) : 0}%</span>
                    <span style={{ fontWeight: 800, color: c.accent }}>{fmt(rev, settings?.sym)}</span>
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}

        {activeReport === 'sales-product' && (
          <>
            <Card t={t}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 16 }}>🏆 Top Products by Revenue</div>
              {topProducts.slice(0, 10).map(([name, stats], i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${c.border}` }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: i < 3 ? '#fef9c3' : c.bg3, border: `2px solid ${i < 3 ? '#f59e0b' : c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#d97706', flexShrink: 0 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: c.text }}>{name}</div>
                    <div style={{ fontSize: 15, color: c.text3 }}>{stats.qty} sold</div>
                  </div>
                  <span style={{ fontWeight: 800, color: c.accent }}>{fmt(stats.rev, settings?.sym)}</span>
                </div>
              ))}
            </Card>
            <Card t={t}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 16 }}>Product Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCard t={t} title="Unique Products Sold" value={topProducts.length} color={t.blue} icon="📦" />
                <StatCard t={t} title="Total Units Sold" value={topProducts.reduce((s, [, st]) => s + st.qty, 0)} color={t.green} icon="🔢" />
              </div>
            </Card>
          </>
        )}

        {activeReport === 'sales-counter' && (
          <>
            {Object.entries(counterRev).map(([counter, stats]) => {
              const pct = totalRev > 0 ? Math.round(stats.rev / totalRev * 100) : 0
              return (
                <Card t={t} key={counter}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 12 }}>🏪 {counter}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div style={{ background: c.bg3, borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: c.accent }}>{fmt(stats.rev, settings?.sym)}</div>
                      <div style={{ fontSize: 14, color: c.text3 }}>Revenue</div>
                    </div>
                    <div style={{ background: c.bg3, borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: c.blue }}>{stats.orders}</div>
                      <div style={{ fontSize: 14, color: c.text3 }}>Orders</div>
                    </div>
                  </div>
                  <div style={{ height: 6, background: c.bg4, borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: c.accent, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 14, color: c.text4, marginTop: 4 }}>{pct}% of total revenue</div>
                </Card>
              )
            })}
          </>
        )}

        {activeReport === 'sales-operator' && (
          <>
            <Card t={t}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 16 }}>🏆 Operator Leaderboard</div>
              {sortedOperators.map(([name, stats], i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${c.border}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? '#fef9c3' : i === 1 ? '#f1f5f9' : c.bg3, border: `2px solid ${i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 900, color: i === 0 ? '#d97706' : c.text3 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: c.text }}>{name}</div>
                    <div style={{ fontSize: 15, color: c.text3 }}>{stats.orders} orders</div>
                  </div>
                  <div style={{ fontSize: 19, fontWeight: 900, color: c.accent }}>{fmt(stats.rev, settings?.sym)}</div>
                </div>
              ))}
            </Card>
            <Card t={t}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 16 }}>Operator Stats</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCard t={t} title="Operators" value={sortedOperators.length} color={t.blue} icon="👤" />
                <StatCard t={t} title="Avg Revenue" value={fmt(sortedOperators.length > 0 ? totalRev / sortedOperators.length : 0, settings?.sym)} color={t.green} icon="📊" />
              </div>
            </Card>
          </>
        )}

        {activeReport === 'returns' && (
          <>
            <Card t={t}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 16 }}>↩️ Returns Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCard t={t} title="Refunded Orders" value={returnOrders.length} color={t.red} icon="↩️" />
                <StatCard t={t} title="Refund Total" value={fmt(returnOrders.reduce((s, o) => s + o.total, 0), settings?.sym)} color={t.yellow} icon="💸" />
              </div>
              {returnOrders.length === 0 && <div style={{ color: c.text3, fontSize: 17, padding: '20px 0', textAlign: 'center' }}>No returns in this period</div>}
            </Card>
            <Card t={t}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 16 }}>Return Rate</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: c.accent, textAlign: 'center', padding: '20px 0' }}>
                {filtered.length > 0 ? (returnOrders.length / filtered.length * 100).toFixed(1) : 0}%
              </div>
              <div style={{ fontSize: 16, color: c.text3, textAlign: 'center' }}>of all orders returned</div>
            </Card>
          </>
        )}

        {activeReport === 'stock' && (
          <>
            <Card t={t}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 16 }}>📦 Stock Overview</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCard t={t} title="Total Products" value={(products || []).length} color={t.blue} icon="📦" />
                <StatCard t={t} title="Total Units" value={(products || []).reduce((s, p) => s + (p.stock ?? 0), 0)} color={t.green} icon="🔢" />
                <StatCard t={t} title="Low Stock" value={(products || []).filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 15).length} color={t.yellow} icon="⚠️" />
                <StatCard t={t} title="Out of Stock" value={(products || []).filter(p => (p.stock ?? 0) === 0).length} color={t.red} icon="❌" />
              </div>
            </Card>
            <Card t={t}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 16 }}>⚠️ Critical Stock Items</div>
              {(products || []).filter(p => (p.stock ?? 0) < 15).sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0)).slice(0, 10).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: 17, color: c.text }}>{p.emoji} {p.name}</span>
                  <Badge t={t} text={`${p.stock ?? 0} units`} color={(p.stock ?? 0) === 0 ? 'red' : (p.stock ?? 0) < 5 ? 'red' : 'yellow'} />
                </div>
              ))}
              {(products || []).filter(p => (p.stock ?? 0) < 15).length === 0 && <div style={{ color: c.green, fontSize: 17 }}>✅ All stock levels healthy</div>}
            </Card>
          </>
        )}

        {activeReport === 'cash-recon' && (
          <>
            <Card t={t}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 16 }}>💰 Cash Reconciliation</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCard t={t} title="Cash Sales" value={fmt(cashSales, settings?.sym)} color={t.green} icon="💵" />
                <StatCard t={t} title="Cash Received" value={fmt(cashReceived, settings?.sym)} color={t.blue} icon="📥" />
                <StatCard t={t} title="Change Given" value={fmt(cashChangeGiven, settings?.sym)} color={t.yellow} icon="🔄" />
                <StatCard t={t} title="Cash Refunds" value={fmt(cashRefunds, settings?.sym)} color={t.red} icon="↩️" />
                <StatCard t={t} title="Net Cash" value={fmt(cashSales - cashRefunds, settings?.sym)} color={t.accent} icon="💰" />
              </div>
            </Card>
            <Card t={t}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 16 }}>Cash Transaction Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${c.border}`, fontSize: 17 }}>
                  <span style={{ color: c.text }}>Cash & Split Orders</span>
                  <span style={{ fontWeight: 800, color: c.text }}>{cashOrders.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${c.border}`, fontSize: 17 }}>
                  <span style={{ color: c.text }}>Expected in Drawer</span>
                  <span style={{ fontWeight: 800, color: c.accent }}>{fmt(cashReceived - cashChangeGiven - cashRefunds, settings?.sym)}</span>
                </div>
              </div>
            </Card>
          </>
        )}

        {activeReport === 'discounts' && (
          <>
            <Card t={t}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 16 }}>🏷️ Discount/Coupon Usage</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCard t={t} title="Discounted Orders" value={discountOrders.length} color={t.yellow} icon="🏷️" />
                <StatCard t={t} title="Total Discounts" value={fmt(discountOrders.reduce((s, o) => s + (o.discountAmt || 0) + (o.couponDiscount || 0), 0), settings?.sym)} color={t.accent} icon="💸" />
              </div>
            </Card>
            <Card t={t}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 16 }}>Coupon Breakdown</div>
              {(() => {
                const couponUse = {}
                discountOrders.forEach(o => {
                  if (o.couponCode) {
                    if (!couponUse[o.couponCode]) couponUse[o.couponCode] = { count: 0, savings: 0 }
                    couponUse[o.couponCode].count++
                    couponUse[o.couponCode].savings += o.couponDiscount || 0
                  }
                })
                const entries = Object.entries(couponUse)
                if (entries.length === 0) return <div style={{ color: c.text3, fontSize: 17, textAlign: 'center', padding: 20 }}>No coupon usage in this period</div>
                return entries.map(([code, s]) => (
                  <div key={code} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${c.border}`, fontSize: 17 }}>
                    <div>
                      <span style={{ fontWeight: 800, fontFamily: 'monospace', color: c.text }}>{code}</span>
                      <span style={{ fontSize: 15, color: c.text3, marginLeft: 8 }}>Used {s.count}×</span>
                    </div>
                    <span style={{ fontWeight: 800, color: c.accent }}>{fmt(s.savings, settings?.sym)} saved</span>
                  </div>
                ))
              })()}
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
