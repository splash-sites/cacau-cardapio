import { describe, expect, it } from 'vitest'
import { hasFullName } from './fullName'

describe('hasFullName', () => {
  it('true com nome e sobrenome', () => {
    expect(hasFullName('Bernardo Dornelles')).toBe(true)
  })

  it('true com nome composto', () => {
    expect(hasFullName('Maria da Silva')).toBe(true)
  })

  it('false só com um nome', () => {
    expect(hasFullName('Bernardo')).toBe(false)
  })

  it('false com espaços em branco só de um lado', () => {
    expect(hasFullName('  Bernardo  ')).toBe(false)
  })

  it('false vazio', () => {
    expect(hasFullName('')).toBe(false)
  })

  it('ignora espaços duplicados entre nome e sobrenome', () => {
    expect(hasFullName('Bernardo   Dornelles')).toBe(true)
  })
})
