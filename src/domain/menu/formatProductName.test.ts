import { describe, expect, it } from 'vitest'
import { formatProductName } from './formatProductName'

describe('formatProductName', () => {
  it('tudo maiúsculo vira primeira letra maiúscula, resto minúsculo', () => {
    expect(formatProductName('FONDUE CHOC AO LEITE CS 250')).toBe('Fondue choc ao leite cs 250')
  })

  it('tudo minúsculo vira primeira letra maiúscula', () => {
    expect(formatProductName('fondue frutas 160g')).toBe('Fondue frutas 160g')
  })

  it('title case vira primeira letra maiúscula, resto minúsculo', () => {
    expect(formatProductName('Grand Gâteau')).toBe('Grand gâteau')
  })

  it('já no formato certo não muda', () => {
    expect(formatProductName('Água')).toBe('Água')
  })

  it('string vazia passa direto', () => {
    expect(formatProductName('')).toBe('')
  })

  it('1 caractere só', () => {
    expect(formatProductName('X')).toBe('X')
    expect(formatProductName('x')).toBe('X')
  })
})
