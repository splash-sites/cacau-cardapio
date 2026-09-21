import { groupByCategory } from '../../domain/menu/groupByCategory'
import { isProductAvailableForOrderType, isProductAvailableForReseller } from '../../domain/menu/productAvailability'
import type { OrderType } from '../../domain/order/OrderType'
import type { SalesChannel } from '../../domain/order/SalesChannel'
import type { CategoryRepository } from './CategoryRepository'
import type { ProductRepository } from './ProductRepository'

export async function listMenu(
  productRepo: ProductRepository,
  categoryRepo: CategoryRepository,
  storeId: string,
  orderType: OrderType,
  channel: SalesChannel = 'retail',
) {
  const [products, categories] = await Promise.all([
    productRepo.listProducts(storeId, channel),
    categoryRepo.listCategories(storeId),
  ])
  const isAvailable = channel === 'reseller' ? isProductAvailableForReseller : isProductAvailableForOrderType
  const available = products.filter((product) => isAvailable(product, orderType))
  return groupByCategory(available, categories)
}
