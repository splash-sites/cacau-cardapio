import type { AddonOption } from '../addon/AddonOption'
import type { Product } from '../menu/Product'
import { resolveBasePrice } from '../variation/variationSelection'
import type { VariationOption } from '../variation/VariationOption'
import type { CartItem } from './CartItem'

// Duas seleções de adicional/variação diferente pro mesmo produto são linhas
// separadas no carrinho (preço final não é o mesmo) — por isso a chave do
// item combina product.id com o que foi escolhido, não só product.id.
export function cartItemId(productId: string, addons: AddonOption[], variations: VariationOption[] = []): string {
  const addonKey = [...addons].map((addon) => addon.id).sort().join(',')
  const variationKey = [...variations].map((variation) => variation.id).sort().join(',')
  const parts = [productId]
  if (variationKey) parts.push(`v:${variationKey}`)
  if (addonKey) parts.push(`a:${addonKey}`)
  return parts.join('::')
}

export function addItem(
  items: CartItem[],
  product: Product,
  addons: AddonOption[] = [],
  variations: VariationOption[] = [],
  quantity = 1,
): CartItem[] {
  const id = cartItemId(product.id, addons, variations)
  const existing = items.find((item) => item.id === id)
  if (existing) {
    return items.map((item) => (item.id === id ? { ...item, quantity: item.quantity + quantity } : item))
  }
  return [...items, { id, product, quantity, addons, variations }]
}

export function incrementItem(items: CartItem[], itemId: string): CartItem[] {
  return items.map((item) => (item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item))
}

export function decrementItem(items: CartItem[], itemId: string): CartItem[] {
  return items
    .map((item) => (item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item))
    .filter((item) => item.quantity > 0)
}

export function removeItem(items: CartItem[], itemId: string): CartItem[] {
  return items.filter((item) => item.id !== itemId)
}

export function setItemNote(items: CartItem[], itemId: string, note: string): CartItem[] {
  return items.map((item) => (item.id === itemId ? { ...item, note } : item))
}

function addonsTotal(addons: AddonOption[]): number {
  return addons.reduce((sum, addon) => sum + addon.price, 0)
}

function addonsLoverTotal(addons: AddonOption[]): number {
  return addons.reduce((sum, addon) => sum + addon.loverPrice, 0)
}

export function itemUnitPrice(item: CartItem): number {
  return resolveBasePrice(item.product, item.variations).regular + addonsTotal(item.addons)
}

export function itemUnitLoverPrice(item: CartItem): number {
  return resolveBasePrice(item.product, item.variations).lover + addonsLoverTotal(item.addons)
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + itemUnitPrice(item) * item.quantity, 0)
}

export function cartLoverTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + itemUnitLoverPrice(item) * item.quantity, 0)
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0)
}
