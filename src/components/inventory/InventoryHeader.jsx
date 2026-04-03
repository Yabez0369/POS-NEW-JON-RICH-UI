import { useNavigate } from 'react-router-dom'
import { Btn } from '@/components/ui'

export function InventoryHeader({ title, t, activePage, onGoodsReceiving, onSerialLookup, extra }) {
  const navigate = useNavigate()

  const nav = (path, page) => {
    if (activePage === page) return
    navigate(path)
  }

  const buttons = [
    {
      id: 'inventory',
      label: '📥 Goods Receiving',
      onClick: () => activePage === 'inventory' ? onGoodsReceiving?.() : navigate('/app/inventory', { state: { openReceiving: true } }),
    },
    {
      id: 'stocktake',
      label: '📋 Stocktake',
      onClick: () => nav('/app/stocktake', 'stocktake'),
    },
    {
      id: 'transfer',
      label: '🔄 Transfer Stock',
      onClick: () => nav('/app/stock-transfer', 'transfer'),
    },
    {
      id: 'damage',
      label: '🔴 Damaged/Lost',
      onClick: () => nav('/app/damage-lost', 'damage'),
    },
    {
      id: 'serial-lookup',
      label: '🔢 Serial Lookup',
      onClick: () => activePage === 'inventory' ? onSerialLookup?.() : navigate('/app/inventory', { state: { openSerial: true } }),
    },
  ]

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 16,
      marginBottom: 20,
      minHeight: 48 // Ensures fixed height across pages
    }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: t.text, display: 'flex', alignItems: 'center', gap: 10 }}>
        {title}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {extra}
        {buttons.map(btn => (
          <Btn
            key={btn.id}
            t={t}
            variant={activePage === btn.id ? 'primary' : 'secondary'}
            onClick={btn.onClick}
            style={{
              fontWeight: 700,
              background: activePage === btn.id ? '#dc2626' : undefined,
              borderColor: activePage === btn.id ? '#dc2626' : undefined,
              color: activePage === btn.id ? '#fff' : undefined,
            }}
          >
            {btn.label}
          </Btn>
        ))}
      </div>
    </div>
  )
}
