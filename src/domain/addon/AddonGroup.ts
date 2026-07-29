import type { AddonOption } from './AddonOption'

export type AddonSelectionType = 'single' | 'multiple'

export interface AddonGroup {
  id: string
  name: string
  selectionType: AddonSelectionType
  maxQuantity: number | null
  options: AddonOption[]
}
