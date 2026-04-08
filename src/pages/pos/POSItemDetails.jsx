import React from 'react'
import { X } from 'lucide-react'
import { ImgWithFallback } from '@/components/shared'
import { fmt } from '@/lib/utils'

export function POSItemDetails({ item, onClose, settings }) {
  if (!item) return null

  // Extract name and variants from "Name (Var1: Val1, Var2: Val2)" format
  const nameStr = item.name || ""
  const match = nameStr.match(/^(.*?)\s*\((.*?)\)$/)
  const displayName = match ? match[1] : nameStr
  const variantsStr = match ? match[2] : ""
  const variants = variantsStr ? variantsStr.split(",").map(v => v.trim()) : []

  return (
    <div className="pos-details-overlay" onClick={onClose}>
      <div className="pos-cart-item-details-popup" onClick={e => e.stopPropagation()}>
        <button className="pos-details-close" onClick={onClose}>
          <X size={18} />
        </button>
        
        <div className="pos-details-image">
          <ImgWithFallback 
            src={item.image_url || item.image} 
            alt={item.name} 
            emoji={item.emoji} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        <div className="pos-details-content">
          <div className="pos-details-category">{item.category || 'General'}</div>
          <div className="pos-details-name">{displayName}</div>
          
          {variants.length > 0 && (
            <div className="pos-details-variants">
              {variants.map((v, i) => (
                <div key={i} className="pos-variant-line">{v}</div>
              ))}
            </div>
          )}

          <div className="pos-details-sku">SKU: {item.sku || 'N/A'}</div>
          
          <div className="pos-details-grid">
            <div className="pos-details-stat">
              <span className="stat-label">Stock</span>
              <span className={`stat-value ${item.stock <= 5 ? 'low' : ''}`}>{item.stock}</span>
            </div>
            <div className="pos-details-stat">
              <span className="stat-label">Price</span>
              <span className="stat-value">{fmt(item.price, settings?.sym)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
