export interface Product {
  id: string
  storeId: string
  name: string
  category: string
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
