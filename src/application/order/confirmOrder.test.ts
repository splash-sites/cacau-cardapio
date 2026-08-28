import { describe, expect, it, vi } from 'vitest'
import { confirmOrder } from './confirmOrder'
import type { CreateOrderInput, OrderRepository } from './OrderRepository'
import type { Product } from '../../domain/menu/Product'

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

function makeInput(overrides: Partial<CreateOrderInput> = {}): CreateOrderInput {
  return {
    storeId: 'store-1',
    orderType: 'pickup',
    customer: { fullName: 'Maria Silva', cpf: '52998224725', phone: '51999998888', address: null },
    items: [{ id: 'p1', product: makeProduct(), quantity: 1, addons: [], variations: [] }],
    ...overrides,
  }
}

describe('confirmOrder', () => {
  it('cria pedido quando carrinho não está vazio', async () => {
    const repo: OrderRepository = { createOrder: vi.fn().mockResolvedValue({ id: 'order-1' }) }
    const result = await confirmOrder(repo, makeInput())
    expect(result).toEqual({ id: 'order-1' })
  })

  it('rejeita carrinho vazio', async () => {
    const repo: OrderRepository = { createOrder: vi.fn() }
    await expect(confirmOrder(repo, makeInput({ items: [] }))).rejects.toThrow('Carrinho vazio')
    expect(repo.createOrder).not.toHaveBeenCalled()
  })

  it('rejeita delivery sem endereço', async () => {
    const repo: OrderRepository = { createOrder: vi.fn() }
    const input = makeInput({
      orderType: 'delivery',
      customer: { fullName: 'Maria Silva', cpf: '52998224725', phone: '51999998888', address: null },
    })
    await expect(confirmOrder(repo, input)).rejects.toThrow('Endereço obrigatório')
    expect(repo.createOrder).not.toHaveBeenCalled()
  })
})
