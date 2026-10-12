import type { OrderSummary } from './OrderSummary'

// Mesma regra do painel: (preço da unidade já com variação + adicionais por unidade) × quantidade.
export function orderSummaryTotal(order: OrderSummary): number {
  return order.items.reduce((total, item) => total + (item.unitPrice + item.addonsUnitPrice) * item.quantity, 0)
}
