import { supabase, isSupabaseConfigured } from '@/lib/supabase'

/** Map DB product (base_price, image_url) to app format (price, image) */
function toAppFormat(p) {
  if (!p) return p
  const { base_price, image_url, ...rest } = p
  return {
    ...rest,
    price: base_price ?? p.price,
    image: image_url ?? p.image,
    image_url: image_url ?? p.image,
    taxPct: p.tax_pct ?? p.taxPct ?? 20,
  }
}

/** Map app product (price, image) to DB format (base_price, image_url) - only schema columns */
function toDbFormat(product) {
  const db = {
    sku: product.sku,
    name: product.name,
    description: product.description ?? product.shortDescription ?? product.longDescription ?? null,
    category_id: product.category_id || null,
    brand: product.brand || null,
    base_price: Number(product.price ?? product.base_price ?? 0),
    cost_price:
      product.costPrice != null || product.cost_price != null
        ? Number(product.costPrice ?? product.cost_price)
        : null,
    tax_code: product.taxCode ?? product.tax_code ?? 'standard',
    status: product.status === 'inactive' ? 'inactive' : 'active',
    image_url: product.image ?? product.image_url ?? null,
    emoji: product.emoji ?? '📦',
    returnable: product.returnable !== false,
    track_serial: product.track_serial === true
  }

  if (product.category_id !== undefined) {
    db.category_id = product.category_id || null
  }
  if (product.subcategory_id !== undefined) {
    db.subcategory_id = product.subcategory_id || null
  }
  if (product.taxPct !== undefined || product.tax_pct !== undefined) {
    db.tax_pct = product.taxPct ?? product.tax_pct ?? 20
  }
  return db
}

/** Extra columns from dynamic_category_system.sql — second request only when needed (avoids 400 if migration not run). */
function toDbFormatExtended(product) {
  const ext = {}
  if (product.subcategory_id != null && product.subcategory_id !== '') {
    ext.subcategory_id = product.subcategory_id
  }
  const dyn = product.dynamic_attributes
  if (dyn && typeof dyn === 'object' && Object.keys(dyn).length > 0) {
    ext.dynamic_attributes = dyn
  }
  return Object.keys(ext).length ? ext : null
}

/** Partial base columns for UPDATE (avoids wiping fields when only a subset is sent). */
function toDbFormatBasePatch(updates) {
  const db = {}
  if (updates.sku !== undefined) {
    const s = String(updates.sku ?? '').trim()
    if (s) db.sku = s
  }
  if (updates.name !== undefined) {
    const n = String(updates.name ?? '').trim()
    if (n) db.name = n
  }
  if (
    updates.description !== undefined ||
    updates.shortDescription !== undefined ||
    updates.longDescription !== undefined
  ) {
    db.description =
      updates.description ?? updates.shortDescription ?? updates.longDescription ?? null
  }
  if (updates.category_id !== undefined) db.category_id = updates.category_id || null
  if (updates.brand !== undefined) db.brand = updates.brand || null
  if (updates.price !== undefined || updates.base_price !== undefined) {
    db.base_price = Number(updates.price ?? updates.base_price ?? 0)
  }
  if (updates.costPrice !== undefined || updates.cost_price !== undefined) {
    db.cost_price =
      updates.costPrice != null || updates.cost_price != null
        ? Number(updates.costPrice ?? updates.cost_price)
        : null
  }
  if (updates.taxCode !== undefined || updates.tax_code !== undefined) {
    db.tax_code = updates.taxCode ?? updates.tax_code ?? 'standard'
  }
  if (updates.status !== undefined) {
    db.status = updates.status === 'inactive' ? 'inactive' : 'active'
  }
  if (updates.image !== undefined || updates.image_url !== undefined) {
    db.image_url = updates.image ?? updates.image_url ?? null
  }
  if (updates.emoji !== undefined) db.emoji = updates.emoji ?? '📦'
  if (updates.returnable !== undefined) db.returnable = updates.returnable !== false
  if (updates.track_serial !== undefined) db.track_serial = updates.track_serial === true
  return db
}

async function applyExtendedProductFields(productId, product) {
  const ext = toDbFormatExtended(product)
  if (!ext || !isSupabaseConfigured()) return
  const { error } = await supabase.from('products').update(ext).eq('id', productId)
  if (error) {
    console.warn(
      'Product extended fields (subcategory/dynamic_attributes) not saved — run supabase/dynamic_category_system.sql if you need them:',
      error.message
    )
  }
}

