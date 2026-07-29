import type { AddonOption } from '../addon/AddonOption'
import type { Product } from '../menu/Product'
import type { VariationOption } from '../variation/VariationOption'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  addons: AddonOption[]
  variations: VariationOption[]
  note?: string
}
