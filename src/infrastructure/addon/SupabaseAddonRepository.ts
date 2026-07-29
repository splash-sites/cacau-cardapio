import type { AddonGroup, AddonSelectionType } from '../../domain/addon/AddonGroup'
import type { AddonRepository } from '../../application/addon/AddonRepository'
import { supabase } from '../supabase/client'

interface ProductAddonGroupRow {
  selection_type: AddonSelectionType
  max_quantity: number | null
  addon_groups: {
    id: string
    name: string
    // lover_price pode vir null pra opções que o admin ainda não preencheu
    // (coluna existe, dado em preenchimento) — cai pro preço normal enquanto isso.
    addon_options: { id: string; name: string; price: number; lover_price: number | null }[]
  }
}

function toAddonGroups(rows: ProductAddonGroupRow[]): AddonGroup[] {
  return rows.map((row) => ({
    id: row.addon_groups.id,
    name: row.addon_groups.name,
    selectionType: row.selection_type,
    maxQuantity: row.max_quantity,
    options: row.addon_groups.addon_options.map((option) => ({
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
      .from('product_addon_groups')
      .select(
        'selection_type, max_quantity, addon_groups!inner(id, name, addon_options!inner(id, name, price, lover_price))',
      )
      .eq('product_id', productId)
      .eq('addon_groups.active', true)
      .eq('addon_groups.addon_options.active', true)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return toAddonGroups(data as unknown as ProductAddonGroupRow[])
  }
}

export const supabaseAddonRepository = new SupabaseAddonRepository()
