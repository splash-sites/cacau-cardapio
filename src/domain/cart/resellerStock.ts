import type { Product } from '../menu/Product'
import type { CartItem } from './CartItem'

// null = sem limite (reseller_track_stock=false: o item nunca esgota).
export function resellerStockLimit(product: Product): number | null {
  if (product.resellerTrackStock !== true) return null
  return Math.max(0, product.resellerStockQuantity ?? 0)
}

// Quanto ainda cabe no carrinho desse produto. Soma todas as linhas do produto
// (adicional/variação diferente vira linha separada, mas o saldo é um só).
// null = sem limite.
export function remainingResellerStock(items: CartItem[], product: Product): number | null {
  const limit = resellerStockLimit(product)
  if (limit === null) return null
  const inCart = items
    .filter((item) => item.product.id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0)
  return Math.max(0, limit - inCart)
}

// Depois de recarregar o saldo (ex: confirm_order recusou por estoque
// insuficiente): troca o produto de cada linha pela versão nova e corta a
// quantidade que passou do saldo. Linha que fica com 0 sai do carrinho.
export function refreshCartStock(items: CartItem[], freshProducts: Product[]): CartItem[] {
  const freshById = new Map(freshProducts.map((product) => [product.id, product]))
  const allocated = new Map<string, number>()

  return items
    .map((item) => {
      const product = freshById.get(item.product.id) ?? item.product
      const limit = resellerStockLimit(product)
      if (limit === null) return { ...item, product }
      const alreadyAllocated = allocated.get(product.id) ?? 0
      const quantity = Math.min(item.quantity, Math.max(0, limit - alreadyAllocated))
      allocated.set(product.id, alreadyAllocated + quantity)
      return { ...item, product, quantity }
    })
    .filter((item) => item.quantity > 0)
}
