import type { PromotionRepository } from './PromotionRepository'

export function listPromotions(repo: PromotionRepository, storeId: string) {
  return repo.listPromotions(storeId)
}
