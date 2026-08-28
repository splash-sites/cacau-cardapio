import { groupByCategory } from '../../domain/menu/groupByCategory'
import { isProductAvailableForOrderType } from '../../domain/menu/productAvailability'
import type { OrderType } from '../../domain/order/OrderType'
import type { CategoryRepository } from './CategoryRepository'
import type { ProductRepository } from './ProductRepository'

export async function listMenu(
  productRepo: ProductRepository,
  categoryRepo: CategoryRepository,
  storeId: string,
  orderType: OrderType,
) {
  const [products, categories] = await Promise.all([
    productRepo.listProducts(storeId),
    categoryRepo.listCategories(storeId),
  ])
  const available = products.filter((product) => isProductAvailableForOrderType(product, orderType))
  return groupByCategory(available, categories)
}
