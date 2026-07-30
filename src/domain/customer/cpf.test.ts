import { describe, expect, it } from 'vitest'
import { formatCpf, isValidCpf, maskCpf, normalizeCpf } from './cpf'

describe('isValidCpf', () => {
  it('aceita CPF válido formatado', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true)
  })

  it('aceita CPF válido sem formatação', () => {
    expect(isValidCpf('52998224725')).toBe(true)
  })

  it('rejeita dígito verificador errado', () => {
    expect(isValidCpf('529.982.247-26')).toBe(false)
  })

  it('rejeita sequência de dígitos repetidos', () => {
    expect(isValidCpf('111.111.111-11')).toBe(false)
  })

  it('rejeita tamanho inválido', () => {
    expect(isValidCpf('123')).toBe(false)
  })
})

describe('normalizeCpf', () => {
  it('remove pontuação', () => {
    expect(normalizeCpf('529.982.247-25')).toBe('52998224725')
  })
})

describe('formatCpf', () => {
  it('formata CPF sem pontuação', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25')
  })

  it('mantém formatado se já vier formatado', () => {
    expect(formatCpf('529.982.247-25')).toBe('529.982.247-25')
  })
})

describe('maskCpf', () => {
  it('mascara progressivamente enquanto digita', () => {
    expect(maskCpf('5')).toBe('5')
    expect(maskCpf('529')).toBe('529')
    expect(maskCpf('5299')).toBe('529.9')
    expect(maskCpf('529982')).toBe('529.982')
    expect(maskCpf('5299822')).toBe('529.982.2')
    expect(maskCpf('529982247')).toBe('529.982.247')
    expect(maskCpf('52998224725')).toBe('529.982.247-25')
  })

  it('ignora dígitos além de 11 e caracteres não numéricos', () => {
    expect(maskCpf('529.982.247-25999')).toBe('529.982.247-25')
  })
})
