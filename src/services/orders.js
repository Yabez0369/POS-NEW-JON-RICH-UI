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

/** Create order + order_items in Supabase. Returns created order with items. */
export async function createOrderWithItems({ siteId, counterId, cashierId, customerId, items, subtotal, taxAmount, discountAmount, loyaltyDiscount, total, paymentMethod, paymentDetails, loyaltyEarned, loyaltyUsed, manualDiscountPct }) {
  // Sanitizing IDs: if they look like our mock patterns, don't send to Supabase foreign keys
  const isMock = (id) => {
    if (!id) return true;
    const s = String(id).toLowerCase();
    // Only block strings that are clearly NOT UUIDs or are our specific local-only mock prefixes.
    // We allow b000..., c000... etc because they are valid UUIDs used in our seed data.
    return s.startsWith('temp-') || (!s.includes('-') && s.length < 30);
  };

  const orderPayload = {
    site_id: isMock(siteId) ? null : siteId,
    counter_id: isMock(counterId) ? null : counterId,
    customer_id: isMock(customerId) ? null : customerId,
    cashier_id: isMock(cashierId) ? null : cashierId,
    order_type: 'in-store',
    status: 'completed',
    subtotal: Number(subtotal),
    tax_amount: Number(taxAmount),
    discount_amount: Number(discountAmount || 0),
    loyalty_discount: Number(loyaltyDiscount || 0),
    delivery_charge: 0,
    total: Number(total),
    payment_method: paymentMethod || 'Cash',
    payment_details: paymentDetails || {},
    loyalty_earned: loyaltyEarned || 0,
    loyalty_used: loyaltyUsed || 0,
    manual_discount_pct: Number(manualDiscountPct || 0),
  }
  const { data: order, error: orderErr } = await supabase.from('orders').insert(orderPayload).select().single()
  if (orderErr) throw orderErr
  if (!items?.length) return order

  const orderItems = items.map((i) => ({
    order_id: order.id,
    product_id: isMock(i.productId || i.product_id) ? null : (i.productId || i.product_id),
    variant_id: i.variantId || null,
    product_name: i.name,
    quantity: i.qty,
    unit_price: Number(i.price),
    discount_pct: Number(i.discount || 0),
    override_price: i.overridePrice != null ? Number(i.overridePrice) : null,
    line_total: Number((i.price * (1 - (i.discount || 0) / 100) * i.qty).toFixed(2)),
  }))
  const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
  if (itemsErr) throw itemsErr
  return { ...order, order_items: orderItems }
}

/** Fetch order by order_number for reprint receipt */
export async function fetchOrderByNumber(orderNumber) {
  if (!isSupabaseConfigured() || !orderNumber?.trim()) return null
  const num = String(orderNumber).trim()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', num)
    .maybeSingle()
  if (error || !data) return null
  return data
}

export async function updateOrderStatus(id, status) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single()
    if (error) throw error
    return data
  }
  return { id, status }
}
