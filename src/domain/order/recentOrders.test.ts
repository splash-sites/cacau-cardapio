import { describe, expect, it } from 'vitest'
import type { OrderSummary } from './OrderSummary'
import { recentOrders } from './recentOrders'

function makeOrder(id: string, createdAt: string): OrderSummary {
  return { id, orderType: 'pickup', status: 'finalized', tableNumber: null, createdAt, items: [] }
}

describe('recentOrders', () => {
  it('ordena do mais recente pro mais antigo', () => {
    const orders = [
      makeOrder('o1', '2026-07-28T10:00:00-03:00'),
      makeOrder('o2', '2026-07-30T10:00:00-03:00'),
      makeOrder('o3', '2026-07-29T10:00:00-03:00'),
    ]

    expect(recentOrders(orders, 10).map((o) => o.id)).toEqual(['o2', 'o3', 'o1'])
  })

  it('corta no limite informado', () => {
    const orders = [
      makeOrder('o1', '2026-07-28T10:00:00-03:00'),
      makeOrder('o2', '2026-07-30T10:00:00-03:00'),
      makeOrder('o3', '2026-07-29T10:00:00-03:00'),
    ]

    expect(recentOrders(orders, 2).map((o) => o.id)).toEqual(['o2', 'o3'])
  })

  it('lista vazia', () => {
    expect(recentOrders([], 10)).toEqual([])
  })
})
