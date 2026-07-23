import type { OrderSummary } from './OrderSummary'

export function orderSummaryTotal(order: OrderSummary): number {
  return order.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0)
}
