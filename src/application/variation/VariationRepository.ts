import type { VariationGroup } from '../../domain/variation/VariationGroup'

export interface VariationRepository {
  listProductVariationGroups(productId: string): Promise<VariationGroup[]>
}
