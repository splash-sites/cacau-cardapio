export interface Store {
  id: string
  name: string
  slug: string
  active: boolean
  supportsDineIn: boolean
  supportsPickup: boolean
  supportsDelivery: boolean
  resellerEnabled: boolean
  whatsappNumber: string | null
}
