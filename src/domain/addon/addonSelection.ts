import type { AddonGroup } from './AddonGroup'
import type { AddonOption } from './AddonOption'

export type AddonSelections = Record<string, number>

export function groupSelectedQuantity(selections: AddonSelections, group: AddonGroup): number {
  return group.options.reduce((sum, option) => sum + (selections[option.id] ?? 0), 0)
}

export function toggleAddonOption(selections: AddonSelections, group: AddonGroup, optionId: string): AddonSelections {
  const isSelected = (selections[optionId] ?? 0) > 0
  if (isSelected) {
    const next = { ...selections }
    delete next[optionId]
    return next
  }

  if (group.selectionType === 'single') {
    const next = { ...selections }
    for (const option of group.options) delete next[option.id]
    next[optionId] = 1
    return next
  }

  if (group.maxQuantity !== null && groupSelectedQuantity(selections, group) >= group.maxQuantity) {
    return selections
  }
  return { ...selections, [optionId]: 1 }
}

export function addonSelectionsTotal(selections: AddonSelections, groups: AddonGroup[]): number {
  const options = groups.flatMap((group) => group.options)
  return Object.entries(selections).reduce((sum, [optionId, quantity]) => {
    const option = options.find((o) => o.id === optionId)
    return sum + (option ? option.price * quantity : 0)
  }, 0)
}

export function addonSelectionsLoverTotal(selections: AddonSelections, groups: AddonGroup[]): number {
  const options = groups.flatMap((group) => group.options)
  return Object.entries(selections).reduce((sum, [optionId, quantity]) => {
    const option = options.find((o) => o.id === optionId)
    return sum + (option ? option.loverPrice * quantity : 0)
  }, 0)
}

export function resolveSelectedAddons(selections: AddonSelections, groups: AddonGroup[]): AddonOption[] {
  const options = groups.flatMap((group) => group.options)
  return Object.keys(selections)
    .map((optionId) => options.find((option) => option.id === optionId))
    .filter((option): option is AddonOption => option !== undefined)
}
