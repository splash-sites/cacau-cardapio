import { describe, expect, it } from 'vitest'
import type { Category } from './Category'
import { groupByCategory } from './groupByCategory'
import type { Product } from './Product'

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

const doces: Category = { id: 'cat-doces', name: 'Doces' }
const bebidas: Category = { id: 'cat-bebidas', name: 'Bebidas' }

describe('groupByCategory', () => {
  it('agrupa produtos pela categoria, na ordem do array de categorias (não na ordem de chegada dos produtos)', () => {
    const products = [
      makeProduct({ id: '1', categoryId: 'cat-doces', name: 'Brownie', sortOrder: 1 }),
      makeProduct({ id: '2', categoryId: 'cat-bebidas', name: 'Café', sortOrder: 0 }),
      makeProduct({ id: '3', categoryId: 'cat-doces', name: 'Trufa', sortOrder: 0 }),
    ]

    // bebidas vem DEPOIS de doces no array de categorias — a ordem das seções
    // segue esse array, não a ordem em que os produtos aparecem na lista.
    const groups = groupByCategory(products, [doces, bebidas])

    expect([...groups.keys()]).toEqual(['Doces', 'Bebidas'])
    expect(groups.get('Doces')?.map((p) => p.name)).toEqual(['Trufa', 'Brownie']) // sortOrder 0, 1
    expect(groups.get('Bebidas')?.map((p) => p.name)).toEqual(['Café'])
  })

  it('categoria sem produto não vira seção vazia', () => {
    const products = [makeProduct({ id: '1', categoryId: 'cat-doces' })]
    const groups = groupByCategory(products, [doces, bebidas])
    expect([...groups.keys()]).toEqual(['Doces'])
  })

  it('respeita a ordem das categorias mesmo invertida em relação ao array de produtos', () => {
    const products = [
      makeProduct({ id: '1', categoryId: 'cat-bebidas', name: 'Café' }),
      makeProduct({ id: '2', categoryId: 'cat-doces', name: 'Trufa' }),
    ]
    const groups = groupByCategory(products, [bebidas, doces])
    expect([...groups.keys()]).toEqual(['Bebidas', 'Doces'])
  })

  it('desempata mesmo sortOrder pelo nome', () => {
    const products = [
      makeProduct({ id: '1', categoryId: 'cat-doces', name: 'Trufa', sortOrder: 0 }),
      makeProduct({ id: '2', categoryId: 'cat-doces', name: 'Brownie', sortOrder: 0 }),
    ]
    const groups = groupByCategory(products, [doces])
    expect(groups.get('Doces')?.map((p) => p.name)).toEqual(['Brownie', 'Trufa'])
  })

  it('produto sem categoria vai pro bloco "Outros" no fim', () => {
    const products = [
      makeProduct({ id: '1', categoryId: 'cat-doces', name: 'Trufa' }),
      makeProduct({ id: '2', categoryId: null, name: 'Item avulso' }),
    ]
    const groups = groupByCategory(products, [doces])
    expect([...groups.keys()]).toEqual(['Doces', 'Outros'])
    expect(groups.get('Outros')?.map((p) => p.name)).toEqual(['Item avulso'])
  })

  it('produto com category_id de categoria desconhecida (ex: desativada) também vai pra "Outros"', () => {
    const products = [makeProduct({ id: '1', categoryId: 'cat-inexistente', name: 'Órfão' })]
    const groups = groupByCategory(products, [doces])
    expect([...groups.keys()]).toEqual(['Outros'])
  })

  it('sem produto sem categoria, "Outros" não aparece', () => {
    const products = [makeProduct({ id: '1', categoryId: 'cat-doces' })]
    const groups = groupByCategory(products, [doces])
    expect(groups.has('Outros')).toBe(false)
  })

  it('lista vazia retorna mapa vazio', () => {
    expect(groupByCategory([], []).size).toBe(0)
  })
})