export async function fetchProducts() {
  if (isSupabaseConfigured()) {
    // Try full query first
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), inventory(stock_on_hand), product_barcodes(barcode, is_primary)')
      .order('name')
    
    if (error) {
      console.warn('Full product fetch failed, trying fallback...', error.message)
      // Fallback for missing columns/tables
      const { data: fallback, error: err2 } = await supabase
        .from('products')
        .select('*')
        .order('name')
      
      if (err2) throw err2
      
      return fallback.map(p => ({
        ...toAppFormat(p),
        category: 'Uncategorized',
        stock: 0,
        barcodes: []
      }))
    }
    
    const productsWithStock = data.map(p => {
      const app = toAppFormat(p)
      const barcodes = p.product_barcodes || []
      const primaryBarcode = (barcodes.find(pb => pb.is_primary) || barcodes[0])?.barcode
      return {
        ...app,
        barcode: primaryBarcode || app.barcode,
        barcodes: barcodes.map(pb => pb.barcode).filter(Boolean),
        stock: (p.inventory || []).reduce((sum, inv) => sum + (inv.stock_on_hand || 0), 0),
        category: p.categories?.name || 'Uncategorized'
      }
    })
    
    return productsWithStock
  }
  return null
}

export async function createProduct(product) {
  const db = toDbFormat(product)
  if (!db.sku || db.sku === 'SKU-PENDING') {
    db.sku = `SKU-${Date.now()}`
  }
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('products').insert(db).select().single()
    if (error) throw error
    await applyExtendedProductFields(data.id, product)
    const { data: full } = await supabase.from('products').select('*').eq('id', data.id).single()
    const created = toAppFormat(full || data)
    const barcodes = product.barcodes ?? (product.barcode?.trim() ? [product.barcode.trim()] : [])
    if (barcodes.length) await syncProductBarcodes(created.id, barcodes)
    return created
  }
  return { id: Date.now(), ...product }
}

export async function updateProduct(id, updates) {
  const db = toDbFormatBasePatch(updates)
  const ext = toDbFormatExtended(updates)
  if (isSupabaseConfigured()) {
    if (Object.keys(db).length > 0) {
      const { data, error } = await supabase.from('products').update(db).eq('id', id).select().single()
      if (error) throw error
    }
    await applyExtendedProductFields(id, updates)
    const { data: full, error: fetchErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    if (fetchErr) throw fetchErr
    const updated = toAppFormat(full)
    if (updates.barcodes !== undefined) {
      await syncProductBarcodes(id, updates.barcodes)
    } else if (updates.barcode !== undefined) {
      const barcodes = updates.barcode?.trim() ? [updates.barcode.trim()] : []
      await syncProductBarcodes(id, barcodes)
    }
    return updated
  }
  return { id, ...updates }
}

export async function deleteProduct(id) {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  }
}

/** Look up product by barcode from product_barcodes table */
export async function lookupBarcode(barcode) {
  if (!isSupabaseConfigured() || !barcode?.trim()) return null
  const { data, error } = await supabase
    .from('product_barcodes')
    .select('*, products(*)')
    .eq('barcode', String(barcode).trim())
    .maybeSingle()
  if (error) return null
  const p = data?.products
  return p ? toAppFormat(p) : null
}

/** Sync primary barcode for a product into product_barcodes */
export async function upsertProductBarcode(productId, barcode, variantId = null) {
  if (!isSupabaseConfigured() || !barcode?.trim()) return
  const bc = String(barcode).trim()
  await supabase.from('product_barcodes').delete().eq('product_id', productId).eq('is_primary', true)
  const { error } = await supabase.from('product_barcodes').insert({
    product_id: productId,
    variant_id: variantId,
    barcode: bc,
    format: 'EAN13',
    is_primary: true
  })
  if (error) console.warn('Barcode sync failed:', error.message)
}

/** Fetch all barcodes for a product */
export async function fetchProductBarcodes(productId) {
  if (!isSupabaseConfigured() || !productId) return []
  const { data, error } = await supabase
    .from('product_barcodes')
    .select('id, barcode, format, is_primary')
    .eq('product_id', productId)
    .order('is_primary', { ascending: false })
  if (error) return []
  return data || []
}

/** Sync multiple barcodes for a product. Replaces all existing barcodes. */
export async function syncProductBarcodes(productId, barcodes, variantId = null) {
  if (!isSupabaseConfigured() || !productId) return
  const list = Array.isArray(barcodes) ? barcodes : (barcodes ? [barcodes] : [])
  const trimmed = [...new Set(list.map(b => String(b).trim()).filter(Boolean))]
  await supabase.from('product_barcodes').delete().eq('product_id', productId)
  if (trimmed.length === 0) return
  const rows = trimmed.map((bc, i) => ({
    product_id: productId,
    variant_id: variantId,
    barcode: bc,
    format: 'EAN13',
    is_primary: i === 0
  }))
  const { error } = await supabase.from('product_barcodes').insert(rows)
  if (error) console.warn('Barcode sync failed:', error.message)
}
