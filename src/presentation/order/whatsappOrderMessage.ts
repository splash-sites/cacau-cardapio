import { formatCpf } from '../../domain/customer/cpf'
import type { Customer } from '../../domain/customer/Customer'
import { cartLoverTotal, cartTotal, itemUnitLoverPrice, itemUnitPrice } from '../../domain/cart/Cart'
import type { CartItem } from '../../domain/cart/CartItem'
import { groupCartItems, type CartGroup } from '../../domain/cart/groupCartItems'
import { formatPrice } from '../menu/formatPrice'

function formatAddress(customer: Customer): string {
  if (!customer.address) return ''
  const { street, number, complement, neighborhood, city, state, zipCode } = customer.address
  const complementPart = complement ? ` - ${complement}` : ''
  return `${street}, ${number}${complementPart} — ${neighborhood}, ${city}/${state} — CEP ${zipCode}`
}

function formatItemDescription(item: CartItem): string {
  const details = [...item.variations.map((variation) => variation.name), ...item.addons.map((addon) => addon.name)]
  const detailsText = details.length > 0 ? ` (${details.join(', ')})` : ''
  const noteText = item.note ? ` — obs: ${item.note}` : ''
  return `${item.quantity}x ${item.product.name}${detailsText}${noteText}`
}

function formatGroupLines(group: CartGroup): string[] {
  if (group.type === 'item') {
    const loverPrice = formatPrice(itemUnitLoverPrice(group.item) * group.item.quantity)
    const regularPrice = formatPrice(itemUnitPrice(group.item) * group.item.quantity)
    return [`• ${formatItemDescription(group.item)} — ${loverPrice} / ${regularPrice}`]
  }

  const loverTotal = group.items.reduce((sum, item) => sum + itemUnitLoverPrice(item) * item.quantity, 0)
  const regularTotal = group.items.reduce((sum, item) => sum + itemUnitPrice(item) * item.quantity, 0)
  return [
    '• Combo:',
    ...group.items.map((item) => `   - ${formatItemDescription(item)}`),
    `   Total combo: ${formatPrice(loverTotal)} / ${formatPrice(regularTotal)}`,
  ]
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
    ...groupCartItems(items).flatMap(formatGroupLines),
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
