import type { OrderHistoryRepository } from '../../application/order/OrderHistoryRepository'
import { normalizeCpf } from '../../domain/customer/cpf'
import type { OrderStatus } from '../../domain/order/OrderStatus'
import type { OrderSummary } from '../../domain/order/OrderSummary'
import type { OrderType } from '../../domain/order/OrderType'
import { supabase } from '../supabase/client'

interface OrderRow {
  id: string
  order_type: string
  status: string
  table_number: string | null
  created_at: string
  items: { product_name: string; quantity: number; unit_price: number; note: string | null }[] | null
}

function toOrderSummary(row: OrderRow): OrderSummary {
  return {
    id: row.id,
    orderType: row.order_type as OrderType,
    status: row.status as OrderStatus,
    tableNumber: row.table_number,
    createdAt: row.created_at,
    items: (row.items ?? []).map((item) => ({
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      note: item.note,
    })),
  }
}

export class SupabaseOrderHistoryRepository implements OrderHistoryRepository {
  async listOrders(storeId: string, customerCpf: string): Promise<OrderSummary[]> {
    const { data, error } = await supabase.rpc('list_orders_by_cpf', {
      p_store_id: storeId,
      p_customer_cpf: normalizeCpf(customerCpf),
    })
    if (error) throw error
    return (data as OrderRow[]).map(toOrderSummary)
  }
}

export const supabaseOrderHistoryRepository = new SupabaseOrderHistoryRepository()
