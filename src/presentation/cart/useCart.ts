import { create } from 'zustand'
import type { AddonOption } from '../../domain/addon/AddonOption'
import * as Cart from '../../domain/cart/Cart'
import type { ComboLineInput } from '../../domain/cart/Cart'
import type { CartItem } from '../../domain/cart/CartItem'
import type { Product } from '../../domain/menu/Product'
import type { VariationOption } from '../../domain/variation/VariationOption'

interface CartState {
  items: CartItem[]
  addItem: (product: Product, addons?: AddonOption[], variations?: VariationOption[], quantity?: number) => void
  addCombo: (comboGroupId: string, promotionId: string, lines: ComboLineInput[]) => void
  incrementItem: (itemId: string) => void
  decrementItem: (itemId: string) => void
  removeItem: (itemId: string) => void
  removeComboGroup: (comboGroupId: string) => void
  setNote: (itemId: string, note: string) => void
  clear: () => void
}

export const useCart = create<CartState>((set) => ({
  items: [],
  addItem: (product, addons = [], variations = [], quantity = 1) =>
    set((state) => ({ items: Cart.addItem(state.items, product, addons, variations, quantity) })),
  addCombo: (comboGroupId, promotionId, lines) =>
    set((state) => ({ items: Cart.addComboItems(state.items, comboGroupId, promotionId, lines) })),
  incrementItem: (itemId) => set((state) => ({ items: Cart.incrementItem(state.items, itemId) })),
  decrementItem: (itemId) => set((state) => ({ items: Cart.decrementItem(state.items, itemId) })),
  removeItem: (itemId) => set((state) => ({ items: Cart.removeItem(state.items, itemId) })),
  removeComboGroup: (comboGroupId) => set((state) => ({ items: Cart.removeComboGroup(state.items, comboGroupId) })),
  setNote: (itemId, note) => set((state) => ({ items: Cart.setItemNote(state.items, itemId, note) })),
  clear: () => set({ items: [] }),
}))
