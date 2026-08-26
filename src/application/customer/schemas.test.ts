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

  it('wantsDelivery exige endereço', () => {
    const result = identificationSchema('pickup').safeParse({ ...baseInput, wantsDelivery: true })
    expect(result.success).toBe(false)
  })

  it('wantsDelivery aceita com endereço', () => {
    const result = identificationSchema('pickup').safeParse({ ...baseInput, wantsDelivery: true, address: validAddress })
    expect(result.success).toBe(true)
  })

  it('orderType delivery (loja sem pickup) sem wantsDelivery marcado ainda exige endereço via wantsDelivery default do form', () => {
    // identificationSchema não força mais endereço só por orderType==='delivery' — quem decide é
    // wantsDelivery. IdentificationPage seta defaultValues.wantsDelivery = (orderType === 'delivery')
    // pra cobrir a loja só-delivery, então esse caso sempre chega ao schema com wantsDelivery true.
    const result = identificationSchema('delivery').safeParse({ ...baseInput, wantsDelivery: true })
    expect(result.success).toBe(false)
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

  it('dine_in aceita sem telefone', () => {
    const result = identificationSchema('dine_in').safeParse({ ...baseInput, phone: '', tableNumber: '12' })
    expect(result.success).toBe(true)
  })

  it('dine_in ainda valida formato se o telefone vier preenchido', () => {
    const result = identificationSchema('dine_in').safeParse({ ...baseInput, phone: '123', tableNumber: '12' })
    expect(result.success).toBe(false)
  })

  it('pickup continua exigindo telefone', () => {
    const result = identificationSchema('pickup').safeParse({ ...baseInput, phone: '' })
    expect(result.success).toBe(false)
  })
})
