import type { OrderStatus } from './OrderStatus'
import type { OrderType } from './OrderType'

export interface OrderItemSummary {
  productName: string
  quantity: number
  unitPrice: number
  note: string | null
}

export interface OrderSummary {
  id: string
  orderType: OrderType
  status: OrderStatus
  tableNumber: string | null
  createdAt: string
  items: OrderItemSummary[]
}
