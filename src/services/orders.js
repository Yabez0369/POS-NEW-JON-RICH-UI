import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function fetchOrders(filters = {}) {
  if (isSupabaseConfigured()) {
    let q = supabase.from('orders').select('*, order_items(*)')
    if (filters.customerId) q = q.eq('customer_id', filters.customerId)
    if (filters.cashierId) q = q.eq('cashier_id', filters.cashierId)
    if (filters.siteId) q = q.eq('site_id', filters.siteId)
    if (filters.status) q = q.eq('status', filters.status)
    if (filters.dateFrom) q = q.gte('created_at', filters.dateFrom)
    if (filters.dateTo) q = q.lte('created_at', filters.dateTo)
    const { data, error } = await q.order('created_at', { ascending: false })
    if (error) throw error
    return data
  }
  return null
}

export async function createOrder(order) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('orders').insert(order).select().single()
    if (error) throw error
    return data
  }
  return { id: 'ORD-' + String(Math.floor(Math.random() * 9000) + 1000), ...order }
}

export async function updateOrderStatus(id, status) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single()
    if (error) throw error
    return data
  }
  return { id, status }
}
