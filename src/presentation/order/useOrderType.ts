import { create } from 'zustand'
import type { OrderType } from '../../domain/order/OrderType'
import { useCart } from '../cart/useCart'

interface OrderTypeState {
  orderType: OrderType | null
  tableNumber: string | null
  setOrderType: (orderType: OrderType) => void
  setTableNumber: (tableNumber: string) => void
  clearTableNumber: () => void
  reset: () => void
}

export const useOrderType = create<OrderTypeState>((set, get) => ({
  orderType: null,
  tableNumber: null,
  setOrderType: (orderType) => {
    // Cada tipo de pedido tem seu próprio catálogo (available_dine_in/pickup/delivery) —
    // trocar de tipo com itens de outro catálogo no carrinho geraria pedido com produto indisponível.
    const previousOrderType = get().orderType
    if (previousOrderType !== null && previousOrderType !== orderType) useCart.getState().clear()
    set({ orderType })
  },
  setTableNumber: (tableNumber) => set({ tableNumber }),
  clearTableNumber: () => set({ tableNumber: null }),
  reset: () => set({ orderType: null, tableNumber: null }),
}))
