import type { CreateOrderInput, CreatedOrder, OrderRepository } from './OrderRepository'

export async function confirmOrder(repo: OrderRepository, input: CreateOrderInput): Promise<CreatedOrder> {
  if (input.items.length === 0) throw new Error('Carrinho vazio')
  if (input.salesChannel === 'reseller' && input.orderType !== 'pickup') {
    throw new Error('Pedido de revendedor só aceita retirada no local')
  }
  if (input.orderType === 'delivery' && !input.customer.address) {
    throw new Error('Endereço obrigatório para entrega')
  }
  return repo.createOrder(input)
}
