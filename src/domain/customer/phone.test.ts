import { describe, expect, it } from 'vitest'
import { maskPhone } from './phone'

describe('maskPhone', () => {
  it('mascara progressivamente enquanto digita', () => {
    expect(maskPhone('5')).toBe('(5')
    expect(maskPhone('51')).toBe('(51')
    expect(maskPhone('519')).toBe('(51) 9')
    expect(maskPhone('5199')).toBe('(51) 9 9')
    expect(maskPhone('51999998')).toBe('(51) 9 9999-8')
    expect(maskPhone('51999998888')).toBe('(51) 9 9999-8888')
  })

  it('ignora dígitos além de 11 e caracteres não numéricos', () => {
    expect(maskPhone('(51) 9 9999-8888999')).toBe('(51) 9 9999-8888')
  })

  it('string vazia sem digitação', () => {
    expect(maskPhone('')).toBe('')
  })
})
