import { describe, expect, it } from 'vitest'
import {
  addComboItems,
  addItem,
  cartItemCount,
  cartItemId,
  cartLoverTotal,
  cartTotal,
  decrementItem,
  incrementItem,
  itemUnitLoverPrice,
  itemUnitPrice,
  removeComboGroup,
  removeItem,
  setItemNote,
} from './Cart'
import type { AddonOption } from '../addon/AddonOption'
import type { Product } from '../menu/Product'
import type { VariationOption } from '../variation/VariationOption'
import type { CartItem } from './CartItem'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    storeId: 'store-1',
    name: 'Brownie',
    category: 'Doces',
    description: null,
    imageUrl: null,
    unit: 'un',
    price: 10,
    loverPrice: 9,
    stockQuantity: 10,
    trackStock: false,
    sortOrder: 0,
    active: true,
    availableDineIn: true,
    availablePickup: true,
    availableDelivery: true,
    ...overrides,
  }
}

const chantilly: AddonOption = { id: 'a1', name: 'Chantilly', price: 2, loverPrice: 2 }
const large: VariationOption = { id: 'v1', name: 'Grande', price: 15, loverPrice: 13, priceMode: 'replace' }

describe('addItem', () => {
  it('adiciona produto novo com quantidade 1, sem adicional/variação', () => {
    const items = addItem([], makeProduct())
    expect(items).toEqual([{ id: 'p1', product: makeProduct(), quantity: 1, addons: [], variations: [] }])
  })

  it('incrementa quantidade se produto já existe no carrinho com a mesma escolha', () => {
    const product = makeProduct()
    const items = addItem([{ id: 'p1', product, quantity: 1, addons: [], variations: [] }], product)
    expect(items).toEqual([{ id: 'p1', product, quantity: 2, addons: [], variations: [] }])
  })

  it('produto com adicional diferente vira uma linha separada', () => {
    const product = makeProduct()
    const items = addItem(addItem([], product), product, [chantilly])
    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({ id: 'p1', quantity: 1, addons: [] })
    expect(items[1]).toMatchObject({ id: 'p1::a:a1', quantity: 1, addons: [chantilly] })
  })

  it('produto com variação diferente também vira linha separada', () => {
    const product = makeProduct()
    const items = addItem(addItem([], product), product, [], [large])
    expect(items).toHaveLength(2)
    expect(items[1]).toMatchObject({ id: 'p1::v:v1', variations: [large] })
  })

  it('mesmo produto com a mesma escolha soma quantidade na mesma linha', () => {
    const product = makeProduct()
    const items = addItem(addItem([], product, [chantilly]), product, [chantilly])
    expect(items).toEqual([{ id: 'p1::a:a1', product, quantity: 2, addons: [chantilly], variations: [] }])
  })

  it('aceita adicionar quantidade maior que 1 de uma vez', () => {
    const items = addItem([], makeProduct(), [], [], 3)
    expect(items[0].quantity).toBe(3)
  })
})

describe('cartItemId', () => {
  it('sem adicional/variação usa só o id do produto', () => {
    expect(cartItemId('p1', [])).toBe('p1')
  })

  it('com adicional, ordena os ids pra ficar determinístico', () => {
    const b: AddonOption = { id: 'b1', name: 'B', price: 1, loverPrice: 1 }
    expect(cartItemId('p1', [b, chantilly])).toBe(cartItemId('p1', [chantilly, b]))
  })
})

describe('incrementItem / decrementItem', () => {
  it('incrementa quantidade do item', () => {
    const items: CartItem[] = [{ id: 'p1', product: makeProduct(), quantity: 1, addons: [], variations: [] }]
    expect(incrementItem(items, 'p1')[0].quantity).toBe(2)
  })

  it('decrementa quantidade do item', () => {
    const items: CartItem[] = [{ id: 'p1', product: makeProduct(), quantity: 2, addons: [], variations: [] }]
    expect(decrementItem(items, 'p1')[0].quantity).toBe(1)
  })

  it('remove item quando quantidade chega a zero', () => {
    const items: CartItem[] = [{ id: 'p1', product: makeProduct(), quantity: 1, addons: [], variations: [] }]
    expect(decrementItem(items, 'p1')).toEqual([])
  })
})

