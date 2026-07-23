import { describe, expect, it } from 'vitest'
import { groupByCategory } from './groupByCategory'
import type { Product } from './Product'

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: '1',
    storeId: 'store-1',
    name: 'Item',
    category: 'Doces',
    description: null,
    imageUrl: null,
    unit: 'un',
    price: 1,
    stockQuantity: 1,
    trackStock: false,
    sortOrder: 0,
    active: true,
    availableDineIn: true,
    availablePickup: true,
    availableDelivery: true,
    ...overrides,
  }
}

describe('groupByCategory', () => {
  it('agrupa produtos pela categoria mantendo ordem de chegada', () => {
    const products = [
      makeProduct({ id: '1', category: 'Doces', name: 'Brownie' }),
      makeProduct({ id: '2', category: 'Bebidas', name: 'Café' }),
      makeProduct({ id: '3', category: 'Doces', name: 'Trufa' }),
    ]

    const groups = groupByCategory(products)

    expect([...groups.keys()]).toEqual(['Doces', 'Bebidas'])
    expect(groups.get('Doces')?.map((p) => p.name)).toEqual(['Brownie', 'Trufa'])
    expect(groups.get('Bebidas')?.map((p) => p.name)).toEqual(['Café'])
  })

  it('lista vazia retorna mapa vazio', () => {
    expect(groupByCategory([]).size).toBe(0)
  })
})
