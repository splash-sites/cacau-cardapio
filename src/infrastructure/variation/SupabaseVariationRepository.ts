import type { VariationGroup, VariationPriceMode } from '../../domain/variation/VariationGroup'
import type { VariationRepository } from '../../application/variation/VariationRepository'
import { supabase } from '../supabase/client'

interface ProductVariationGroupRow {
  variation_groups: {
    id: string
    name: string
    price_mode: VariationPriceMode
    // lover_price pode vir null pra opções que o admin ainda não preencheu
    // (coluna existe, dado em preenchimento) — cai pro preço normal enquanto isso.
    variation_options: { id: string; name: string; price: number; lover_price: number | null }[]
  }
}

function toVariationGroups(rows: ProductVariationGroupRow[]): VariationGroup[] {
  return rows.map((row) => ({
    id: row.variation_groups.id,
    name: row.variation_groups.name,
    priceMode: row.variation_groups.price_mode,
    options: row.variation_groups.variation_options.map((option) => ({
      id: option.id,
      name: option.name,
      price: option.price,
      loverPrice: option.lover_price ?? option.price,
      priceMode: row.variation_groups.price_mode,
    })),
  }))
}

export class SupabaseVariationRepository implements VariationRepository {
  async listProductVariationGroups(productId: string): Promise<VariationGroup[]> {
    const { data, error } = await supabase
      .from('product_variation_groups')
      .select('variation_groups!inner(id, name, price_mode, variation_options!inner(id, name, price, lover_price))')
      .eq('product_id', productId)
      .eq('variation_groups.active', true)
      .eq('variation_groups.variation_options.active', true)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return toVariationGroups(data as unknown as ProductVariationGroupRow[])
  }
}

export const supabaseVariationRepository = new SupabaseVariationRepository()
