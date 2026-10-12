import { describe, expect, it } from 'vitest'
import { isStockError, stockErrorMessage } from './stockError'

describe('isStockError', () => {
  it('reconhece a mensagem do trigger da revenda', () => {
    expect(isStockError('Estoque de revendedor insuficiente para "Brownie"')).toBe(true)
  })

  it('reconhece a mensagem do trigger do varejo', () => {
    expect(isStockError('Estoque insuficiente para "Brownie"')).toBe(true)
  })

  it('reconhece produto já esgotado no confirm_order (avulso e combo)', () => {
    expect(isStockError('Produto sem estoque: 5b1c')).toBe(true)
    expect(isStockError('Produto 5b1c do combo sem estoque')).toBe(true)
  })

  it('não confunde com outros erros', () => {
    expect(isStockError('Loja inativa')).toBe(false)
  })
})

describe('stockErrorMessage', () => {
  it('mantém a mensagem que já traz o nome do produto', () => {
    expect(stockErrorMessage('Estoque insuficiente para "Brownie"')).toBe('Estoque insuficiente para "Brownie"')
  })

  it('troca a mensagem com id do produto por um texto pro cliente', () => {
    expect(stockErrorMessage('Produto sem estoque: 5b1c')).toBe('Um produto do seu carrinho esgotou.')
  })
})
