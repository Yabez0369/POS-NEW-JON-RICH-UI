import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Modal } from '@/components/ui'
import { Btn } from '@/components/ui'
import { fmt } from '@/lib/utils'
import { notify } from './NotificationCenter'

export const ReceiptModal = ({ order, settings, onClose, onNewSale, t }) => {
  const receiptRef = useRef(null)
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${order?.id || order?.order_number || 'order'}`,
    pageStyle: '@page { size: 80mm auto; margin: 4mm; }',
  })

  const finalizeSale = () => {
    if (onNewSale) {
      onNewSale()
    }
    onClose()
  }

  const handlePrintAndNewSale = () => {
    handlePrint()
    notify('Receipt Printed ✅', 'success')
    // Wait a tiny bit to ensure the print capture happens before modal closes
    setTimeout(finalizeSale, 150)
  }

  return (
    <Modal t={t} width={460} onClose={onClose}>
      <div style={{ padding: '8px' }}>
        {/* Paper Receipt Simulation */}
        <div 
          ref={receiptRef} 
          style={{ 
            background: '#fffdf5', 
            borderRadius: '12px 12px 0 0', 
            padding: '44px 34px', 
            fontFamily: "'Inter', sans-serif", 
            boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
            position: 'relative',
            color: '#1a1a1a',
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          {/* Subtle paper texture overlay */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none', background: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
          
          <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative' }}>
            <div style={{ 
              fontSize: 26, 
              fontWeight: 950, 
              letterSpacing: -0.5, 
              marginBottom: 4,
              color: '#000'
            }}>{settings.storeName || "SCSTix EPOS"}</div>
            <div style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>{settings.storeAddress}</div>
            <div style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>{settings.storePhone}</div>
            
            <div style={{ margin: '22px 0', borderTop: '1px dashed #ccc', paddingTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, fontWeight: 500, color: '#777' }}>
                <span>Order No: {order.order_number || order.id}</span>
                <span>{order.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 500, color: '#777' }}>
                <span>Counter: {order.counter || 'Counter 1'}</span>
                <span>Staff: {order.cashierName || 'Cashier User'}</span>
              </div>
              {order.customerName && order.customerName !== 'Walk-in' && (
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 10, textAlign: 'left', color: '#333' }}>
                  Customer: <span style={{ color: '#000' }}>{order.customerName}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '16px 0', marginBottom: 20 }}>
            {order.items.map((i, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: '#000' }}>
                  <span>{i.name} × {i.qty}</span>
                  <span>{fmt(i.price * (1 - (i.discount || 0) / 100) * i.qty, settings?.sym)}</span>
                </div>
                {i.discount > 0 && (
                  <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, marginTop: 2 }}>
                    Disc: -{i.discount}% off {fmt(i.price, settings?.sym)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Subtotal', fmt(order.subtotal, settings?.sym)],
              ['Tax', fmt(order.tax, settings?.sym)],
              order.deliveryCharge > 0 && ['Delivery', fmt(order.deliveryCharge, settings?.sym)],
              order.couponDiscount > 0 && [`Discount`, `-${fmt(order.couponDiscount, settings?.sym)}`],
              order.loyaltyDiscount > 0 && ['Loyalty Used', `-${fmt(order.loyaltyDiscount, settings?.sym)}`]
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#666', fontWeight: 500 }}>
                <span>{k}</span>
                <span>{v}</span>
              </div>
            ))}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: 950, 
              fontSize: 24, 
              borderTop: '2px solid #1a1a1a', 
              marginTop: 14, 
              paddingTop: 14,
              color: '#000'
            }}>
              <span>TOTAL</span>
              <span>{fmt(order.total, settings?.sym)}</span>
            </div>

            <div style={{ marginTop: 16, fontSize: 13, background: '#f8f9fa', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#666' }}>Payment Method</span>
                <span style={{ fontWeight: 800 }}>{order.payment}{order.cardLast4 ? ` (****${order.cardLast4})` : ''}</span>
              </div>
              {order.payment === 'Cash' && order.cashGiven != null && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ color: '#666' }}>Tendered</span>
                    <span>{fmt(order.cashGiven, settings?.sym)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#10b981' }}>
                    <span>Change</span>
                    <span>{fmt(order.cashChange, settings?.sym)}</span>
                  </div>
                </>
              )}
            </div>

            {order.loyaltyEarned > 0 && (
              <div style={{ 
                marginTop: 20, 
                background: '#fef3c7', 
                border: '1px solid #f59e0b',
                padding: '10px', 
                borderRadius: '8px',
                fontSize: 13, 
                textAlign: 'center', 
                fontWeight: 800,
                color: '#92400e'
              }}>
                ⭐ +{order.loyaltyEarned} loyalty points earned!
              </div>
            )}
          </div>

          <div style={{ 
            textAlign: 'center', 
            marginTop: 36, 
            fontSize: 12, 
            color: '#777', 
            borderTop: '1px dashed #ccc', 
            paddingTop: 20,
            fontStyle: 'italic'
          }}>
            {settings.receiptFooter || "Thank you for shopping at SCSTix EPOS!"}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button 
            onClick={onClose} 
            style={{ 
              flex: 1, height: 60, borderRadius: 14, border: `1px solid ${t.border}`, 
              background: '#fff', color: t.text, fontWeight: 800, fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
            ✕ Close
          </button>
          
          <button 
            onClick={handlePrintAndNewSale}
            style={{ 
              flex: 1, height: 60, borderRadius: 14, border: 'none', 
              background: '#f1f1f1', color: '#111', fontWeight: 800, fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 2px 10px rgba(0,255,0,0.05)'
            }}>
            🖨️ Print
          </button>
        </div>

        <button 
          onClick={finalizeSale} 
          style={{ 
            width: '100%', height: 66, marginTop: 12, borderRadius: 16, border: 'none', 
            background: t.accent || '#1a1a1a', color: '#fff', fontWeight: 900, fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: `0 8px 24px ${t.accent}40`, transition: 'transform 0.2s ease'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          New Sale →
        </button>
      </div>
    </Modal>
  )
}
