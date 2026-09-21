import { formatProductName } from '../../domain/menu/formatProductName'
import type { Product } from '../../domain/menu/Product'
import type { SalesChannel } from '../../domain/order/SalesChannel'
import type { ProductRepository } from '../../application/menu/ProductRepository'
import { supabase } from '../supabase/client'

interface PublicProductRow {
  id: string
  store_id: string
  name: string
  category: string
  category_id: string | null
  description: string | null
  image_url: string | null
  unit: string | null
  price: number
  lover_price: number | null
  stock_quantity: number
  track_stock: boolean
  sort_order: number
  active: boolean
  available_dine_in: boolean
  available_pickup: boolean
  available_delivery: boolean
  // null em produto de varejo (a view só preenche isso com available_reseller = true);
  // ausentes quando a query do varejo não seleciona as colunas.
  available_reseller?: boolean | null
  reseller_track_stock?: boolean | null
  reseller_stock_quantity?: number | null
}

function toProduct(row: PublicProductRow): Product {
  return {
    id: row.id,
    storeId: row.store_id,
    name: formatProductName(row.name),
    category: row.category,
    categoryId: row.category_id,
    description: row.description,
    imageUrl: row.image_url,
    unit: row.unit,
    price: row.price,
    loverPrice: row.lover_price ?? row.price,
    stockQuantity: row.stock_quantity,
    trackStock: row.track_stock,
    sortOrder: row.sort_order,
    active: row.active,
    availableDineIn: row.available_dine_in,
    availablePickup: row.available_pickup,
    availableDelivery: row.available_delivery,
    availableReseller: row.available_reseller ?? undefined,
    resellerTrackStock: row.reseller_track_stock ?? undefined,
    resellerStockQuantity: row.reseller_stock_quantity ?? undefined,
  }
}

const RETAIL_COLUMNS =
  'id, store_id, name, category, category_id, description, image_url, unit, price, lover_price, stock_quantity, track_stock, sort_order, active, available_dine_in, available_pickup, available_delivery'

// Colunas do revendedor só são pedidas no canal de revendedor — o varejo nunca
// lê coluna que não usa.
const RESELLER_COLUMNS = `${RETAIL_COLUMNS}, available_reseller, reseller_track_stock, reseller_stock_quantity`

export class SupabaseProductRepository implements ProductRepository {
  async listProducts(storeId: string, channel: SalesChannel = 'retail'): Promise<Product[]> {
    const { data, error } = await supabase
      .from('public_products')
      .select(channel === 'reseller' ? RESELLER_COLUMNS : RETAIL_COLUMNS)
      .eq('store_id', storeId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return (data as unknown as PublicProductRow[]).map(toProduct)
  }
}

export const supabaseProductRepository = new SupabaseProductRepository()
