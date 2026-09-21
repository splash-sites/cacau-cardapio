import type { CreateOrderInput, CreatedOrder, OrderRepository } from '../../application/order/OrderRepository'
import { normalizeCpf } from '../../domain/customer/cpf'
import { supabase } from '../supabase/client'

export class SupabaseOrderRepository implements OrderRepository {
  async createOrder({ storeId, orderType, customer, items, tableNumber, salesChannel }: CreateOrderInput): Promise<CreatedOrder> {
    const { data, error } = await supabase.rpc('confirm_order', {
      p_store_id: storeId,
      p_order_type: orderType,
      p_customer_name: customer.fullName,
      p_customer_cpf: normalizeCpf(customer.cpf),
      p_customer_phone: customer.phone,
      p_delivery_address: orderType === 'delivery' ? customer.address : null,
      p_items: items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        note: item.note ?? null,
        addons: item.addons.map((addon) => ({ addon_option_id: addon.id })),
        variations: item.variations.map((variation) => ({ variation_option_id: variation.id })),
        promotion_id: item.promotionId ?? null,
      })),
      p_table_number: orderType === 'dine_in' ? (tableNumber ?? null) : null,
      // Só vai no canal de revendedor: varejo chama a RPC exatamente como antes,
      // então não quebra enquanto o banco não tiver o parâmetro novo.
      ...(salesChannel === 'reseller' ? { p_sales_channel: 'reseller' } : {}),
    })
    if (error) throw error
    return { id: data as string }
  }
}

export const supabaseOrderRepository = new SupabaseOrderRepository()
