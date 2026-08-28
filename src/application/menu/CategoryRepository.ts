import type { Category } from '../../domain/menu/Category'

export interface CategoryRepository {
  listCategories(storeId: string): Promise<Category[]>
}
