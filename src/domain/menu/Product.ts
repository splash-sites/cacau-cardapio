export interface Product {
  id: string
  storeId: string
  name: string
  category: string
  // Fonte de verdade pra agrupar/ordenar o cardápio (ver domain/menu/groupByCategory.ts)
  // — `category` (texto) continua existindo só como espelho legado, nunca usar
  // pra agrupar. null = produto ainda não categorizado no admin.
  categoryId: string | null
  description: string | null
  imageUrl: string | null
  unit: string | null
  price: number
  loverPrice: number
  stockQuantity: number
  trackStock: boolean
  sortOrder: number
  active: boolean
  availableDineIn: boolean
  availablePickup: boolean
  availableDelivery: boolean
}
