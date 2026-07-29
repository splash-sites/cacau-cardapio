import type { VariationOption } from './VariationOption'

export type VariationPriceMode = 'additive' | 'replace'

export interface VariationGroup {
  id: string
  name: string
  priceMode: VariationPriceMode
  options: VariationOption[]
}
