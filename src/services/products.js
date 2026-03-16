import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function fetchProducts() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('products').select('*, categories(name)').order('name')
    if (error) throw error
    return data
  }
  return null
}

export async function createProduct(product) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('products').insert(product).select().single()
    if (error) throw error
    return data
  }
  return { id: Date.now(), ...product }
}

export async function updateProduct(id, updates) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  }
  return { id, ...updates }
}

export async function deleteProduct(id) {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  }
}

export async function lookupBarcode(barcode) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('product_barcodes').select('*, products(*)').eq('barcode', barcode).single()
    if (error) throw error
    return data?.products
  }
  return null
}
