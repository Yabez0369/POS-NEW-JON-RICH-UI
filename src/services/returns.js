import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function fetchReturns(filters = {}) {
  if (isSupabaseConfigured()) {
    let q = supabase.from('returns').select('*, return_items(*)')
    if (filters.customerId) q = q.eq('customer_id', filters.customerId)
    if (filters.status) q = q.eq('status', filters.status)
    const { data, error } = await q.order('created_at', { ascending: false })
    if (error) throw error
    return data
  }
  return null
}

export async function createReturn(ret) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('returns').insert(ret).select().single()
    if (error) throw error
    return data
  }
  return { id: 'RET-' + String(Math.floor(Math.random() * 9000) + 1000), ...ret }
}

export async function updateReturnStatus(id, status, processedBy) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('returns').update({ status, processed_by: processedBy }).eq('id', id).select().single()
    if (error) throw error
    return data
  }
  return { id, status }
}
