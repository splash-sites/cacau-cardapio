import { create } from 'zustand'
import type { AddonOption } from '../../domain/addon/AddonOption'
import * as Cart from '../../domain/cart/Cart'
import type { CartItem } from '../../domain/cart/CartItem'
import type { Product } from '../../domain/menu/Product'
import type { VariationOption } from '../../domain/variation/VariationOption'

interface CartState {
  items: CartItem[]
  addItem: (product: Product, addons?: AddonOption[], variations?: VariationOption[], quantity?: number) => void
  incrementItem: (itemId: string) => void
  decrementItem: (itemId: string) => void
  removeItem: (itemId: string) => void
  setNote: (itemId: string, note: string) => void
  clear: () => void
}

export const useCart = create<CartState>((set) => ({
  items: [],
  addItem: (product, addons = [], variations = [], quantity = 1) =>
    set((state) => ({ items: Cart.addItem(state.items, product, addons, variations, quantity) })),
  incrementItem: (itemId) => set((state) => ({ items: Cart.incrementItem(state.items, itemId) })),
  decrementItem: (itemId) => set((state) => ({ items: Cart.decrementItem(state.items, itemId) })),
  removeItem: (itemId) => set((state) => ({ items: Cart.removeItem(state.items, itemId) })),
  setNote: (itemId, note) => set((state) => ({ items: Cart.setItemNote(state.items, itemId, note) })),
  clear: () => set({ items: [] }),
}))
