import { z } from 'zod'
import { isValidCpf } from '../../domain/customer/cpf'
import { hasFullName } from '../../domain/customer/fullName'
import type { OrderType } from '../../domain/order/OrderType'

export const addressSchema = z.object({
  street: z.string().min(2, 'Rua obrigatória'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'UF com 2 letras'),
  zipCode: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
})

const PHONE_REGEX = /^\(?\d{2}\)?\s?9?\s?\d{4}-?\d{4}$/

const identificationObjectSchema = z.object({
  fullName: z.string().trim().min(2, 'Nome muito curto').refine(hasFullName, 'Informe nome e sobrenome'),
  cpf: z.string().refine(isValidCpf, 'CPF inválido'),
  // Validação de formato fica no superRefine abaixo — telefone só é
  // obrigatório fora de dine_in (mesa já identifica o cliente fisicamente).
  phone: z.string(),
  address: addressSchema.optional(),
  tableNumber: z.string().optional(),
  // pickup/delivery viraram uma escolha só, feita aqui no checkout (não mais na
  // tela de tipo de pedido) — este campo carrega essa escolha.
  wantsDelivery: z.boolean().optional(),
})

export type IdentificationInput = z.infer<typeof identificationObjectSchema>

// Endereço só é obrigatório quando o cliente marca "receber" no toggle de
// retirada/entrega (wantsDelivery, ver IdentificationPage) — não depende mais
// do orderType de entrada, que agora só chega como 'pickup' (placeholder do
// fluxo unificado) ou 'delivery' (loja sem suporte a pickup, toggle nem
// aparece). Mesa só quando orderType === 'dine_in', isso não mudou.
export function identificationSchema(orderType: OrderType) {
  return identificationObjectSchema.superRefine((data, ctx) => {
    // Telefone obrigatório fora de dine_in. Na mesa, o telefone é opcional —
    // mas se o cliente digitar algo, ainda valida o formato.
    const phoneRequired = orderType !== 'dine_in'
    if (phoneRequired || data.phone) {
      if (!PHONE_REGEX.test(data.phone)) {
        ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Telefone inválido' })
      }
    }
    if (data.wantsDelivery && !data.address) {
      ctx.addIssue({ code: 'custom', path: ['address'], message: 'Endereço obrigatório para entrega' })
    }
    if (orderType === 'dine_in' && !data.tableNumber) {
      ctx.addIssue({ code: 'custom', path: ['tableNumber'], message: 'Número da mesa obrigatório' })
    }
  })
}
