import type { Promotion, PromotionDiscountType } from '../../domain/promotion/Promotion'
import type { PromotionRepository } from '../../application/promotion/PromotionRepository'
import { supabase } from '../supabase/client'

interface PublicPromotionRow {
  id: string
  store_id: string
  title: string
  subtitle: string | null
  badge_label: string | null
  image_url: string
  product_id: string
  sort_order: number
  discount_type: PromotionDiscountType
  discount_value: number | null
}

interface PublicPromotionComboItemRow {
  promotion_id: string
  product_id: string
  quantity: number
}

function toPromotion(row: PublicPromotionRow, comboItemsByPromotion: Map<string, PublicPromotionComboItemRow[]>): Promotion {
  return {
    id: row.id,
    storeId: row.store_id,
    title: row.title,
    subtitle: row.subtitle,
    badgeLabel: row.badge_label,
    imageUrl: row.image_url,
    productId: row.product_id,
    sortOrder: row.sort_order,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    comboItems: (comboItemsByPromotion.get(row.id) ?? []).map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
    })),
  }
}

export class SupabasePromotionRepository implements PromotionRepository {
  async listPromotions(storeId: string): Promise<Promotion[]> {
    const { data, error } = await supabase
      .from('public_promotions')
      .select('id, store_id, title, subtitle, badge_label, image_url, product_id, sort_order, discount_type, discount_value')
      .eq('store_id', storeId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    const rows = data as PublicPromotionRow[]

    const promotionIds = rows.filter((row) => row.discount_type !== null).map((row) => row.id)
    const comboItemsByPromotion = new Map<string, PublicPromotionComboItemRow[]>()
    if (promotionIds.length > 0) {
      const { data: comboRows, error: comboError } = await supabase
        .from('public_promotion_combo_items')
        .select('promotion_id, product_id, quantity')
        .in('promotion_id', promotionIds)
      if (comboError) throw comboError
      for (const item of comboRows as PublicPromotionComboItemRow[]) {
        const existing = comboItemsByPromotion.get(item.promotion_id) ?? []
        existing.push(item)
        comboItemsByPromotion.set(item.promotion_id, existing)
      }
    }

    return rows.map((row) => toPromotion(row, comboItemsByPromotion))
  }
}

export const supabasePromotionRepository = new SupabasePromotionRepository()
