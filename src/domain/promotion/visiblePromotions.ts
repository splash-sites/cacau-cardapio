import type { Product } from '../menu/Product'
import type { Promotion } from './Promotion'

export function visiblePromotions(promotions: Promotion[], products: Product[]): Promotion[] {
  const visibleProductIds = new Set(products.map((product) => product.id))
  return promotions
    .filter((promotion) => visibleProductIds.has(promotion.productId))
    .sort((a, b) => a.sortOrder - b.sortOrder)
}
