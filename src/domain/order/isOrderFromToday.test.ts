import { describe, expect, it } from 'vitest'
import { isOrderFromToday } from './isOrderFromToday'

const now = new Date('2026-07-30T15:00:00-03:00')

describe('isOrderFromToday', () => {
  it('true pra pedido feito mais cedo no mesmo dia', () => {
    expect(isOrderFromToday('2026-07-30T09:00:00-03:00', now)).toBe(true)
  })

  it('false pra pedido de ontem', () => {
    expect(isOrderFromToday('2026-07-29T23:59:00-03:00', now)).toBe(false)
  })

  it('false pra pedido de outro mês', () => {
    expect(isOrderFromToday('2026-06-30T15:00:00-03:00', now)).toBe(false)
  })

  it('true no limite da meia-noite (00:00:01 do dia atual)', () => {
    expect(isOrderFromToday('2026-07-30T00:00:01-03:00', now)).toBe(true)
  })
})
