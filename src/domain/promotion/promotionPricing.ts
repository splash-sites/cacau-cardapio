import type { PromotionDiscountType } from './Promotion'

export interface PromotionPricingLine {
  productId: string
  quantity: number
  // preço unitário AO VIVO da linha, já ajustado por variação se aplicável —
  // esta função não sabe nada de variação, só distribui desconto sobre o que
  // recebe.
  unitPrice: number
}

export interface PromotionPricingResult {
  productId: string
  quantity: number
  discountedUnitPrice: number
}

function applyDiscount(baseTotal: number, discountType: PromotionDiscountType, discountValue: number | null): number {
  if (baseTotal <= 0) return 0
  if (discountType === 'percent' && discountValue !== null) {
    return Math.max(0, baseTotal * (1 - discountValue / 100))
  }
  if (discountType === 'fixed_amount' && discountValue !== null) {
    return Math.max(0, baseTotal - discountValue)
  }
  return baseTotal
}

export function promotionBaseTotal(lines: PromotionPricingLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
}

// Replica distributePromotionDiscount do admin (domain/promotion/promotionPricing.ts
// de lá): floor + método do maior resto, pra soma dos unitPrice das linhas bater
// exata (até o centavo) com o total já descontado, mesmo quando a divisão não é
// exata. Usado só pra EXIBIR preço ao cliente — quem decide o preço de verdade é
// a RPC confirm_order, que roda o mesmo algoritmo no servidor.
export function distributePromotionDiscount(
  lines: PromotionPricingLine[],
  discountType: PromotionDiscountType,
  discountValue: number | null,
): PromotionPricingResult[] {
  const baseTotal = promotionBaseTotal(lines)

  if (baseTotal <= 0) {
    return lines.map((line) => ({ productId: line.productId, quantity: line.quantity, discountedUnitPrice: 0 }))
  }

  const discountedTotal = applyDiscount(baseTotal, discountType, discountValue)
  const ratio = discountedTotal / baseTotal

  const idealCents = lines.map((line) => line.unitPrice * line.quantity * ratio * 100)
  const flooredCents = idealCents.map((cents) => Math.floor(cents))
  const totalFlooredCents = flooredCents.reduce((sum, cents) => sum + cents, 0)
  const targetCents = Math.round(discountedTotal * 100)
  let remainingCents = targetCents - totalFlooredCents

  const remainders = idealCents
    .map((cents, index) => ({ index, remainder: cents - flooredCents[index] }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index)

  const finalCents = [...flooredCents]
  for (const { index } of remainders) {
    if (remainingCents <= 0) break
    finalCents[index] += 1
    remainingCents -= 1
  }

  return lines.map((line, index) => ({
    productId: line.productId,
    quantity: line.quantity,
    discountedUnitPrice: finalCents[index] / 100 / line.quantity,
  }))
}
