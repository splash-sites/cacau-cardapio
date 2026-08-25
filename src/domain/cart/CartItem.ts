import type { AddonOption } from '../addon/AddonOption'
import type { Product } from '../menu/Product'
import type { VariationOption } from '../variation/VariationOption'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  addons: AddonOption[]
  variations: VariationOption[]
  note?: string
  // Presentes só quando o item veio de uma promoção com desconto/combo
  // (PromotionDetailModal). promotionId é o id real da promoção (vai pra RPC
  // decidir o preço no servidor); comboGroupId identifica UMA adição de combo
  // ao carrinho — combo é atômico (ver Cart.addComboItems), nunca se mistura
  // com item avulso nem com outra adição do mesmo combo.
  promotionId?: string
  comboGroupId?: string
  // Preço BASE (produto + variação) já com desconto aplicado, calculado uma vez
  // no PromotionDetailModal via distributePromotionDiscount — só pra exibição
  // no carrinho/revisão/WhatsApp. Adicional continua somado por cima igual a
  // qualquer item (nunca entra no desconto). Quem decide o preço de verdade
  // sempre é a RPC confirm_order, no servidor — isso aqui nunca é enviado como
  // preço, só o promotionId + produto/variação/adicional crus (ver
  // SupabaseOrderRepository).
  discountedUnitPrice?: number
  discountedLoverUnitPrice?: number
}
