import { describe, expect, it } from 'vitest'
import { groupCartItems } from './groupCartItems'
import type { CartItem } from './CartItem'
import type { Product } from '../menu/Product'

function makeProduct(id: string): Product {
  return {
    id,
    storeId: 's1',
    name: `Produto ${id}`,
    category: 'Cafés',
    description: null,
    imageUrl: null,
    unit: null,
    price: 10,
    loverPrice: 8,
    stockQuantity: 5,
    trackStock: false,
    sortOrder: 0,
    active: true,
    availableDineIn: true,
    availablePickup: true,
    availableDelivery: true,
  }
}

function makeItem(overrides: Partial<CartItem> & { id: string }): CartItem {
  return { product: makeProduct(overrides.id), quantity: 1, addons: [], variations: [], ...overrides }
}

describe('groupCartItems', () => {
  it('item sem comboGroupId vira grupo do tipo item, na ordem original', () => {
    const items = [makeItem({ id: 'p1' }), makeItem({ id: 'p2' })]
    expect(groupCartItems(items)).toEqual([
      { type: 'item', item: items[0] },
      { type: 'item', item: items[1] },
    ])
  })

  it('linhas com o mesmo comboGroupId viram 1 grupo combo só, no lugar da primeira ocorrência', () => {
    const water = makeItem({ id: 'agua', comboGroupId: 'c1', promotionId: 'promo1' })
    const fondue = makeItem({ id: 'fondue', comboGroupId: 'c1', promotionId: 'promo1' })
    const standalone = makeItem({ id: 'brownie' })
    const items = [water, standalone, fondue]

    const groups = groupCartItems(items)
    expect(groups).toEqual([
      { type: 'combo', comboGroupId: 'c1', promotionId: 'promo1', items: [water, fondue] },
      { type: 'item', item: standalone },
    ])
  })

  it('dois combos diferentes viram dois grupos separados', () => {
    const a = makeItem({ id: 'a', comboGroupId: 'c1', promotionId: 'promo1' })
    const b = makeItem({ id: 'b', comboGroupId: 'c2', promotionId: 'promo1' })
    expect(groupCartItems([a, b])).toEqual([
      { type: 'combo', comboGroupId: 'c1', promotionId: 'promo1', items: [a] },
      { type: 'combo', comboGroupId: 'c2', promotionId: 'promo1', items: [b] },
    ])
  })

  it('carrinho vazio devolve lista vazia', () => {
    expect(groupCartItems([])).toEqual([])
  })
})
