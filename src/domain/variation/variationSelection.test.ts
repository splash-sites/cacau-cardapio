import { describe, expect, it } from 'vitest'
import {
  isVariationSelectionComplete,
  resolveBasePrice,
  resolveSelectedVariations,
  selectVariationOption,
  variationLoverPriceTotal,
  variationPriceTotal,
} from './variationSelection'
import type { Product } from '../menu/Product'
import type { VariationGroup } from './VariationGroup'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    storeId: 'store-1',
    name: 'Capuccino',
    category: 'Cafés',
    description: null,
    imageUrl: null,
    unit: null,
    price: 8,
    loverPrice: 6.9,
    stockQuantity: 10,
    trackStock: false,
    sortOrder: 0,
    active: true,
    availableDineIn: true,
    availablePickup: true,
    availableDelivery: true,
    ...overrides,
  }
}

// price_mode 'replace' — tamanho substitui o preço base do produto.
const sizeGroup: VariationGroup = {
  id: 'g1',
  name: 'Tamanho',
  priceMode: 'replace',
  options: [
    { id: 'small', name: 'Pequeno', price: 6, loverPrice: 5, priceMode: 'replace' },
    { id: 'large', name: 'Grande', price: 10, loverPrice: 8, priceMode: 'replace' },
  ],
}

// price_mode 'additive' com delta neutro (0) — não muda o preço.
const flavorGroup: VariationGroup = {
  id: 'g2',
  name: 'Sabor',
  priceMode: 'additive',
  options: [
    { id: 'dark', name: 'Chocolate Preto', price: 0, loverPrice: 0, priceMode: 'additive' },
    { id: 'white', name: 'Chocolate Branco', price: 0, loverPrice: 0, priceMode: 'additive' },
  ],
}

// price_mode 'additive' com delta real — soma em cima do preço base.
const specialGroup: VariationGroup = {
  id: 'g3',
  name: 'Chocolate especial',
  priceMode: 'additive',
  options: [{ id: 'special', name: 'Chocolate belga', price: 2, loverPrice: 1.5, priceMode: 'additive' }],
}

describe('selectVariationOption', () => {
  it('seleciona opção do grupo', () => {
    expect(selectVariationOption({}, 'g1', 'large')).toEqual({ g1: 'large' })
  })

  it('trocar opção no mesmo grupo substitui a anterior', () => {
    expect(selectVariationOption({ g1: 'small' }, 'g1', 'large')).toEqual({ g1: 'large' })
  })

  it('não afeta seleção de outro grupo', () => {
    expect(selectVariationOption({ g2: 'dark' }, 'g1', 'large')).toEqual({ g2: 'dark', g1: 'large' })
  })
})

describe('isVariationSelectionComplete', () => {
  it('incompleto quando falta grupo', () => {
    expect(isVariationSelectionComplete({ g1: 'large' }, [sizeGroup, flavorGroup])).toBe(false)
  })

  it('completo quando todos os grupos têm opção', () => {
    expect(isVariationSelectionComplete({ g1: 'large', g2: 'dark' }, [sizeGroup, flavorGroup])).toBe(true)
  })

  it('sem grupo nenhum já é completo', () => {
    expect(isVariationSelectionComplete({}, [])).toBe(true)
  })
})

describe('resolveSelectedVariations', () => {
  it('resolve as opções escolhidas de cada grupo', () => {
    const variations = resolveSelectedVariations({ g1: 'large', g2: 'dark' }, [sizeGroup, flavorGroup])
    expect(variations.map((v) => v.name)).toEqual(['Grande', 'Chocolate Preto'])
  })

  it('ignora grupo sem seleção', () => {
    const variations = resolveSelectedVariations({ g1: 'large' }, [sizeGroup, flavorGroup])
    expect(variations.map((v) => v.name)).toEqual(['Grande'])
  })
})

describe('variationPriceTotal / variationLoverPriceTotal', () => {
  it('soma o preço das variações selecionadas', () => {
    const variations = resolveSelectedVariations({ g1: 'large', g2: 'dark' }, [sizeGroup, flavorGroup])
    expect(variationPriceTotal(variations)).toBe(10)
    expect(variationLoverPriceTotal(variations)).toBe(8)
  })

  it('sem variação selecionada soma zero', () => {
    expect(variationPriceTotal([])).toBe(0)
    expect(variationLoverPriceTotal([])).toBe(0)
  })
})

describe('resolveBasePrice', () => {
  it('replace com valor 0 (sem valor cadastrado) cai pro preço do produto', () => {
    const variations = resolveSelectedVariations({ g2: 'dark' }, [flavorGroup])
    expect(resolveBasePrice(makeProduct(), variations)).toEqual({ regular: 8, lover: 6.9 })
  })

  it('replace com valor substitui o preço do produto por inteiro', () => {
    const variations = resolveSelectedVariations({ g1: 'large' }, [sizeGroup])
    expect(resolveBasePrice(makeProduct(), variations)).toEqual({ regular: 10, lover: 8 })
  })

  it('additive neutro (0) não muda o preço do produto', () => {
    const variations = resolveSelectedVariations({ g2: 'dark' }, [flavorGroup])
    expect(resolveBasePrice(makeProduct(), variations)).toEqual({ regular: 8, lover: 6.9 })
  })

  it('additive com valor soma em cima do preço do produto', () => {
    const variations = resolveSelectedVariations({ g3: 'special' }, [specialGroup])
    expect(resolveBasePrice(makeProduct(), variations)).toEqual({ regular: 10, lover: 8.4 })
  })

  it('replace + additive juntos: replace vira a base, additive soma em cima (não é o preço do produto)', () => {
    const variations = resolveSelectedVariations({ g1: 'large', g3: 'special' }, [sizeGroup, specialGroup])
    expect(resolveBasePrice(makeProduct(), variations)).toEqual({ regular: 12, lover: 9.5 })
  })

  it('replace sem valor + additive com valor: cai pro preço do produto e soma o additive', () => {
    const variations = resolveSelectedVariations({ g2: 'dark', g3: 'special' }, [flavorGroup, specialGroup])
    expect(resolveBasePrice(makeProduct(), variations)).toEqual({ regular: 10, lover: 8.4 })
  })

  it('sem nenhuma variação selecionada, usa o preço do produto', () => {
    expect(resolveBasePrice(makeProduct(), [])).toEqual({ regular: 8, lover: 6.9 })
  })
})
