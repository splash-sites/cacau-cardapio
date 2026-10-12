// Mensagens do banco quando o saldo acaba entre o carrinho e a confirmação:
// - trigger da revenda: `Estoque de revendedor insuficiente para "X"`
// - trigger do varejo:  `Estoque insuficiente para "X"`
// - confirm_order, produto já com saldo 0: `Produto sem estoque: <id>` (combo: `Produto <id> do combo sem estoque`)
const STOCK_ERROR_PATTERNS = ['Estoque de revendedor insuficiente', 'Estoque insuficiente', 'sem estoque']

export function isStockError(message: string): boolean {
  return STOCK_ERROR_PATTERNS.some((pattern) => message.includes(pattern))
}

// Texto pro cliente: a mensagem do confirm_order traz o id do produto, não o nome.
export function stockErrorMessage(message: string): string {
  if (message.includes('"')) return message
  return 'Um produto do seu carrinho esgotou.'
}
