import { describe, expect, it } from 'vitest'
import { addonSelectionsLoverTotal, addonSelectionsTotal, toggleAddonOption } from './addonSelection'
import type { AddonGroup } from './AddonGroup'

const singleGroup: AddonGroup = {
  id: 'g1',
  name: 'Tamanho',
  selectionType: 'single',
  maxQuantity: null,
  options: [
    { id: 'o1', name: 'Pequeno', price: 0, loverPrice: 0 },
    { id: 'o2', name: 'Grande', price: 3, loverPrice: 2 },
  ],
}

const multipleGroupCapped: AddonGroup = {
  id: 'g2',
  name: 'Adicionais Waffle',
  selectionType: 'multiple',
  maxQuantity: 2,
  options: [
    { id: 'o3', name: 'Banana', price: 5, loverPrice: 4 },
    { id: 'o4', name: 'Morango', price: 5, loverPrice: 4 },
  ],
}

describe('toggleAddonOption', () => {
  it('seleciona opção não selecionada', () => {
    expect(toggleAddonOption({}, singleGroup, 'o1')).toEqual({ o1: 1 })
  })

  it('desmarca opção já selecionada', () => {
    expect(toggleAddonOption({ o1: 1 }, singleGroup, 'o1')).toEqual({})
  })

  it('single: selecionar outra opção substitui a anterior', () => {
    expect(toggleAddonOption({ o1: 1 }, singleGroup, 'o2')).toEqual({ o2: 1 })
  })

  it('multiple: respeita max_quantity do grupo, bloqueia nova seleção quando já no limite', () => {
    const selections = { o3: 2 }
    expect(toggleAddonOption(selections, multipleGroupCapped, 'o4')).toBe(selections)
  })

  it('multiple: permite selecionar quando abaixo do limite', () => {
    expect(toggleAddonOption({ o3: 1 }, multipleGroupCapped, 'o4')).toEqual({ o3: 1, o4: 1 })
  })
})

describe('addonSelectionsTotal', () => {
  it('soma preço * quantidade das opções selecionadas', () => {
    expect(addonSelectionsTotal({ o2: 1, o3: 2 }, [singleGroup, multipleGroupCapped])).toBe(13)
  })

  it('sem seleção soma zero', () => {
    expect(addonSelectionsTotal({}, [singleGroup, multipleGroupCapped])).toBe(0)
  })
})

describe('addonSelectionsLoverTotal', () => {
  it('soma loverPrice * quantidade das opções selecionadas', () => {
    expect(addonSelectionsLoverTotal({ o2: 1, o3: 2 }, [singleGroup, multipleGroupCapped])).toBe(10)
  })

  it('sem seleção soma zero', () => {
    expect(addonSelectionsLoverTotal({}, [singleGroup, multipleGroupCapped])).toBe(0)
  })
})
