import { describe, expect, it } from 'vitest'
import { identificationSchema } from './schemas'

const validAddress = {
  street: 'Rua das Flores',
  number: '123',
  neighborhood: 'Centro',
  city: 'Torres',
  state: 'RS',
  zipCode: '95560-000',
}

const baseInput = {
  fullName: 'Maria Silva',
  cpf: '529.982.247-25',
  phone: '(51) 99999-8888',
}

describe('identificationSchema', () => {
  it('pickup não exige endereço nem mesa', () => {
    expect(identificationSchema('pickup').safeParse(baseInput).success).toBe(true)
  })

  it('dine_in exige número da mesa', () => {
    expect(identificationSchema('dine_in').safeParse(baseInput).success).toBe(false)
  })

  it('dine_in aceita com número da mesa', () => {
    const result = identificationSchema('dine_in').safeParse({ ...baseInput, tableNumber: '12' })
    expect(result.success).toBe(true)
  })

  it('delivery exige endereço', () => {
    expect(identificationSchema('delivery').safeParse(baseInput).success).toBe(false)
  })

  it('delivery aceita com endereço', () => {
    const result = identificationSchema('delivery').safeParse({ ...baseInput, address: validAddress })
    expect(result.success).toBe(true)
  })

  it('rejeita CPF inválido', () => {
    const result = identificationSchema('pickup').safeParse({ ...baseInput, cpf: '111.111.111-11' })
    expect(result.success).toBe(false)
  })

  it('rejeita nome muito curto', () => {
    const result = identificationSchema('pickup').safeParse({ ...baseInput, fullName: 'M' })
    expect(result.success).toBe(false)
  })

  it('rejeita telefone inválido', () => {
    const result = identificationSchema('pickup').safeParse({ ...baseInput, phone: '123' })
    expect(result.success).toBe(false)
  })
})
