import type { OrderType } from '../order/OrderType'
import type { SalesChannel } from '../order/SalesChannel'
import type { Category } from './Category'
import type { Product } from './Product'

// Bloco pra produto sem categoria válida (category_id null, ou apontando pra
// categoria que não veio na lista — inativa, por exemplo) — sempre por último,
// nunca escondido: produto ativo não deve sumir do cardápio sem nenhum sinal.
const UNCATEGORIZED_LABEL = 'Outros'

/** As 3 formas de vender, cada uma com sua própria ordem de categoria e de produto (ver painel, "Organizar cardápio"). */
export type MenuChannel = 'dine_in' | 'pickup' | 'reseller'

/**
 * `dine_in`/`pickup` são canal de varejo (`SalesChannel = 'retail'`), diferenciados pelo tipo
 * de pedido; `delivery` cai no mesmo cardápio/ordem de `pickup` (retirada e entrega são "um
 * cardápio só", ver CLAUDE.md). `reseller` é canal à parte, nunca depende do orderType.
 */
export function menuChannelFor(orderType: OrderType, salesChannel: SalesChannel): MenuChannel {
  if (salesChannel === 'reseller') return 'reseller'
  return orderType === 'dine_in' ? 'dine_in' : 'pickup'
}

function sortOrderFor(product: Product, channel: MenuChannel): number {
  if (channel === 'pickup') return product.sortOrderPickup
  if (channel === 'reseller') return product.sortOrderReseller
  return product.sortOrder
}

function byProductOrder(channel: MenuChannel): (a: Product, b: Product) => number {
  return (a, b) => {
    const diff = sortOrderFor(a, channel) - sortOrderFor(b, channel)
    if (diff !== 0) return diff
    return a.name.localeCompare(b.name)
  }
}

// `categories` já vem ordenada pro canal certo (ver SupabaseCategoryRepository.listCategories)
// — a ordem das seções do cardápio é a ordem desse array, não a ordem de chegada dos produtos.
export function groupByCategory(products: Product[], categories: Category[], channel: MenuChannel = 'dine_in'): Map<string, Product[]> {
  const compareProducts = byProductOrder(channel)
  const knownCategoryIds = new Set(categories.map((category) => category.id))
  const byCategoryId = new Map<string, Product[]>()
  const uncategorized: Product[] = []

  for (const product of products) {
    if (product.categoryId && knownCategoryIds.has(product.categoryId)) {
      const bucket = byCategoryId.get(product.categoryId)
      if (bucket) bucket.push(product)
      else byCategoryId.set(product.categoryId, [product])
    } else {
      uncategorized.push(product)
    }
  }

  const groups = new Map<string, Product[]>()
  for (const category of categories) {
    const items = byCategoryId.get(category.id)
    if (items && items.length > 0) groups.set(category.name, [...items].sort(compareProducts))
  }
  if (uncategorized.length > 0) groups.set(UNCATEGORIZED_LABEL, [...uncategorized].sort(compareProducts))

  return groups
}
