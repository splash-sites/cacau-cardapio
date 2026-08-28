import type { Category } from './Category'
import type { Product } from './Product'

// Bloco pra produto sem categoria válida (category_id null, ou apontando pra
// categoria que não veio na lista — inativa, por exemplo) — sempre por último,
// nunca escondido: produto ativo não deve sumir do cardápio sem nenhum sinal.
const UNCATEGORIZED_LABEL = 'Outros'

function byProductOrder(a: Product, b: Product): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
  return a.name.localeCompare(b.name)
}

// `categories` já vem ordenada (sort_order, depois name — ver
// SupabaseCategoryRepository) — a ordem das seções do cardápio é a ordem
// desse array, não a ordem de chegada dos produtos.
export function groupByCategory(products: Product[], categories: Category[]): Map<string, Product[]> {
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
    if (items && items.length > 0) groups.set(category.name, [...items].sort(byProductOrder))
  }
  if (uncategorized.length > 0) groups.set(UNCATEGORIZED_LABEL, [...uncategorized].sort(byProductOrder))

  return groups
}
