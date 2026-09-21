import type { Product } from '../../domain/menu/Product'
import type { SalesChannel } from '../../domain/order/SalesChannel'

export interface ProductRepository {
  listProducts(storeId: string, channel?: SalesChannel): Promise<Product[]>
}
