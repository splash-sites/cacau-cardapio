import type { Category } from '../../domain/menu/Category'
import type { CategoryRepository } from '../../application/menu/CategoryRepository'
import { supabase } from '../supabase/client'

// Tabela base, não view public_* — diferente do resto do repo, mas é o desenho
// combinado com quem mantém o RLS: `categories` já tem policy pública de
// leitura (`for select using (active = true)`), sem coluna interna a esconder
// (diferente de `products`, que some `ncm`/`cost_price`/`external_code`).
export class SupabaseCategoryRepository implements CategoryRepository {
  async listCategories(storeId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('store_id', storeId)
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error
    return data as Category[]
  }
}

export const supabaseCategoryRepository = new SupabaseCategoryRepository()
