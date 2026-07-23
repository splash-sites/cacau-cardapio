import type { Product } from '../../domain/menu/Product'

export interface ProductRepository {
  listProducts(storeId: string): Promise<Product[]>
}
