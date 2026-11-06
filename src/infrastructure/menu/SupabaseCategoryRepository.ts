import type { Category } from '../../domain/menu/Category'
import type { MenuChannel } from '../../domain/menu/groupByCategory'
import type { CategoryRepository } from '../../application/menu/CategoryRepository'
import { supabase } from '../supabase/client'

function sortColumnFor(channel: MenuChannel): 'sort_order' | 'sort_order_pickup' | 'sort_order_reseller' {
  if (channel === 'pickup') return 'sort_order_pickup'
  if (channel === 'reseller') return 'sort_order_reseller'
  return 'sort_order'
}

// Tabela base, não view public_* — diferente do resto do repo, mas é o desenho
// combinado com quem mantém o RLS: `categories` já tem policy pública de
// leitura (`for select using (active = true)`), sem coluna interna a esconder
// (diferente de `products`, que some `ncm`/`cost_price`/`external_code`).
export class SupabaseCategoryRepository implements CategoryRepository {
  async listCategories(storeId: string, channel: MenuChannel = 'dine_in'): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('store_id', storeId)
      .eq('active', true)
      .order(sortColumnFor(channel), { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error
    return data as Category[]
  }
}

export const supabaseCategoryRepository = new SupabaseCategoryRepository()
