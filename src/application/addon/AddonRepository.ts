import type { AddonGroup } from '../../domain/addon/AddonGroup'

export interface AddonRepository {
  listProductAddonGroups(productId: string): Promise<AddonGroup[]>
}
