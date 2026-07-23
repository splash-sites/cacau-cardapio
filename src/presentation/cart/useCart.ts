import { create } from 'zustand'
import * as Cart from '../../domain/cart/Cart'
import type { CartItem } from '../../domain/cart/CartItem'
import type { Product } from '../../domain/menu/Product'

interface CartState {
  items: CartItem[]
  addItem: (product: Product) => void
  incrementItem: (productId: string) => void
  decrementItem: (productId: string) => void
  removeItem: (productId: string) => void
  setNote: (productId: string, note: string) => void
  clear: () => void
}

export const useCart = create<CartState>((set) => ({
  items: [],
  addItem: (product) => set((state) => ({ items: Cart.addItem(state.items, product) })),
  incrementItem: (productId) => set((state) => ({ items: Cart.incrementItem(state.items, productId) })),
  decrementItem: (productId) => set((state) => ({ items: Cart.decrementItem(state.items, productId) })),
  removeItem: (productId) => set((state) => ({ items: Cart.removeItem(state.items, productId) })),
  setNote: (productId, note) => set((state) => ({ items: Cart.setItemNote(state.items, productId, note) })),
  clear: () => set({ items: [] }),
}))
