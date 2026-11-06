import type { Category } from '../../domain/menu/Category'
import type { MenuChannel } from '../../domain/menu/groupByCategory'

export interface CategoryRepository {
  /** Ordenada pelo sort_order do canal (default Cafeteria/dine_in). */
  listCategories(storeId: string, channel?: MenuChannel): Promise<Category[]>
}
