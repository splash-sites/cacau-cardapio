import { describe, expect, it } from 'vitest'
import { maskZipCode } from './zipCode'

describe('maskZipCode', () => {
  it('mascara progressivamente enquanto digita', () => {
    expect(maskZipCode('9')).toBe('9')
    expect(maskZipCode('95010')).toBe('95010')
    expect(maskZipCode('950100')).toBe('95010-0')
    expect(maskZipCode('95010000')).toBe('95010-000')
  })

  it('ignora dígitos além de 8 e caracteres não numéricos', () => {
    expect(maskZipCode('95010-000999')).toBe('95010-000')
  })

  it('string vazia sem digitação', () => {
    expect(maskZipCode('')).toBe('')
  })
})
