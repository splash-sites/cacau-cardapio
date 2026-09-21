import { describe, expect, it } from 'vitest'
import { isResellerStockError } from './resellerStockError'

describe('isResellerStockError', () => {
  it('reconhece a mensagem do trigger', () => {
    expect(isResellerStockError('Estoque de revendedor insuficiente para "Brownie"')).toBe(true)
  })

  it('não confunde com outros erros', () => {
    expect(isResellerStockError('Loja inativa')).toBe(false)
  })
})
