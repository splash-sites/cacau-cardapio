import { describe, expect, it } from 'vitest'
import type { Product } from '../menu/Product'
import type { CartItem } from './CartItem'
import { refreshCartStock, remainingResellerStock, resellerStockLimit } from './resellerStock'

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

describe('resellerStockLimit', () => {
  it('é o saldo quando controla estoque', () => {
    expect(resellerStockLimit(makeProduct({ resellerStockQuantity: 5 }))).toBe(5)
  })

  it('é 0 quando o saldo é negativo', () => {
    expect(resellerStockLimit(makeProduct({ resellerStockQuantity: -3 }))).toBe(0)
  })

  it('é null (sem limite) quando não controla estoque', () => {
    expect(resellerStockLimit(makeProduct({ resellerTrackStock: false }))).toBeNull()
  })
})

describe('remainingResellerStock', () => {
  it('desconta o que já está no carrinho', () => {
    const product = makeProduct()
    expect(remainingResellerStock([makeItem('a', product, 2)], product)).toBe(3)
  })

  it('soma linhas diferentes do mesmo produto (adicional/variação distintos)', () => {
    const product = makeProduct()
    const items = [makeItem('a', product, 2), makeItem('b', product, 2)]
    expect(remainingResellerStock(items, product)).toBe(1)
  })

  it('ignora linhas de outros produtos', () => {
    const product = makeProduct()
    const other = makeProduct({ id: 'p2' })
    expect(remainingResellerStock([makeItem('x', other, 4)], product)).toBe(5)
  })

  it('nunca fica negativo', () => {
    const product = makeProduct()
    expect(remainingResellerStock([makeItem('a', product, 9)], product)).toBe(0)
  })

  it('é null quando não controla estoque', () => {
    const product = makeProduct({ resellerTrackStock: false })
    expect(remainingResellerStock([makeItem('a', product, 99)], product)).toBeNull()
  })
})

describe('refreshCartStock', () => {
  it('corta a quantidade que passou do novo saldo', () => {
    const old = makeProduct({ resellerStockQuantity: 10 })
    const fresh = makeProduct({ resellerStockQuantity: 3 })
    const result = refreshCartStock([makeItem('a', old, 6)], [fresh])
    expect(result[0].quantity).toBe(3)
    expect(result[0].product.resellerStockQuantity).toBe(3)
  })

  it('reparte o saldo entre linhas do mesmo produto, na ordem do carrinho', () => {
    const old = makeProduct({ resellerStockQuantity: 10 })
    const fresh = makeProduct({ resellerStockQuantity: 4 })
    const result = refreshCartStock([makeItem('a', old, 3), makeItem('b', old, 3)], [fresh])
    expect(result.map((item) => item.quantity)).toEqual([3, 1])
  })

  it('remove a linha quando o saldo zerou', () => {
    const old = makeProduct({ resellerStockQuantity: 10 })
    const fresh = makeProduct({ resellerStockQuantity: 0 })
    expect(refreshCartStock([makeItem('a', old, 2)], [fresh])).toEqual([])
  })

  it('não mexe na quantidade quando não controla estoque', () => {
    const old = makeProduct()
    const fresh = makeProduct({ resellerTrackStock: false })
    expect(refreshCartStock([makeItem('a', old, 50)], [fresh])[0].quantity).toBe(50)
  })

  it('mantém a linha quando o produto não veio na lista nova', () => {
    const old = makeProduct({ resellerStockQuantity: 2 })
    expect(refreshCartStock([makeItem('a', old, 2)], [])[0].quantity).toBe(2)
  })
})
