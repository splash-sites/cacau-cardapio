import type { Store } from '../../domain/store/Store'
import type { StoreRepository } from '../../application/store/StoreRepository'
import { supabase } from '../supabase/client'

interface PublicStoreRow {
  id: string
  name: string
  slug: string
  active: boolean
  supports_dine_in: boolean
  supports_pickup: boolean
  supports_delivery: boolean
  reseller_enabled: boolean
}

function toStore(row: PublicStoreRow): Store {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    active: row.active,
    supportsDineIn: row.supports_dine_in,
    supportsPickup: row.supports_pickup,
    supportsDelivery: row.supports_delivery,
    resellerEnabled: row.reseller_enabled,
  }
}

export class SupabaseStoreRepository implements StoreRepository {
  async getStoreBySlug(slug: string): Promise<Store | null> {
    const { data, error } = await supabase
      .from('public_stores')
      .select('id, name, slug, active, supports_dine_in, supports_pickup, supports_delivery, reseller_enabled')
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle()
    if (error) throw error
    return data ? toStore(data as PublicStoreRow) : null
  }
}

export const supabaseStoreRepository = new SupabaseStoreRepository()