describe('removeItem', () => {
  it('remove item do carrinho pelo id da linha', () => {
    const items: CartItem[] = [{ id: 'p1', product: makeProduct(), quantity: 3, addons: [], variations: [] }]
    expect(removeItem(items, 'p1')).toEqual([])
  })
})

describe('setItemNote', () => {
  it('define a observação de um item pelo id da linha', () => {
    const items: CartItem[] = [{ id: 'p1', product: makeProduct(), quantity: 1, addons: [], variations: [] }]
    expect(setItemNote(items, 'p1', 'sem açúcar')[0].note).toBe('sem açúcar')
  })

  it('não afeta outros itens', () => {
    const items: CartItem[] = [
      { id: 'p1', product: makeProduct({ id: 'p1' }), quantity: 1, addons: [], variations: [] },
      { id: 'p2', product: makeProduct({ id: 'p2' }), quantity: 1, addons: [], variations: [] },
    ]
    expect(setItemNote(items, 'p1', 'sem açúcar')[1].note).toBeUndefined()
  })
})

describe('itemUnitPrice / itemUnitLoverPrice', () => {
  it('sem variação, usa o preço do produto', () => {
    const item: CartItem = { id: 'p1', product: makeProduct(), quantity: 1, addons: [], variations: [] }
    expect(itemUnitPrice(item)).toBe(10)
    expect(itemUnitLoverPrice(item)).toBe(9)
  })

  it('com variação, o preço dela substitui o preço base do produto', () => {
    const item: CartItem = { id: 'p1::v:v1', product: makeProduct(), quantity: 1, addons: [], variations: [large] }
    expect(itemUnitPrice(item)).toBe(15)
    expect(itemUnitLoverPrice(item)).toBe(13)
  })

  it('item de combo usa discountedUnitPrice como base, ignora o preço do produto — adicional continua somando por cima', () => {
    const item: CartItem = {
      id: 'combo:c1:p1',
      product: makeProduct({ price: 20, loverPrice: 18 }),
      quantity: 1,
      addons: [chantilly],
      variations: [],
      comboGroupId: 'c1',
      promotionId: 'promo1',
      discountedUnitPrice: 12,
      discountedLoverUnitPrice: 10,
    }
    expect(itemUnitPrice(item)).toBe(12 + 2)
    expect(itemUnitLoverPrice(item)).toBe(10 + 2)
  })

  it('adicional soma em cima do preço base (com ou sem variação)', () => {
    const item: CartItem = {
      id: 'p1::v:v1::a:a1',
      product: makeProduct(),
      quantity: 1,
      addons: [chantilly],
      variations: [large],
    }
    expect(itemUnitPrice(item)).toBe(15 + 2)
    expect(itemUnitLoverPrice(item)).toBe(13 + 2)
  })
})

