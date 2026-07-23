import { describe, expect, it } from 'vitest'
import { isProductAvailableForOrderType } from './productAvailability'
import type { Product } from './Product'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    storeId: 'store-1',
    name: 'Brownie',
    category: 'Doces',
    description: null,
    imageUrl: null,
    unit: 'un',
    price: 9.9,
    stockQuantity: 10,
    trackStock: true,
    sortOrder: 0,
    active: true,
    availableDineIn: true,
    availablePickup: true,
    availableDelivery: true,
    ...overrides,
  }
}

describe('isProductAvailableForOrderType', () => {
  it('disponível quando ativo, vendável no canal e com estoque', () => {
    expect(isProductAvailableForOrderType(makeProduct(), 'dine_in')).toBe(true)
  })

  it('indisponível quando inativo', () => {
    expect(isProductAvailableForOrderType(makeProduct({ active: false }), 'dine_in')).toBe(false)
  })

  it('indisponível pra delivery quando só vende dine_in/pickup', () => {
    const product = makeProduct({ availableDelivery: false })
    expect(isProductAvailableForOrderType(product, 'delivery')).toBe(false)
    expect(isProductAvailableForOrderType(product, 'dine_in')).toBe(true)
  })

  it('indisponível sem estoque quando trackStock é true', () => {
    expect(isProductAvailableForOrderType(makeProduct({ trackStock: true, stockQuantity: 0 }), 'pickup')).toBe(false)
  })

  it('disponível sem estoque quando trackStock é false', () => {
    expect(isProductAvailableForOrderType(makeProduct({ trackStock: false, stockQuantity: 0 }), 'pickup')).toBe(true)
  })
})
