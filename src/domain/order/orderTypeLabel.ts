import type { OrderType } from './OrderType'

const LABELS: Record<OrderType, string> = {
  dine_in: 'Cafeteria',
  delivery: 'Delivery',
  pickup: 'Para Levar',
}

export function orderTypeLabel(orderType: OrderType): string {
  return LABELS[orderType]
}
