import type { CartItem } from '../../domain/cart/CartItem'
import type { Customer } from '../../domain/customer/Customer'
import type { OrderType } from '../../domain/order/OrderType'
import type { SalesChannel } from '../../domain/order/SalesChannel'

export interface CreateOrderInput {
  storeId: string
  orderType: OrderType
  customer: Customer
  items: CartItem[]
  tableNumber?: string | null
  // Ausente = varejo. 'reseller' é o que faz o banco baixar o saldo do revendedor.
  salesChannel?: SalesChannel
}

export interface CreatedOrder {
  id: string
}

export interface OrderRepository {
  createOrder(input: CreateOrderInput): Promise<CreatedOrder>
}
