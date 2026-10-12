import type { AddonGroup } from '../../domain/addon/AddonGroup'

/** Texto de ajuda debaixo do nome do grupo: adicional é sempre opcional. */
export function addonGroupHint(group: AddonGroup): string {
  if (group.selectionType === 'single') return 'Opcional, escolha um'
  if (group.maxQuantity !== null) return `Opcional, até ${group.maxQuantity}`
  return 'Opcional, escolha quantos quiser'
}
