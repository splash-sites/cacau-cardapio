import { describe, expect, it } from 'vitest'
import { addItem, cartItemCount, cartTotal, decrementItem, incrementItem, removeItem, setItemNote } from './Cart'
import type { Product } from '../menu/Product'
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

describe('addItem', () => {
  it('adiciona produto novo com quantidade 1', () => {
    const items = addItem([], makeProduct())
    expect(items).toEqual([{ product: makeProduct(), quantity: 1 }])
  })

  it('incrementa quantidade se produto já existe no carrinho', () => {
    const product = makeProduct()
    const items = addItem([{ product, quantity: 1 }], product)
    expect(items).toEqual([{ product, quantity: 2 }])
  })
})

describe('incrementItem / decrementItem', () => {
  it('incrementa quantidade do item', () => {
    const items: CartItem[] = [{ product: makeProduct(), quantity: 1 }]
    expect(incrementItem(items, 'p1')[0].quantity).toBe(2)
  })

  it('decrementa quantidade do item', () => {
    const items: CartItem[] = [{ product: makeProduct(), quantity: 2 }]
    expect(decrementItem(items, 'p1')[0].quantity).toBe(1)
  })

  it('remove item quando quantidade chega a zero', () => {
    const items: CartItem[] = [{ product: makeProduct(), quantity: 1 }]
    expect(decrementItem(items, 'p1')).toEqual([])
  })
})

describe('removeItem', () => {
  it('remove item do carrinho pelo id do produto', () => {
    const items: CartItem[] = [{ product: makeProduct(), quantity: 3 }]
    expect(removeItem(items, 'p1')).toEqual([])
  })
})

describe('setItemNote', () => {
  it('define a observação de um item pelo id do produto', () => {
    const items: CartItem[] = [{ product: makeProduct(), quantity: 1 }]
    expect(setItemNote(items, 'p1', 'sem açúcar')[0].note).toBe('sem açúcar')
  })

  it('não afeta outros itens', () => {
    const items: CartItem[] = [
      { product: makeProduct({ id: 'p1' }), quantity: 1 },
      { product: makeProduct({ id: 'p2' }), quantity: 1 },
    ]
    expect(setItemNote(items, 'p1', 'sem açúcar')[1].note).toBeUndefined()
  })
})

describe('cartTotal / cartItemCount', () => {
  it('soma preço * quantidade de todos os itens', () => {
    const items: CartItem[] = [
      { product: makeProduct({ id: 'p1', price: 10 }), quantity: 2 },
      { product: makeProduct({ id: 'p2', price: 5 }), quantity: 3 },
    ]
    expect(cartTotal(items)).toBe(35)
  })

  it('soma quantidade de todos os itens', () => {
    const items: CartItem[] = [
      { product: makeProduct({ id: 'p1' }), quantity: 2 },
      { product: makeProduct({ id: 'p2' }), quantity: 3 },
    ]
    expect(cartItemCount(items)).toBe(5)
  })

  it('carrinho vazio soma zero', () => {
    expect(cartTotal([])).toBe(0)
    expect(cartItemCount([])).toBe(0)
  })
})