describe('cartTotal / cartLoverTotal / cartItemCount', () => {
  it('soma preço * quantidade de todos os itens', () => {
    const items: CartItem[] = [
      { id: 'p1', product: makeProduct({ id: 'p1', price: 10 }), quantity: 2, addons: [], variations: [] },
      { id: 'p2', product: makeProduct({ id: 'p2', price: 5 }), quantity: 3, addons: [], variations: [] },
    ]
    expect(cartTotal(items)).toBe(35)
  })

  it('soma o preço do adicional * quantidade do item também', () => {
    const items: CartItem[] = [
      {
        id: 'p1::a:a1',
        product: makeProduct({ id: 'p1', price: 10, loverPrice: 9 }),
        quantity: 2,
        addons: [chantilly],
        variations: [],
      },
    ]
    expect(cartTotal(items)).toBe((10 + 2) * 2)
    expect(cartLoverTotal(items)).toBe((9 + 2) * 2)
  })

  it('soma quantidade de todos os itens', () => {
    const items: CartItem[] = [
      { id: 'p1', product: makeProduct({ id: 'p1' }), quantity: 2, addons: [], variations: [] },
      { id: 'p2', product: makeProduct({ id: 'p2' }), quantity: 3, addons: [], variations: [] },
    ]
    expect(cartItemCount(items)).toBe(5)
  })

  it('carrinho vazio soma zero', () => {
    expect(cartTotal([])).toBe(0)
    expect(cartLoverTotal([])).toBe(0)
    expect(cartItemCount([])).toBe(0)
  })
})

describe('addComboItems / removeComboGroup', () => {
  const water = makeProduct({ id: 'agua', name: 'Água', price: 5, loverPrice: 5 })
  const fondue = makeProduct({ id: 'fondue', name: 'Fondue', price: 20, loverPrice: 18 })

  it('adiciona todas as linhas do combo de uma vez, com id prefixado pelo comboGroupId', () => {
    const items = addComboItems([], 'combo-1', 'promo-1', [
      { product: water, addons: [], variations: [], quantity: 1, discountedUnitPrice: 5, discountedLoverUnitPrice: 5 },
      { product: fondue, addons: [], variations: [large], quantity: 1, discountedUnitPrice: 15, discountedLoverUnitPrice: 13 },
    ])
    expect(items).toEqual([
      {
        id: 'combo:combo-1:agua',
        product: water,
        quantity: 1,
        addons: [],
        variations: [],
        comboGroupId: 'combo-1',
        promotionId: 'promo-1',
        discountedUnitPrice: 5,
        discountedLoverUnitPrice: 5,
      },
      {
        id: 'combo:combo-1:fondue',
        product: fondue,
        quantity: 1,
        addons: [],
        variations: [large],
        comboGroupId: 'combo-1',
        promotionId: 'promo-1',
        discountedUnitPrice: 15,
        discountedLoverUnitPrice: 13,
      },
    ])
  })

  it('duas adições do mesmo combo geram grupos separados, nunca mesclam', () => {
    const firstAdd = addComboItems([], 'combo-1', 'promo-1', [{ product: water, addons: [], variations: [], quantity: 1, discountedUnitPrice: 5, discountedLoverUnitPrice: 5 }])
    const items = addComboItems(firstAdd, 'combo-2', 'promo-1', [{ product: water, addons: [], variations: [], quantity: 1, discountedUnitPrice: 5, discountedLoverUnitPrice: 5 }])
    expect(items).toHaveLength(2)
    expect(items[0].id).not.toBe(items[1].id)
  })

  it('combo não mescla com item avulso do mesmo produto', () => {
    const withStandalone = addItem([], water)
    const items = addComboItems(withStandalone, 'combo-1', 'promo-1', [
      { product: water, addons: [], variations: [], quantity: 1, discountedUnitPrice: 5, discountedLoverUnitPrice: 5 },
    ])
    expect(items).toHaveLength(2)
  })

  it('removeComboGroup remove todas as linhas do grupo, sem afetar o resto do carrinho', () => {
    const standalone = addItem([], fondue)
    const withCombo = addComboItems(standalone, 'combo-1', 'promo-1', [
      { product: water, addons: [], variations: [], quantity: 1, discountedUnitPrice: 5, discountedLoverUnitPrice: 5 },
      { product: fondue, addons: [], variations: [], quantity: 1, discountedUnitPrice: 20, discountedLoverUnitPrice: 18 },
    ])
    const result = removeComboGroup(withCombo, 'combo-1')
    expect(result).toHaveLength(1)
    expect(result[0].product.id).toBe('fondue')
    expect(result[0].comboGroupId).toBeUndefined()
  })
})
