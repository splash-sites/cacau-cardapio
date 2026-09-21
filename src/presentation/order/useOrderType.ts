import { create } from 'zustand'
import type { OrderType } from '../../domain/order/OrderType'
import type { SalesChannel } from '../../domain/order/SalesChannel'
import { useCart } from '../cart/useCart'

interface OrderTypeState {
  orderType: OrderType | null
  tableNumber: string | null
  salesChannel: SalesChannel
  setOrderType: (orderType: OrderType) => void
  setSalesChannel: (salesChannel: SalesChannel) => void
  setTableNumber: (tableNumber: string) => void
  clearTableNumber: () => void
  reset: () => void
}

export const useOrderType = create<OrderTypeState>((set, get) => ({
  orderType: null,
  tableNumber: null,
  salesChannel: 'retail',
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
  setSalesChannel: (salesChannel) => {
    // Varejo e revendedor são catálogos diferentes (available_reseller x
    // available_pickup/...) e o revendedor tem saldo próprio — carrinho de um
    // canal nunca vale no outro.
    if (get().salesChannel !== salesChannel) useCart.getState().clear()
    set({ salesChannel })
  },
  setTableNumber: (tableNumber) => set({ tableNumber }),
  clearTableNumber: () => set({ tableNumber: null }),
  reset: () => set({ orderType: null, tableNumber: null, salesChannel: 'retail' }),
}))
