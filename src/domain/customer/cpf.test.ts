import { describe, expect, it } from 'vitest'
import { formatCpf, isValidCpf, normalizeCpf } from './cpf'

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
