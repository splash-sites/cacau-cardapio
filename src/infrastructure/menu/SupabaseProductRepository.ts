import { formatProductName } from '../../domain/menu/formatProductName'
import type { Product } from '../../domain/menu/Product'
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
  }
}

export class SupabaseProductRepository implements ProductRepository {
  async listProducts(storeId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('public_products')
      .select(
        'id, store_id, name, category, category_id, description, image_url, unit, price, lover_price, stock_quantity, track_stock, sort_order, active, available_dine_in, available_pickup, available_delivery',
      )
      .eq('store_id', storeId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return (data as PublicProductRow[]).map(toProduct)
  }
}

export const supabaseProductRepository = new SupabaseProductRepository()
