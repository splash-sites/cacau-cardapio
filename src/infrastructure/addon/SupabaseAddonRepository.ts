import type { AddonGroup, AddonSelectionType } from '../../domain/addon/AddonGroup'
import type { AddonRepository } from '../../application/addon/AddonRepository'
import { supabase } from '../supabase/client'

interface AddonGroupRow {
  group_id: string
  group_name: string
  selection_type: AddonSelectionType
  max_quantity: number | null
  // lover_price pode vir null pra opções que o admin ainda não preencheu
  // (coluna existe, dado em preenchimento) — cai pro preço normal enquanto isso.
  options: { id: string; name: string; price: number; lover_price: number | null }[]
}

function toAddonGroups(rows: AddonGroupRow[]): AddonGroup[] {
  return rows.map((row) => ({
    id: row.group_id,
    name: row.group_name,
    selectionType: row.selection_type,
    maxQuantity: row.max_quantity,
    options: row.options.map((option) => ({
      id: option.id,
      name: option.name,
      price: option.price,
      loverPrice: option.lover_price ?? option.price,
    })),
  }))
}

export class SupabaseAddonRepository implements AddonRepository {
  async listProductAddonGroups(productId: string): Promise<AddonGroup[]> {
    const { data, error } = await supabase
      .from('public_product_addon_groups')
      .select('group_id, group_name, selection_type, max_quantity, options')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return toAddonGroups(data as unknown as AddonGroupRow[])
  }
}

export const supabaseAddonRepository = new SupabaseAddonRepository()
