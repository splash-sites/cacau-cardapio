import type { OrderSummary } from '../../domain/order/OrderSummary'

export interface OrderHistoryRepository {
  listOrders(storeId: string, customerCpf: string): Promise<OrderSummary[]>
}
