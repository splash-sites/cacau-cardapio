import { describe, expect, it } from 'vitest'
import { hasActiveOrders } from './hasActiveOrders'
import type { OrderSummary } from './OrderSummary'

function makeOrder(status: OrderSummary['status']): OrderSummary {
  return { id: 'o1', orderType: 'pickup', status, tableNumber: null, createdAt: '2026-07-30T10:00:00-03:00', items: [] }
}

describe('hasActiveOrders', () => {
  it('true se algum pedido ainda está em andamento', () => {
    expect(hasActiveOrders([makeOrder('finalized'), makeOrder('preparing')])).toBe(true)
  })

  it('false se todos já terminaram (finalized/cancelled)', () => {
    expect(hasActiveOrders([makeOrder('finalized'), makeOrder('cancelled')])).toBe(false)
  })

  it('false pra lista vazia', () => {
    expect(hasActiveOrders([])).toBe(false)
  })
})
