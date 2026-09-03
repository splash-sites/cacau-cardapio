import { describe, expect, it } from 'vitest'
import type { Product } from '../../domain/menu/Product'
import { buildRows, categoryRowIndex, nearestCategoryLabel } from './menuRows'

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: '1',
    storeId: 'store-1',
    name: 'Item',
    category: 'Doces',
    categoryId: 'cat-doces',
    description: null,
    imageUrl: null,
    unit: 'un',
    price: 1,
    loverPrice: 1,
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

describe('buildRows', () => {
  it('intercala cabeçalho de categoria e produtos, na ordem do Map', () => {
    const groups = new Map([
      ['Doces', [makeProduct({ id: '1', name: 'Brownie' })]],
      ['Bebidas', [makeProduct({ id: '2', name: 'Água' }), makeProduct({ id: '3', name: 'Café' })]],
    ])
    const rows = buildRows(groups)
    expect(rows.map((r) => (r.type === 'category' ? `cat:${r.category}` : `prod:${r.product.name}`))).toEqual([
      'cat:Doces',
      'prod:Brownie',
      'cat:Bebidas',
      'prod:Água',
      'prod:Café',
    ])
  })
})

describe('nearestCategoryLabel', () => {
  const rows = buildRows(
    new Map([
      ['Doces', [makeProduct({ id: '1' }), makeProduct({ id: '2' })]],
      ['Bebidas', [makeProduct({ id: '3' })]],
    ]),
  )
  // índices: 0=cat Doces, 1=prod, 2=prod, 3=cat Bebidas, 4=prod

  it('produto no meio da categoria acha o cabeçalho dela', () => {
    expect(nearestCategoryLabel(rows, 2)).toBe('Doces')
  })

  it('no próprio cabeçalho, acha ele mesmo', () => {
    expect(nearestCategoryLabel(rows, 3)).toBe('Bebidas')
  })

  it('índice depois do último cabeçalho acha a última categoria', () => {
    expect(nearestCategoryLabel(rows, 4)).toBe('Bebidas')
  })

  it('lista vazia devolve null', () => {
    expect(nearestCategoryLabel([], 0)).toBeNull()
  })
})

describe('categoryRowIndex', () => {
  it('mapeia cada categoria pro índice do primeiro cabeçalho dela', () => {
    const rows = buildRows(
      new Map([
        ['Doces', [makeProduct({ id: '1' })]],
        ['Bebidas', [makeProduct({ id: '2' }), makeProduct({ id: '3' })]],
      ]),
    )
    const index = categoryRowIndex(rows)
    expect(index.get('Doces')).toBe(0)
    expect(index.get('Bebidas')).toBe(2)
  })
})
