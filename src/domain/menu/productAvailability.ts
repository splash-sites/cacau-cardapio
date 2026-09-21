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

// Estoque do revendedor é um saldo próprio (reseller_stock_quantity), separado
// do estoque do varejo — o pedido de revendedor nunca olha stock_quantity, e o
// de varejo nunca mexe nesse saldo. reseller_track_stock=false nunca esgota.
export function isResellerSoldOut(product: Product): boolean {
  return product.resellerTrackStock === true && (product.resellerStockQuantity ?? 0) <= 0
}

// Revendedor não tem dine_in (mesa) — só retirada ou entrega.
export function isProductAvailableForReseller(product: Product, orderType: OrderType): boolean {
  if (orderType === 'dine_in') return false
  return product.active && product.availableReseller === true && !isResellerSoldOut(product)
}
