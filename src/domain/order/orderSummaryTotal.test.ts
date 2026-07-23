import { describe, expect, it } from 'vitest'
import { orderSummaryTotal } from './orderSummaryTotal'
import type { OrderSummary } from './OrderSummary'

function makeOrder(items: OrderSummary['items']): OrderSummary {
  return {
    id: '1',
    orderType: 'pickup',
    status: 'received',
    tableNumber: null,
    createdAt: '2026-07-22T10:00:00Z',
    items,
  }
}

describe('orderSummaryTotal', () => {
  it('soma preço unitário vezes quantidade de todos os itens', () => {
    const order = makeOrder([
      { productName: 'Pastel de Queijo', quantity: 2, unitPrice: 10, note: null },
      { productName: 'Água', quantity: 1, unitPrice: 7, note: null },
    ])
    expect(orderSummaryTotal(order)).toBe(27)
  })

  it('pedido sem itens soma zero', () => {
    expect(orderSummaryTotal(makeOrder([]))).toBe(0)
  })
})
