import { describe, expect, it } from 'vitest'
import { currentStepIndex, orderStatusSteps } from './orderStatusSteps'

describe('orderStatusSteps', () => {
  it('dine_in tem 4 etapas, sem out_for_delivery', () => {
    const steps = orderStatusSteps('dine_in')
    expect(steps.map((s) => s.status)).toEqual(['received', 'preparing', 'delivered', 'finalized'])
  })

  it('pickup rotula out_for_delivery como "Pronto pra retirada" e delivered como "Retirado"', () => {
    const steps = orderStatusSteps('pickup')
    expect(steps.map((s) => s.status)).toEqual([
      'received',
      'preparing',
      'out_for_delivery',
      'delivered',
      'finalized',
    ])
    expect(steps[2].label).toBe('Pronto pra retirada')
    expect(steps[3].label).toBe('Retirado')
  })

  it('delivery rotula out_for_delivery como "Saiu pra entrega" e delivered como "Entregue"', () => {
    const steps = orderStatusSteps('delivery')
    expect(steps[2].label).toBe('Saiu pra entrega')
    expect(steps[3].label).toBe('Entregue')
  })
})

describe('currentStepIndex', () => {
  it('acha o índice da etapa atual', () => {
    const steps = orderStatusSteps('pickup')
    expect(currentStepIndex(steps, 'preparing')).toBe(1)
  })

  it('retorna -1 se status não está nas etapas (ex: cancelled)', () => {
    const steps = orderStatusSteps('pickup')
    expect(currentStepIndex(steps, 'cancelled')).toBe(-1)
  })
})
