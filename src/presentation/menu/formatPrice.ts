const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatPrice(price: number): string {
  return currencyFormatter.format(price)
}
