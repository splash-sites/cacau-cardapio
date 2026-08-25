import { describe, expect, it } from 'vitest'
import { distributePromotionDiscount, promotionBaseTotal } from './promotionPricing'

function sumTotal(results: ReturnType<typeof distributePromotionDiscount>): number {
  return results.reduce((sum, r) => sum + Math.round(r.discountedUnitPrice * r.quantity * 100), 0)
}

describe('promotionBaseTotal', () => {
  it('soma preço × quantidade de todas as linhas', () => {
    expect(promotionBaseTotal([{ productId: 'a', quantity: 1, unitPrice: 20 }, { productId: 'b', quantity: 2, unitPrice: 5 }])).toBe(30)
  })
})

describe('distributePromotionDiscount', () => {
  it('sem desconto (discountType null): preço da linha não muda', () => {
    const result = distributePromotionDiscount(
      [{ productId: 'a', quantity: 1, unitPrice: 20 }, { productId: 'b', quantity: 1, unitPrice: 10 }],
      null,
      null,
    )
    expect(result).toEqual([
      { productId: 'a', quantity: 1, discountedUnitPrice: 20 },
      { productId: 'b', quantity: 1, discountedUnitPrice: 10 },
    ])
  })

  it('percent com divisão exata', () => {
    const result = distributePromotionDiscount(
      [{ productId: 'a', quantity: 1, unitPrice: 20 }, { productId: 'b', quantity: 1, unitPrice: 10 }],
      'percent',
      50,
    )
    expect(result).toEqual([
      { productId: 'a', quantity: 1, discountedUnitPrice: 10 },
      { productId: 'b', quantity: 1, discountedUnitPrice: 5 },
    ])
  })

  it('fixed_amount com divisão exata', () => {
    const result = distributePromotionDiscount(
      [{ productId: 'a', quantity: 1, unitPrice: 20 }, { productId: 'b', quantity: 1, unitPrice: 10 }],
      'fixed_amount',
      6,
    )
    expect(sumTotal(result)).toBe(2400)
  })

  it('desconto nunca fica negativo (fixed_amount maior que o total)', () => {
    const result = distributePromotionDiscount([{ productId: 'a', quantity: 1, unitPrice: 10 }], 'fixed_amount', 999)
    expect(result[0].discountedUnitPrice).toBe(0)
  })

  it('resto feio: soma das linhas bate exata com o total descontado, até o centavo', () => {
    const lines = [
      { productId: 'a', quantity: 1, unitPrice: 19.9 },
      { productId: 'b', quantity: 3, unitPrice: 7.33 },
      { productId: 'c', quantity: 2, unitPrice: 4.21 },
    ]
    const baseTotal = promotionBaseTotal(lines)
    const result = distributePromotionDiscount(lines, 'percent', 17)
    const expectedTotalCents = Math.round(baseTotal * (1 - 0.17) * 100)
    expect(sumTotal(result)).toBe(expectedTotalCents)
  })

  it('combo de 1 item só (caso degenerado: promoção com desconto, sem combo_items)', () => {
    const result = distributePromotionDiscount([{ productId: 'a', quantity: 3, unitPrice: 8 }], 'percent', 25)
    expect(result).toEqual([{ productId: 'a', quantity: 3, discountedUnitPrice: 6 }])
  })

  it('baseTotal zero não quebra (retorna preço 0 pra todas as linhas)', () => {
    const result = distributePromotionDiscount([{ productId: 'a', quantity: 1, unitPrice: 0 }], 'percent', 50)
    expect(result[0].discountedUnitPrice).toBe(0)
  })
})
