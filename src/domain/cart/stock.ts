import type { Product } from '../menu/Product'
import type { SalesChannel } from '../order/SalesChannel'
import type { CartItem } from './CartItem'

// Saldo que limita o carrinho, conforme o canal. Varejo e revenda têm saldos
// separados (stock_quantity x reseller_stock_quantity) — um canal nunca olha o
// do outro. null = sem limite (o produto não controla estoque nesse canal).
export function stockLimit(product: Product, channel: SalesChannel): number | null {
  if (channel === 'reseller') {
    if (product.resellerTrackStock !== true) return null
    return Math.max(0, product.resellerStockQuantity ?? 0)
  }
  if (!product.trackStock) return null
  return Math.max(0, product.stockQuantity)
}

// Quanto ainda cabe no carrinho desse produto. Soma todas as linhas do produto
// (adicional/variação diferente vira linha separada, mas o saldo é um só).
// null = sem limite.
export function remainingStock(items: CartItem[], product: Product, channel: SalesChannel): number | null {
  const limit = stockLimit(product, channel)
  if (limit === null) return null
  const inCart = items
    .filter((item) => item.product.id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0)
  return Math.max(0, limit - inCart)
}

// Depois de recarregar o saldo (ex: confirm_order recusou por estoque
// insuficiente): troca o produto de cada linha pela versão nova e corta a
// quantidade que passou do saldo. Linha que fica com 0 sai do carrinho.
export function refreshCartStock(items: CartItem[], freshProducts: Product[], channel: SalesChannel): CartItem[] {
  const freshById = new Map(freshProducts.map((product) => [product.id, product]))
  const allocated = new Map<string, number>()

  return items
    .map((item) => {
      const product = freshById.get(item.product.id) ?? item.product
      const limit = stockLimit(product, channel)
      if (limit === null) return { ...item, product }
      const alreadyAllocated = allocated.get(product.id) ?? 0
      const quantity = Math.min(item.quantity, Math.max(0, limit - alreadyAllocated))
      allocated.set(product.id, alreadyAllocated + quantity)
      return { ...item, product, quantity }
    })
    .filter((item) => item.quantity > 0)
}
