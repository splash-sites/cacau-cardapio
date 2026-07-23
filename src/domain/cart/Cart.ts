import type { Product } from '../menu/Product'
import type { CartItem } from './CartItem'

export function addItem(items: CartItem[], product: Product): CartItem[] {
  const existing = items.find((item) => item.product.id === product.id)
  if (existing) {
    return items.map((item) =>
      item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
    )
  }
  return [...items, { product, quantity: 1 }]
}

export function incrementItem(items: CartItem[], productId: string): CartItem[] {
  return items.map((item) => (item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item))
}

export function decrementItem(items: CartItem[], productId: string): CartItem[] {
  return items
    .map((item) => (item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
    .filter((item) => item.quantity > 0)
}

export function removeItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.product.id !== productId)
}

export function setItemNote(items: CartItem[], productId: string, note: string): CartItem[] {
  return items.map((item) => (item.product.id === productId ? { ...item, note } : item))
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.product.price * item.quantity, 0)
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0)
}
