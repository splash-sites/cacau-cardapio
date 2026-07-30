import type { OrderSummary } from './OrderSummary'

export function hasActiveOrders(orders: OrderSummary[]): boolean {
  return orders.some((order) => order.status !== 'finalized' && order.status !== 'cancelled')
}
