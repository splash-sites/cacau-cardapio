import { describe, expect, it } from 'vitest'
import { isProductAvailableForOrderType, isProductAvailableForReseller, isResellerSoldOut } from './productAvailability'
import type { Product } from './Product'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    storeId: 'store-1',
    name: 'Brownie',
    category: 'Doces',
    categoryId: null,
    description: null,
    imageUrl: null,
    unit: 'un',
    price: 9.9,
    loverPrice: 8.9,
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

describe('isResellerSoldOut', () => {
  it('esgotado quando controla estoque e o saldo é zero', () => {
    expect(isResellerSoldOut(makeProduct({ resellerTrackStock: true, resellerStockQuantity: 0 }))).toBe(true)
  })

  it('esgotado quando o saldo é negativo', () => {
    expect(isResellerSoldOut(makeProduct({ resellerTrackStock: true, resellerStockQuantity: -2 }))).toBe(true)
  })

  it('não esgota quando não controla estoque, mesmo com saldo zero', () => {
    expect(isResellerSoldOut(makeProduct({ resellerTrackStock: false, resellerStockQuantity: 0 }))).toBe(false)
  })

  it('não esgota com saldo positivo', () => {
    expect(isResellerSoldOut(makeProduct({ resellerTrackStock: true, resellerStockQuantity: 1 }))).toBe(false)
  })
})

describe('isProductAvailableForReseller', () => {
  const resellerProduct = { availableReseller: true, resellerTrackStock: true, resellerStockQuantity: 5 }

  it('disponível quando ativo, liberado pro revendedor e com saldo', () => {
    expect(isProductAvailableForReseller(makeProduct(resellerProduct), 'pickup')).toBe(true)
    expect(isProductAvailableForReseller(makeProduct(resellerProduct), 'delivery')).toBe(true)
  })

  it('nunca disponível em dine_in', () => {
    expect(isProductAvailableForReseller(makeProduct(resellerProduct), 'dine_in')).toBe(false)
  })

  it('indisponível quando não liberado pro revendedor', () => {
    expect(isProductAvailableForReseller(makeProduct({ ...resellerProduct, availableReseller: false }), 'pickup')).toBe(false)
  })

  it('indisponível quando inativo', () => {
    expect(isProductAvailableForReseller(makeProduct({ ...resellerProduct, active: false }), 'pickup')).toBe(false)
  })

  it('indisponível quando o saldo do revendedor acabou', () => {
    expect(isProductAvailableForReseller(makeProduct({ ...resellerProduct, resellerStockQuantity: 0 }), 'pickup')).toBe(false)
  })

  it('ignora o estoque do varejo', () => {
    const product = makeProduct({ ...resellerProduct, trackStock: true, stockQuantity: 0 })
    expect(isProductAvailableForReseller(product, 'pickup')).toBe(true)
  })

  it('indisponível quando as colunas do revendedor não vieram (varejo)', () => {
    expect(isProductAvailableForReseller(makeProduct(), 'pickup')).toBe(false)
  })
})
