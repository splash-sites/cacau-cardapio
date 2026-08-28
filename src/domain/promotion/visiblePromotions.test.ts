import { describe, expect, it } from 'vitest'
import type { Product } from '../menu/Product'
import type { Promotion } from './Promotion'
import { visiblePromotions } from './visiblePromotions'

function makeProduct(id: string): Product {
  return {
    id,
    storeId: 's1',
    name: 'Produto',
    category: 'Cafés',
    categoryId: null,
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

function makePromotion(id: string, productId: string, sortOrder: number, comboProductIds: string[] = []): Promotion {
  return {
    id,
    storeId: 's1',
    title: 'Promo',
    subtitle: null,
    badgeLabel: null,
    imageUrl: 'https://example.com/promo.jpg',
    productId,
    sortOrder,
    discountType: null,
    discountValue: null,
    comboItems: comboProductIds.map((productId) => ({ productId, quantity: 1 })),
  }
}

describe('visiblePromotions', () => {
  it('remove promoção cujo produto vinculado não está na lista atual', () => {
    const products = [makeProduct('p1')]
    const promotions = [makePromotion('promo1', 'p1', 0), makePromotion('promo2', 'p2', 1)]

    expect(visiblePromotions(promotions, products).map((p) => p.id)).toEqual(['promo1'])
  })

  it('ordena pelo sortOrder', () => {
    const products = [makeProduct('p1'), makeProduct('p2')]
    const promotions = [makePromotion('promo-b', 'p2', 2), makePromotion('promo-a', 'p1', 1)]

    expect(visiblePromotions(promotions, products).map((p) => p.id)).toEqual(['promo-a', 'promo-b'])
  })

  it('lista vazia se nenhum produto vinculado está visível', () => {
    expect(visiblePromotions([makePromotion('promo1', 'p1', 0)], [])).toEqual([])
  })

  it('remove promoção de combo se algum item extra não está visível', () => {
    const products = [makeProduct('p1'), makeProduct('p2')]
    const promotions = [
      makePromotion('combo-ok', 'p1', 0, ['p2']),
      makePromotion('combo-quebrado', 'p1', 1, ['p3']),
    ]
    expect(visiblePromotions(promotions, products).map((p) => p.id)).toEqual(['combo-ok'])
  })
})
