import type { OrderType } from '../order/OrderType'
import type { Product } from './Product'

function isAvailableInChannel(product: Product, orderType: OrderType): boolean {
  if (orderType === 'dine_in') return product.availableDineIn
  if (orderType === 'pickup') return product.availablePickup
  return product.availableDelivery
}

// track_stock=false é a loja optando por não controlar estoque desse item
// (ex: item sob encomenda) — nesse caso stock_quantity é ignorado de propósito.
export function isProductAvailableForOrderType(product: Product, orderType: OrderType): boolean {
  const inStock = !product.trackStock || product.stockQuantity > 0
  return product.active && isAvailableInChannel(product, orderType) && inStock
}
