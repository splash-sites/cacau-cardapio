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
    // trocar de tipo com itens de outro catálogo geraria pedido com produto indisponível.
    // Exceção: pickup <-> delivery não limpa. Viraram uma escolha só feita no checkout
    // (IdentificationPage) — o catálogo inteiro é navegado sob 'pickup' até ali, então o
    // carrinho já é sempre consistente com available_pickup; só o rótulo final muda.
    const previousOrderType = get().orderType
    const catalogChanged =
      previousOrderType !== null &&
      previousOrderType !== orderType &&
      (previousOrderType === 'dine_in' || orderType === 'dine_in')
    if (catalogChanged) useCart.getState().clear()
    set({ orderType })
  },
  setTableNumber: (tableNumber) => set({ tableNumber }),
  clearTableNumber: () => set({ tableNumber: null }),
  reset: () => set({ orderType: null, tableNumber: null }),
}))
