import { useState, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Modal } from '@/components/ui'
import { fmt } from '@/lib/utils'
import { notify } from './NotificationCenter'

export const ReceiptModal = ({ order, settings, onClose, onNewSale, t }) => {
  const [showDetails, setShowDetails] = useState(false)
  const receiptRef = useRef(null)

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${order?.id || order?.order_number || 'order'}`,
    pageStyle: '@page { size: 80mm auto; margin: 4mm; }',
  })

  const finalizeSale = () => {
    if (onNewSale) onNewSale()
    onClose()
  }

  const handlePrintAction = () => {
    handlePrint()
    notify('Receipt Printed ✅', 'success')
  }

  if (!order) return null

  const items = order.items || []
  const displayItems = showDetails ? items : items.slice(0, 2)
  const remainingCount = items.length - displayItems.length

  return (
    <Modal t={t} width={440} onClose={onClose} noPadding>
      <div className="digital-receipt-container" style={{ 
        padding: '32px 24px', 
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        
        {/* Success Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: '#ECFDF5', 
            color: '#10B981', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 16px',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.1)'
          }}>
            ✓
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#10B981', marginBottom: '8px' }}>Done</div>
          <div style={{ fontSize: '48px', fontWeight: 950, color: '#0F172A', letterSpacing: '-1.5px', marginBottom: '4px' }}>
            {fmt(order.total, settings?.sym)}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>
            Paid via {order.payment}{order.cardLast4 ? ` (****${order.cardLast4})` : ''}
          </div>
        </div>

        {/* Receipt Details Card */}
        <div style={{ 
          width: '100%', 
          background: '#F8FAFF', 
          borderRadius: '24px', 
          padding: '24px', 
          marginBottom: '24px',
          border: '1px solid #E2E8F0',
          position: 'relative',
          transition: 'all 0.3s'
        }}>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: 800, 
            color: '#94A3B8', 
            textTransform: 'uppercase', 
            letterSpacing: '1px',
            marginBottom: '16px',
            textAlign: 'left'
          }}>
            {items.length} Item{items.length !== 1 ? 's' : ''}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayItems.map((item, idx) => {
              const nameParts = item.name.split(' (');
              const mainName = nameParts[0];
              const variantText = nameParts.length > 1 ? `(${nameParts.slice(1).join(' (')}` : null;

              return (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  gap: '12px',
                  padding: '6px 0',
                  width: '100%'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', lineHeight: '1.2' }}>{mainName}</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>×{item.qty}</span>
                    </div>
                    {variantText && (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginTop: '2px', lineHeight: '1.4' }}>
                        {variantText}
                      </span>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 700, 
                    color: '#1E293B', 
                    textAlign: 'right',
                    minWidth: 'fit-content',
                    paddingTop: '1px'
                  }}>
                    {fmt(item.price * (1 - (item.discount || 0) / 100) * item.qty, settings?.sym)}
                  </div>
                </div>
              );
            })}
            
            {!showDetails && remainingCount > 0 && (
              <div style={{ textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#3730A3', marginTop: '4px' }}>
                +{remainingCount} more item{remainingCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowDetails(!showDetails)}
            style={{ 
              marginTop: '20px',
              width: '100%',
              padding: '12px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 800,
              color: '#3730A3',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            {showDetails ? 'Hide Receipt Details' : 'View Full Receipt'}
          </button>

          {/* Collapsible Content */}
          {showDetails && (
            <div style={{ 
              marginTop: '20px', 
              paddingTop: '20px', 
              borderTop: '1px dashed #CBD5E1', 
              textAlign: 'left',
              animation: 'slideDown 0.3s ease-out'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B' }}>
                  <span>Subtotal</span><span>{fmt(order.subtotal, settings?.sym)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B' }}>
                  <span>Tax</span><span>{fmt(order.tax, settings?.sym)}</span>
                </div>
                {order.couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#EF4444' }}>
                    <span>Discount</span><span>-{fmt(order.couponDiscount, settings?.sym)}</span>
                  </div>
                )}
                {order.loyaltyDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#3730A3' }}>
                    <span>Loyalty Used</span><span>-{fmt(order.loyaltyDiscount, settings?.sym)}</span>
                  </div>
                )}
              </div>
              
              <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                <div>Order: #{order.order_number || order.id}</div>
                <div>Date: {order.date}</div>
                <div>Staff: {order.cashierName}</div>
              </div>
            </div>
          )}
        </div>

        {/* Loyalty Reward Badge */}
        {order.loyaltyEarned > 0 && (
          <div style={{ 
            width: '100%',
            background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
            padding: '16px',
            borderRadius: '20px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            border: '1px solid #C7D2FE',
            boxShadow: '0 4px 12px rgba(55, 48, 163, 0.05)'
          }}>
            <span style={{ fontSize: '20px' }}>✨</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#3730A3' }}>
              +{order.loyaltyEarned} loyalty points earned
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={finalizeSale}
            style={{ 
              height: '72px', 
              background: '#3730A3', 
              color: '#FFFFFF', 
              border: 'none', 
              borderRadius: '20px', 
              fontSize: '18px', 
              fontWeight: 900, 
              cursor: 'pointer',
              boxShadow: '0 12px 24px rgba(55, 48, 163, 0.2)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            New Sale →
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handlePrintAction}
              style={{ 
                flex: 1,
                height: '60px', 
                background: '#FFFFFF', 
                color: '#1E293B', 
                border: '1px solid #E2E8F0', 
                borderRadius: '16px', 
                fontSize: '15px', 
                fontWeight: 800, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              Print Receipt
            </button>
            <button 
              style={{ 
                flex: 1,
                height: '60px', 
                background: '#FFFFFF', 
                color: '#1E293B', 
                border: '1px solid #E2E8F0', 
                borderRadius: '16px', 
                fontSize: '15px', 
                fontWeight: 800, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onClick={() => notify('Sharing option coming soon', 'info')}
            >
              Share / Email
            </button>
          </div>
        </div>

        {/* Hidden Print Wrapper (legacy layout for thermal printer) */}
        <div style={{ display: 'none' }}>
           <div ref={receiptRef} style={{ width: '80mm', padding: '4mm', fontFamily: 'monospace', fontSize: '12px', color: '#000' }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>{settings.storeName}</div>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>{settings.storeAddress}</div>
              <div style={{ borderBottom: '1px solid #000', margin: '5px 0' }} />
              <div>Order: {order.order_number || order.id}</div>
              <div>Date: {order.date}</div>
              <div style={{ borderBottom: '1px solid #000', margin: '5px 0' }} />
              {items.map((i, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{i.name} x{i.qty}</span>
                  <span>{fmt(i.price * (1 - (i.discount || 0) / 100) * i.qty, settings?.sym)}</span>
                </div>
              ))}
              <div style={{ borderBottom: '1px solid #000', margin: '5px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
                <span>TOTAL</span>
                <span>{fmt(order.total, settings?.sym)}</span>
              </div>
              <div style={{ borderBottom: '1px solid #000', margin: '5px 0' }} />
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', whiteSpace: 'pre-wrap' }}>{settings.receiptFooter || "Thank you!"}</div>
              {settings.returnPolicy && <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '9px', fontStyle: 'italic', borderTop: '1px dotted #000', paddingTop: '8px', color: '#666' }}>Return Policy: {settings.returnPolicy}</div>}
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </Modal>
  )
}
