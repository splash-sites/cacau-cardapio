import type { OrderStatusRepository } from '../../application/order/OrderStatusRepository'
import type { OrderStatus } from '../../domain/order/OrderStatus'
import { normalizeCpf } from '../../domain/customer/cpf'
import { supabase } from '../supabase/client'

export class SupabaseOrderStatusRepository implements OrderStatusRepository {
  async getStatus(orderId: string, customerCpf: string): Promise<OrderStatus | null> {
    const { data, error } = await supabase.rpc('get_order_status', {
      p_order_id: orderId,
      p_customer_cpf: normalizeCpf(customerCpf),
    })
    if (error) throw error
    return (data as OrderStatus | null) ?? null
  }
}

export const supabaseOrderStatusRepository = new SupabaseOrderStatusRepository()
