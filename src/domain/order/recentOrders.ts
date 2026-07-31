import type { OrderSummary } from './OrderSummary'

// A RPC list_orders_by_cpf devolve o histórico inteiro do CPF na loja, sem
// LIMIT (fora do controle deste repositório) — corta no client pra não
// renderizar uma lista sem limite pra quem tem muitos pedidos acumulados.
export function recentOrders(orders: OrderSummary[], limit: number): OrderSummary[] {
  return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit)
}
