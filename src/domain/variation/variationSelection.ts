import type { Product } from '../menu/Product'
import type { VariationGroup } from './VariationGroup'
import type { VariationOption } from './VariationOption'

// Sempre 1 opção por grupo (radio, obrigatório) — diferente de addon, não tem
// selection_type/max_quantity no schema porque não existe outro modo aqui.
export type VariationSelections = Record<string, string>

export function selectVariationOption(
  selections: VariationSelections,
  groupId: string,
  optionId: string,
): VariationSelections {
  return { ...selections, [groupId]: optionId }
}

export function isVariationSelectionComplete(selections: VariationSelections, groups: VariationGroup[]): boolean {
  return groups.every((group) => selections[group.id] !== undefined)
}

export function resolveSelectedVariations(
  selections: VariationSelections,
  groups: VariationGroup[],
): VariationOption[] {
  return groups
    .map((group) => group.options.find((option) => option.id === selections[group.id]))
    .filter((option): option is VariationOption => option !== undefined)
}

export function variationPriceTotal(variations: VariationOption[]): number {
  return variations.reduce((sum, variation) => sum + variation.price, 0)
}

export function variationLoverPriceTotal(variations: VariationOption[]): number {
  return variations.reduce((sum, variation) => sum + variation.loverPrice, 0)
}

// price_mode é do grupo, denormalizado em cada opção (ver infra) — 'replace'
// substitui o preço base, 'additive' soma em cima. price = 0 numa opção
// 'replace' quer dizer "sem valor cadastrado" (não "grátis"), nesse caso usa
// o preço do produto — decisão sempre pela soma do preço normal, mesmo sinal
// pro Lover (não teria sentido só um dos dois cair pro preço base).
export function resolveBasePrice(product: Product, variations: VariationOption[]): { regular: number; lover: number } {
  const replaceOptions = variations.filter((variation) => variation.priceMode === 'replace')
  const additiveOptions = variations.filter((variation) => variation.priceMode === 'additive')

  const replaceRegularSum = variationPriceTotal(replaceOptions)
  const replaceLoverSum = variationLoverPriceTotal(replaceOptions)
  const additiveRegularSum = variationPriceTotal(additiveOptions)
  const additiveLoverSum = variationLoverPriceTotal(additiveOptions)

  const baseRegular = replaceRegularSum > 0 ? replaceRegularSum : product.price
  const baseLover = replaceRegularSum > 0 ? replaceLoverSum : product.loverPrice

  return {
    regular: baseRegular + additiveRegularSum,
    lover: baseLover + additiveLoverSum,
  }
}
