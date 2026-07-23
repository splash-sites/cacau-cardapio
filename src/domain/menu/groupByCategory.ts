import type { Product } from './Product'

export function groupByCategory(products: Product[]): Map<string, Product[]> {
  const groups = new Map<string, Product[]>()
  for (const product of products) {
    const group = groups.get(product.category)
    if (group) {
      group.push(product)
    } else {
      groups.set(product.category, [product])
    }
  }
  return groups
}
