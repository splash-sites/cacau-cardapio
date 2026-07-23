import type { OrderStatus } from './OrderStatus'
import type { OrderType } from './OrderType'

export interface StatusStep {
  status: OrderStatus
  label: string
}

// dine_in não passa por out_for_delivery (não faz sentido pra consumo no local).
// out_for_delivery é o mesmo valor de banco pra pickup e delivery — só o rótulo
// muda, confirmado com quem mantém o admin (painel usa o mesmo status por trás).
export function orderStatusSteps(orderType: OrderType): StatusStep[] {
  if (orderType === 'dine_in') {
    return [
      { status: 'received', label: 'Recebido' },
      { status: 'preparing', label: 'Em preparo' },
      { status: 'finalized', label: 'Finalizado' },
    ]
  }
  return [
    { status: 'received', label: 'Recebido' },
    { status: 'preparing', label: 'Em preparo' },
    { status: 'out_for_delivery', label: orderType === 'pickup' ? 'Pronto pra retirada' : 'Saiu pra entrega' },
    { status: 'finalized', label: 'Finalizado' },
  ]
}

export function currentStepIndex(steps: StatusStep[], status: OrderStatus): number {
  return steps.findIndex((step) => step.status === status)
}
