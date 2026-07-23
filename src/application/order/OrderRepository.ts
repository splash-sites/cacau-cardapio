import type { CartItem } from '../../domain/cart/CartItem'
import type { Customer } from '../../domain/customer/Customer'
import type { OrderType } from '../../domain/order/OrderType'

export interface CreateOrderInput {
  storeId: string
  orderType: OrderType
  customer: Customer
  items: CartItem[]
  tableNumber?: string | null
}

export interface CreatedOrder {
  id: string
}

export interface OrderRepository {
  createOrder(input: CreateOrderInput): Promise<CreatedOrder>
}
