import type { Store } from '../../domain/store/Store'

export interface StoreRepository {
  getStoreBySlug(slug: string): Promise<Store | null>
}
