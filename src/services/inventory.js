import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function fetchInventory(siteId) {
  if (isSupabaseConfigured()) {
    let q = supabase.from('inventory').select('*, products(*), sites(name)')
    if (siteId) q = q.eq('site_id', siteId)
    const { data, error } = await q.order('updated_at', { ascending: false })
    if (error) throw error
    return data
  }
  return null
}

export async function adjustStock(productId, siteId, quantity, type, notes, userId) {
  if (isSupabaseConfigured()) {
    const { error: mvError } = await supabase.from('inventory_movements').insert({
      product_id: productId, to_site_id: siteId, quantity, movement_type: type, notes, created_by: userId,
    })
    if (mvError) throw mvError
    const { data, error } = await supabase.from('inventory')
      .update({ stock_on_hand: quantity, updated_at: new Date().toISOString() })
      .match({ product_id: productId, site_id: siteId })
      .select().single()
    if (error) throw error
    return data
  }
  return null
}

export async function transferStock(productId, fromSiteId, toSiteId, quantity, notes, userId) {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('inventory_movements').insert({
      product_id: productId, from_site_id: fromSiteId, to_site_id: toSiteId,
      quantity, movement_type: 'transfer', notes, created_by: userId,
    })
    if (error) throw error
  }
  return null
}

export async function fetchMovements(productId, siteId) {
  if (isSupabaseConfigured()) {
    let q = supabase.from('inventory_movements').select('*')
    if (productId) q = q.eq('product_id', productId)
    if (siteId) q = q.or(`from_site_id.eq.${siteId},to_site_id.eq.${siteId}`)
    const { data, error } = await q.order('created_at', { ascending: false }).limit(100)
    if (error) throw error
    return data
  }
  return null
}
