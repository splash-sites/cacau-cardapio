import type { Product } from '../menu/Product'

export interface CartItem {
  product: Product
  quantity: number
  note?: string
}
