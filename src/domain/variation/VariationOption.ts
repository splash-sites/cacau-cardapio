import type { VariationPriceMode } from './VariationGroup'

export interface VariationOption {
  id: string
  name: string
  price: number
  loverPrice: number
  priceMode: VariationPriceMode
}
