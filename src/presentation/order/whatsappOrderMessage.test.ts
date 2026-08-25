import { describe, expect, it } from 'vitest'
import { buildWhatsappOrderMessage, buildWhatsappUrl } from './whatsappOrderMessage'
import type { CartItem } from '../../domain/cart/CartItem'
import type { Customer } from '../../domain/customer/Customer'
import type { Product } from '../../domain/menu/Product'
import { formatPrice } from '../menu/formatPrice'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    storeId: 'store-1',
    name: 'Capuccino',
    category: 'Cafés',
    description: null,
    imageUrl: null,
    unit: null,
    price: 8,
    loverPrice: 6.9,
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

const customer: Customer = {
  fullName: 'Maria Silva',
  cpf: '52998224725',
  phone: '51999998888',
  address: {
    street: 'Rua das Flores',
    number: '100',
    neighborhood: 'Centro',
    city: 'Torres',
    state: 'RS',
    zipCode: '95560-000',
  },
}

describe('buildWhatsappOrderMessage', () => {
  it('inclui CPF formatado, endereço, itens e os dois totais', () => {
    const items: CartItem[] = [
      {
        id: 'p1::v:v1',
        product: makeProduct(),
        quantity: 2,
        addons: [],
        variations: [{ id: 'v1', name: 'Grande', price: 10, loverPrice: 9, priceMode: 'replace' }],
      },
    ]

    const message = buildWhatsappOrderMessage('Cacau Show Torres', customer, items)

    expect(message).toContain('CPF: 529.982.247-25')
    expect(message).toContain('Rua das Flores, 100')
    expect(message).toContain('2x Capuccino (Grande)')
    expect(message).toContain(`Total Cacau Lovers*: ${formatPrice(18)}`)
    expect(message).toContain(`Total Não Lover: ${formatPrice(20)}`)
    expect(message).toContain('Cacau Lover')
  })

  it('sem variação/adicional não mostra parênteses vazio', () => {
    const items: CartItem[] = [{ id: 'p1', product: makeProduct(), quantity: 1, addons: [], variations: [] }]
    const message = buildWhatsappOrderMessage('Cacau Show Torres', customer, items)
    expect(message).toContain('1x Capuccino —')
    expect(message).not.toContain('()')
  })

  it('agrupa itens de combo com cabeçalho e total do combo, em vez de linhas soltas', () => {
    const water = makeProduct({ id: 'agua', name: 'Água', price: 5, loverPrice: 5 })
    const items: CartItem[] = [
      {
        id: 'combo:c1:agua',
        product: water,
        quantity: 1,
        addons: [],
        variations: [],
        comboGroupId: 'c1',
        promotionId: 'promo1',
        discountedUnitPrice: 4,
        discountedLoverUnitPrice: 4,
      },
      {
        id: 'combo:c1:p1',
        product: makeProduct(),
        quantity: 1,
        addons: [],
        variations: [],
        comboGroupId: 'c1',
        promotionId: 'promo1',
        discountedUnitPrice: 6,
        discountedLoverUnitPrice: 5,
      },
    ]
    const message = buildWhatsappOrderMessage('Cacau Show Torres', customer, items)
    expect(message).toContain('• Combo:')
    expect(message).toContain('- 1x Água')
    expect(message).toContain('- 1x Capuccino')
    expect(message).toContain(`Total combo: ${formatPrice(9)} / ${formatPrice(10)}`)
  })
})

describe('buildWhatsappUrl', () => {
  it('monta link wa.me só com dígitos do número e mensagem url-encoded', () => {
    const url = buildWhatsappUrl('(51) 99999-8888', 'Olá, teste')
    expect(url).toBe('https://wa.me/51999998888?text=Ol%C3%A1%2C%20teste')
  })
})
