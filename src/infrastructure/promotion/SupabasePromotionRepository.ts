import type { Promotion } from '../../domain/promotion/Promotion'
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
}

function toPromotion(row: PublicPromotionRow): Promotion {
  return {
    id: row.id,
    storeId: row.store_id,
    title: row.title,
    subtitle: row.subtitle,
    badgeLabel: row.badge_label,
    imageUrl: row.image_url,
    productId: row.product_id,
    sortOrder: row.sort_order,
  }
}

export class SupabasePromotionRepository implements PromotionRepository {
  async listPromotions(storeId: string): Promise<Promotion[]> {
    const { data, error } = await supabase
      .from('public_promotions')
      .select('id, store_id, title, subtitle, badge_label, image_url, product_id, sort_order')
      .eq('store_id', storeId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return (data as PublicPromotionRow[]).map(toPromotion)
  }
}

export const supabasePromotionRepository = new SupabasePromotionRepository()
