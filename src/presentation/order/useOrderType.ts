import { create } from 'zustand'
import type { OrderType } from '../../domain/order/OrderType'

interface OrderTypeState {
  orderType: OrderType | null
  tableNumber: string | null
  setOrderType: (orderType: OrderType) => void
  setTableNumber: (tableNumber: string) => void
  clearTableNumber: () => void
  reset: () => void
}

export const useOrderType = create<OrderTypeState>((set) => ({
  orderType: null,
  tableNumber: null,
  setOrderType: (orderType) => set({ orderType }),
  setTableNumber: (tableNumber) => set({ tableNumber }),
  clearTableNumber: () => set({ tableNumber: null }),
  reset: () => set({ orderType: null, tableNumber: null }),
}))
