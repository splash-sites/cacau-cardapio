import type { Promotion } from '../../domain/promotion/Promotion'

export interface PromotionRepository {
  listPromotions(storeId: string): Promise<Promotion[]>
}
