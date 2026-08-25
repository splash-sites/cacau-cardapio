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

export interface ComboLineInput {
  product: Product
  addons: AddonOption[]
  variations: VariationOption[]
  quantity: number
  // Preço base (produto+variação) já com o desconto do combo aplicado — ver
  // CartItem.discountedUnitPrice pra detalhe de por que isso é só exibição.
  discountedUnitPrice: number
  discountedLoverUnitPrice: number
}

// Combo é atômico: adiciona todas as linhas de uma vez, cada uma com id
// prefixado por comboGroupId (nunca colide com item avulso, e cada "Adicionar
// combo" gera um grupo novo — não mescla com uma adição anterior do mesmo
// combo, mesmo que a composição seja idêntica). Sem +/- de quantidade depois:
// pra mudar, remove o grupo (removeComboGroup) e adiciona de novo.
export function addComboItems(
  items: CartItem[],
  comboGroupId: string,
  promotionId: string,
  lines: ComboLineInput[],
): CartItem[] {
  const comboItems: CartItem[] = lines.map((line) => ({
    id: `combo:${comboGroupId}:${line.product.id}`,
    product: line.product,
    quantity: line.quantity,
    addons: line.addons,
    variations: line.variations,
    comboGroupId,
    promotionId,
    discountedUnitPrice: line.discountedUnitPrice,
    discountedLoverUnitPrice: line.discountedLoverUnitPrice,
  }))
  return [...items, ...comboItems]
}

export function removeComboGroup(items: CartItem[], comboGroupId: string): CartItem[] {
  return items.filter((item) => item.comboGroupId !== comboGroupId)
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
  const base = item.discountedUnitPrice ?? resolveBasePrice(item.product, item.variations).regular
  return base + addonsTotal(item.addons)
}

export function itemUnitLoverPrice(item: CartItem): number {
  const base = item.discountedLoverUnitPrice ?? resolveBasePrice(item.product, item.variations).lover
  return base + addonsLoverTotal(item.addons)
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
