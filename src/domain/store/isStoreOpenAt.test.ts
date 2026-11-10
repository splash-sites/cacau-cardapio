import { describe, expect, it } from 'vitest'
import { describeHoursForWeekday, isStoreOpenAt } from './isStoreOpenAt'
import type { BusinessHoursInterval } from './BusinessHours'

const hours: BusinessHoursInterval[] = [
  { weekday: 2, opensAt: '08:00', closesAt: '12:00' },
  { weekday: 2, opensAt: '14:00', closesAt: '18:00' },
]

function at(isoWithoutTz: string): Date {
  return new Date(isoWithoutTz)
}

describe('isStoreOpenAt', () => {
  it('aberto dentro de um dos intervalos do dia', () => {
    expect(isStoreOpenAt(hours, at('2026-11-10T09:00:00'))).toBe(true) // terça
    expect(isStoreOpenAt(hours, at('2026-11-10T15:00:00'))).toBe(true)
  })

  it('fechado no intervalo entre os dois turnos (almoço)', () => {
    expect(isStoreOpenAt(hours, at('2026-11-10T13:00:00'))).toBe(false)
  })

  it('fechado fora do horário (antes de abrir, depois de fechar)', () => {
    expect(isStoreOpenAt(hours, at('2026-11-10T07:00:00'))).toBe(false)
    expect(isStoreOpenAt(hours, at('2026-11-10T19:00:00'))).toBe(false)
  })

  it('fechado em dia sem nenhum intervalo cadastrado', () => {
    expect(isStoreOpenAt(hours, at('2026-11-09T09:00:00'))).toBe(false) // segunda
  })

  it('exatamente no minuto de abertura conta como aberto, no de fechamento não', () => {
    expect(isStoreOpenAt(hours, at('2026-11-10T08:00:00'))).toBe(true)
    expect(isStoreOpenAt(hours, at('2026-11-10T12:00:00'))).toBe(false)
  })

  it('lista vazia nunca abre', () => {
    expect(isStoreOpenAt([], at('2026-11-10T09:00:00'))).toBe(false)
  })
})

describe('describeHoursForWeekday', () => {
  it('junta os intervalos do dia pedido', () => {
    expect(describeHoursForWeekday(hours, 2)).toBe('08:00–12:00 e 14:00–18:00')
  })

  it('retorna null pra dia sem intervalo', () => {
    expect(describeHoursForWeekday(hours, 1)).toBeNull()
  })
})
