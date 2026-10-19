import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AddonGroup } from '../../domain/addon/AddonGroup'
import type { Product } from '../../domain/menu/Product'
import type { VariationGroup } from '../../domain/variation/VariationGroup'
import { useCart } from '../cart/useCart'
import { ProductDetailModal } from './ProductDetailModal'

type OptionsQuery<T> = { data: T[] | undefined; isPending: boolean; isError: boolean }

const options = vi.hoisted(() => ({
  addons: { data: [], isPending: false, isError: false } as OptionsQuery<unknown>,
  variations: { data: [], isPending: false, isError: false } as OptionsQuery<unknown>,
}))

vi.mock('./useProductAddons', () => ({ useProductAddons: () => options.addons }))
vi.mock('./useProductVariations', () => ({ useProductVariations: () => options.variations }))

const product: Product = {
  id: 'p1',
  storeId: 's1',
  name: 'Fondue grande',
  category: 'Fondue',
  categoryId: null,
  description: 'Chocolate com frutas',
  imageUrl: 'https://example.com/fondue.jpg',
  unit: null,
  price: 20,
  loverPrice: 18,
  stockQuantity: 0,
  trackStock: false,
  sortOrder: 0,
  active: true,
  availableDineIn: true,
  availablePickup: true,
  availableDelivery: true,
}

const fruitGroup: VariationGroup = {
  id: 'vg1',
  name: 'Frutas',
  priceMode: 'replace',
  options: [{ id: 'vo1', name: 'Misto', price: 35, loverPrice: 30, priceMode: 'replace' }],
}

const toppingGroup: AddonGroup = {
  id: 'ag1',
  name: 'Coberturas',
  selectionType: 'multiple',
  maxQuantity: null,
  options: [{ id: 'ao1', name: 'Granulado', price: 2, loverPrice: 2 }],
}

function setOptions(variations: VariationGroup[] | undefined, addons: AddonGroup[] | undefined, isPending = false) {
  options.variations = { data: variations, isPending, isError: false }
  options.addons = { data: addons, isPending, isError: false }
}

function renderModal() {
  const onClose = vi.fn()
  const view = render(<ProductDetailModal product={product} onClose={onClose} />)
  return { ...view, onClose }
}

function expectIntro() {
  expect(screen.getByRole('button', { name: 'Ver foto de Fondue grande' })).toBeInTheDocument()
  expect(screen.getByText('Chocolate com frutas')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Fondue grande' })).toBeInTheDocument()
}

beforeEach(() => {
  vi.useFakeTimers()
  useCart.setState({ items: [] })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('ProductDetailModal', () => {
  it('produto sem opções: apresentação com quantidade e "Adicionar ao pedido" direto', () => {
    setOptions([], [])
    renderModal()

    expectIntro()
    expect(screen.queryByText(/Passo/)).not.toBeInTheDocument()
    expect(screen.getByText('Quantidade')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Adicionar ao pedido' })).toBeEnabled()
  })

  it('produto com opções abre na mesma apresentação, com "Escolher opções"', () => {
    setOptions([fruitGroup], [toppingGroup])
    renderModal()

    expectIntro()
    expect(screen.queryByText(/Passo/)).not.toBeInTheDocument()
    expect(screen.queryByText('Quantidade')).not.toBeInTheDocument()
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Escolher opções' })).toBeEnabled()
  })

  it('enquanto as opções carregam já mostra a apresentação, só o botão espera', () => {
    setOptions(undefined, undefined, true)
    const { rerender, onClose } = renderModal()

    expectIntro()
    expect(screen.getByRole('button', { name: 'Carregando opções…' })).toBeDisabled()

    // Opções chegam: mesma apresentação, botão destrava.
    setOptions([fruitGroup], [toppingGroup])
    rerender(<ProductDetailModal product={product} onClose={onClose} />)
    expectIntro()
    expect(screen.getByRole('button', { name: 'Escolher opções' })).toBeEnabled()
  })

  it('percorre variação e adicional e adiciona ao carrinho com as escolhas', () => {
    setOptions([fruitGroup], [toppingGroup])
    const { onClose } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Escolher opções' }))

    // Passo 1: variação obrigatória trava o "Continuar".
    expect(screen.getByText('Passo 1 de 2')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Frutas' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ver foto de Fondue grande' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
    fireEvent.click(screen.getByRole('radio', { name: /Misto/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    // Passo 2 (último): adicional opcional + quantidade.
    expect(screen.getByText('Passo 2 de 2')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Coberturas' })).toBeInTheDocument()
    expect(screen.getByText('Quantidade')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: /Granulado/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar ao pedido' }))

    const [item] = useCart.getState().items
    expect(item.product.id).toBe('p1')
    expect(item.variations.map((variation) => variation.name)).toEqual(['Misto'])
    expect(item.addons.map((addon) => addon.name)).toEqual(['Granulado'])

    act(() => {
      vi.runAllTimers()
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('voltar da primeira etapa de opção retorna pra apresentação', () => {
    setOptions([fruitGroup], [])
    renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Escolher opções' }))
    expect(screen.getByRole('heading', { name: 'Frutas' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))
    expectIntro()
    expect(screen.getByRole('button', { name: 'Escolher opções' })).toBeEnabled()
  })
})
