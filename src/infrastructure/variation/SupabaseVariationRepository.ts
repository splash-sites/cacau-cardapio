import type { VariationGroup, VariationPriceMode } from '../../domain/variation/VariationGroup'
import type { VariationRepository } from '../../application/variation/VariationRepository'
import { supabase } from '../supabase/client'

interface VariationGroupRow {
  group_id: string
  group_name: string
  price_mode: VariationPriceMode
  // lover_price pode vir null pra opções que o admin ainda não preencheu
  // (coluna existe, dado em preenchimento) — cai pro preço normal enquanto isso.
  options: { id: string; name: string; price: number; lover_price: number | null }[]
}

function toVariationGroups(rows: VariationGroupRow[]): VariationGroup[] {
  return rows.map((row) => ({
    id: row.group_id,
    name: row.group_name,
    priceMode: row.price_mode,
    options: row.options.map((option) => ({
      id: option.id,
      name: option.name,
      price: option.price,
      loverPrice: option.lover_price ?? option.price,
      priceMode: row.price_mode,
    })),
  }))
}

export class SupabaseVariationRepository implements VariationRepository {
  async listProductVariationGroups(productId: string): Promise<VariationGroup[]> {
    const { data, error } = await supabase
      .from('public_product_variation_groups')
      .select('group_id, group_name, price_mode, options')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return toVariationGroups(data as unknown as VariationGroupRow[])
  }
}

export const supabaseVariationRepository = new SupabaseVariationRepository()
