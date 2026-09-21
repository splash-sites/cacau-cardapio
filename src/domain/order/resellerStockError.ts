// Mensagem que o trigger do banco levanta quando o saldo do revendedor acaba
// entre o carrinho e a confirmação: `Estoque de revendedor insuficiente para "X"`.
const RESELLER_STOCK_ERROR = 'Estoque de revendedor insuficiente'

export function isResellerStockError(message: string): boolean {
  return message.includes(RESELLER_STOCK_ERROR)
}
