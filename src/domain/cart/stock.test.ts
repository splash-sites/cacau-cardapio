import { describe, expect, it } from 'vitest'
import type { Product } from '../menu/Product'
import type { CartItem } from './CartItem'
import { refreshCartStock, remainingStock, stockLimit } from './stock'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    storeId: 'store-1',
    name: 'Brownie',
    category: 'Doces',
    categoryId: null,
    description: null,
    imageUrl: null,
    unit: 'un',
    price: 9.9,
    loverPrice: 8.9,
    stockQuantity: 0,
    trackStock: false,
    sortOrder: 0,
    active: true,
    availableDineIn: false,
    availablePickup: false,
    availableDelivery: false,
    availableReseller: true,
    resellerTrackStock: true,
    resellerStockQuantity: 5,
    ...overrides,
  }
}

function makeItem(id: string, product: Product, quantity: number): CartItem {
  return { id, product, quantity, addons: [], variations: [] }
}

describe('stockLimit (revenda)', () => {
  it('é o saldo quando controla estoque', () => {
    expect(stockLimit(makeProduct({ resellerStockQuantity: 5 }), 'reseller')).toBe(5)
  })

  it('é 0 quando o saldo é negativo', () => {
    expect(stockLimit(makeProduct({ resellerStockQuantity: -3 }), 'reseller')).toBe(0)
  })

  it('é null (sem limite) quando não controla estoque', () => {
    expect(stockLimit(makeProduct({ resellerTrackStock: false }), 'reseller')).toBeNull()
  })
})

describe('remainingStock (revenda)', () => {
  it('desconta o que já está no carrinho', () => {
    const product = makeProduct()
    expect(remainingStock([makeItem('a', product, 2)], product, 'reseller')).toBe(3)
  })

  it('soma linhas diferentes do mesmo produto (adicional/variação distintos)', () => {
    const product = makeProduct()
    const items = [makeItem('a', product, 2), makeItem('b', product, 2)]
    expect(remainingStock(items, product, 'reseller')).toBe(1)
  })

  it('ignora linhas de outros produtos', () => {
    const product = makeProduct()
    const other = makeProduct({ id: 'p2' })
    expect(remainingStock([makeItem('x', other, 4)], product, 'reseller')).toBe(5)
  })

  it('nunca fica negativo', () => {
    const product = makeProduct()
    expect(remainingStock([makeItem('a', product, 9)], product, 'reseller')).toBe(0)
  })

  it('é null quando não controla estoque', () => {
    const product = makeProduct({ resellerTrackStock: false })
    expect(remainingStock([makeItem('a', product, 99)], product, 'reseller')).toBeNull()
  })
})

describe('refreshCartStock (revenda)', () => {
  it('corta a quantidade que passou do novo saldo', () => {
    const old = makeProduct({ resellerStockQuantity: 10 })
    const fresh = makeProduct({ resellerStockQuantity: 3 })
    const result = refreshCartStock([makeItem('a', old, 6)], [fresh], 'reseller')
    expect(result[0].quantity).toBe(3)
    expect(result[0].product.resellerStockQuantity).toBe(3)
  })

  it('reparte o saldo entre linhas do mesmo produto, na ordem do carrinho', () => {
    const old = makeProduct({ resellerStockQuantity: 10 })
    const fresh = makeProduct({ resellerStockQuantity: 4 })
    const result = refreshCartStock([makeItem('a', old, 3), makeItem('b', old, 3)], [fresh], 'reseller')
    expect(result.map((item) => item.quantity)).toEqual([3, 1])
  })

  it('remove a linha quando o saldo zerou', () => {
    const old = makeProduct({ resellerStockQuantity: 10 })
    const fresh = makeProduct({ resellerStockQuantity: 0 })
    expect(refreshCartStock([makeItem('a', old, 2)], [fresh], 'reseller')).toEqual([])
  })

  it('não mexe na quantidade quando não controla estoque', () => {
    const old = makeProduct()
    const fresh = makeProduct({ resellerTrackStock: false })
    expect(refreshCartStock([makeItem('a', old, 50)], [fresh], 'reseller')[0].quantity).toBe(50)
  })

  it('mantém a linha quando o produto não veio na lista nova', () => {
    const old = makeProduct({ resellerStockQuantity: 2 })
    expect(refreshCartStock([makeItem('a', old, 2)], [], 'reseller')[0].quantity).toBe(2)
  })
})

describe('estoque do varejo', () => {
  const retail = (overrides: Partial<Product> = {}) =>
    makeProduct({ trackStock: true, stockQuantity: 4, resellerTrackStock: true, resellerStockQuantity: 50, ...overrides })

  it('limite é o stock_quantity quando track_stock está ligado', () => {
    expect(stockLimit(retail(), 'retail')).toBe(4)
  })

  it('sem limite quando track_stock está desligado', () => {
    expect(stockLimit(retail({ trackStock: false }), 'retail')).toBeNull()
  })

  it('saldo negativo vira 0', () => {
    expect(stockLimit(retail({ stockQuantity: -2 }), 'retail')).toBe(0)
  })

  it('varejo nunca usa o saldo da revenda (e vice-versa)', () => {
    const product = retail()
    expect(remainingStock([makeItem('a', product, 3)], product, 'retail')).toBe(1)
    expect(remainingStock([makeItem('a', product, 3)], product, 'reseller')).toBe(47)
  })

  it('refreshCartStock corta pelo saldo do varejo', () => {
    const result = refreshCartStock([makeItem('a', retail(), 6)], [retail({ stockQuantity: 2 })], 'retail')
    expect(result[0].quantity).toBe(2)
  })
})
