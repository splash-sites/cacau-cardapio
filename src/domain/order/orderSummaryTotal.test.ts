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
      { productName: 'Pastel de Queijo', quantity: 2, unitPrice: 10, addonsUnitPrice: 0, addonNames: [], note: null },
      { productName: 'Água', quantity: 1, unitPrice: 7, addonsUnitPrice: 0, addonNames: [], note: null },
    ])
    expect(orderSummaryTotal(order)).toBe(27)
  })

  it('soma os adicionais em cada unidade do item', () => {
    // pedido real que aparecia como R$ 40,00: Fondue 24 + Chocolate branco 5, mais Cappuccino 16
    const order = makeOrder([
      { productName: 'Fondue', quantity: 1, unitPrice: 24, addonsUnitPrice: 5, addonNames: ['Chocolate branco'], note: null },
      { productName: 'Cappuccino', quantity: 1, unitPrice: 16, addonsUnitPrice: 0, addonNames: [], note: null },
    ])
    expect(orderSummaryTotal(order)).toBe(45)
  })

  it('adicional conta de novo a cada unidade do produto', () => {
    const order = makeOrder([
      { productName: 'Cappuccino', quantity: 2, unitPrice: 8, addonsUnitPrice: 9, addonNames: ['Morango'], note: null },
    ])
    expect(orderSummaryTotal(order)).toBe(34)
  })

  it('pedido sem itens soma zero', () => {
    expect(orderSummaryTotal(makeOrder([]))).toBe(0)
  })
})
