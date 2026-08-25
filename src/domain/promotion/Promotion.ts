import type { PromotionComboItem } from './PromotionComboItem'

export type PromotionDiscountType = 'percent' | 'fixed_amount' | null

export interface Promotion {
  id: string
  storeId: string
  title: string
  subtitle: string | null
  badgeLabel: string | null
  imageUrl: string
  productId: string
  sortOrder: number
  // discountType null = promoção sem desconto (comportamento de sempre, abre
  // o ProductDetailModal normal). Preenchido = abre PromotionDetailModal,
  // mesmo sem comboItems (caso degenerado: "combo" de 1 produto só).
  discountType: PromotionDiscountType
  discountValue: number | null
  comboItems: PromotionComboItem[]
}
