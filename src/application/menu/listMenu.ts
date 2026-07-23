import { groupByCategory } from '../../domain/menu/groupByCategory'
import { isProductAvailableForOrderType } from '../../domain/menu/productAvailability'
import type { OrderType } from '../../domain/order/OrderType'
import type { ProductRepository } from './ProductRepository'

export async function listMenu(repo: ProductRepository, storeId: string, orderType: OrderType) {
  const products = await repo.listProducts(storeId)
  return groupByCategory(products.filter((product) => isProductAvailableForOrderType(product, orderType)))
}
