import type { OrderStatus } from './OrderStatus'
import type { OrderType } from './OrderType'

export interface OrderItemSummary {
  productName: string
  quantity: number
  unitPrice: number
  /** Soma dos adicionais por unidade (preço × quantidade de cada adicional). */
  addonsUnitPrice: number
  addonNames: string[]
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
