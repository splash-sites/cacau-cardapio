import { formatCpf } from '../../domain/customer/cpf'
import type { Customer } from '../../domain/customer/Customer'
import { cartLoverTotal, cartTotal, itemUnitLoverPrice, itemUnitPrice } from '../../domain/cart/Cart'
import type { CartItem } from '../../domain/cart/CartItem'
import { formatPrice } from '../menu/formatPrice'

function formatAddress(customer: Customer): string {
  if (!customer.address) return ''
  const { street, number, complement, neighborhood, city, state, zipCode } = customer.address
  const complementPart = complement ? ` - ${complement}` : ''
  return `${street}, ${number}${complementPart} — ${neighborhood}, ${city}/${state} — CEP ${zipCode}`
}

function formatItemLine(item: CartItem): string {
  const details = [...item.variations.map((variation) => variation.name), ...item.addons.map((addon) => addon.name)]
  const detailsText = details.length > 0 ? ` (${details.join(', ')})` : ''
  const noteText = item.note ? ` — obs: ${item.note}` : ''
  const loverPrice = formatPrice(itemUnitLoverPrice(item) * item.quantity)
  const regularPrice = formatPrice(itemUnitPrice(item) * item.quantity)
  return `• ${item.quantity}x ${item.product.name}${detailsText}${noteText} — ${loverPrice} / ${regularPrice}`
}

export function buildWhatsappOrderMessage(storeName: string, customer: Customer, items: CartItem[]): string {
  const lines = [
    `Novo pedido — ${storeName}`,
    '',
    `Cliente: ${customer.fullName}`,
    `CPF: ${formatCpf(customer.cpf)}`,
    `Telefone: ${customer.phone}`,
    `Endereço: ${formatAddress(customer)}`,
    '',
    'Itens:',
    ...items.map(formatItemLine),
    '',
    `Total Cacau Lovers*: ${formatPrice(cartLoverTotal(items))}`,
    `Total Não Lover: ${formatPrice(cartTotal(items))}`,
    '',
    'Obs: o CPF será validado na entrega pra confirmar se o cliente é Cacau Lover.',
  ]
  return lines.join('\n')
}

export function buildWhatsappUrl(whatsappNumber: string, message: string): string {
  const digits = whatsappNumber.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
