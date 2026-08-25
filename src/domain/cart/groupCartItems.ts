import type { CartItem } from './CartItem'

export type CartGroup =
  | { type: 'item'; item: CartItem }
  | { type: 'combo'; comboGroupId: string; promotionId: string; items: CartItem[] }

// Combo é atômico (várias linhas de CartItem compartilhando comboGroupId) —
// essa função devolve os itens do carrinho já agrupados na ordem em que
// apareceram, pra telas (carrinho, revisão, mensagem do WhatsApp) mostrarem
// combo como 1 bloco em vez de N linhas soltas sem relação aparente.
export function groupCartItems(items: CartItem[]): CartGroup[] {
  const groups: CartGroup[] = []
  const seenComboGroupIds = new Set<string>()

  for (const item of items) {
    if (!item.comboGroupId) {
      groups.push({ type: 'item', item })
      continue
    }
    if (seenComboGroupIds.has(item.comboGroupId)) continue
    seenComboGroupIds.add(item.comboGroupId)
    groups.push({
      type: 'combo',
      comboGroupId: item.comboGroupId,
      promotionId: item.promotionId!,
      items: items.filter((candidate) => candidate.comboGroupId === item.comboGroupId),
    })
  }

  return groups
}
