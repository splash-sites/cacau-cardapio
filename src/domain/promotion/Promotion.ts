export interface Promotion {
  id: string
  storeId: string
  title: string
  subtitle: string | null
  badgeLabel: string | null
  imageUrl: string
  productId: string
  sortOrder: number
}
