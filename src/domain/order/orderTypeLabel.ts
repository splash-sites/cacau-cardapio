import type { Store } from '../store/Store'
import type { OrderType } from './OrderType'

const LABELS: Record<OrderType, string> = {
  dine_in: 'Cafeteria',
  delivery: 'Entrega',
  pickup: 'Para Levar',
}

export function orderTypeLabel(orderType: OrderType): string {
  return LABELS[orderType]
}

// Durante a navegação (cardápio/carrinho), orderType 'pickup'/'delivery' é só
// o placeholder do catálogo unificado — a escolha real entre retirar e
// receber só acontece no checkout (IdentificationPage). Enquanto a loja
// aceitar os dois modos, mostra o rótulo combinado em vez do específico, pra
// não sugerir uma decisão que o cliente ainda não tomou.
export function browsingOrderTypeLabel(orderType: OrderType, store: Store): string {
  const undecided = (orderType === 'pickup' || orderType === 'delivery') && store.supportsPickup && store.supportsDelivery
  return undecided ? 'Para Levar/Entrega' : orderTypeLabel(orderType)
}
