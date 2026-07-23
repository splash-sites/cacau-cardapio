import type { OrderStatus } from '../../domain/order/OrderStatus'

export interface OrderStatusRepository {
  getStatus(orderId: string, customerCpf: string): Promise<OrderStatus | null>
}
