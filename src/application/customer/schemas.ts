import { z } from 'zod'
import { isValidCpf } from '../../domain/customer/cpf'
import type { OrderType } from '../../domain/order/OrderType'

export const addressSchema = z.object({
  street: z.string().min(2, 'Rua obrigatória'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'UF com 2 letras'),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
})

const identificationObjectSchema = z.object({
  fullName: z.string().min(2, 'Nome muito curto'),
  cpf: z.string().refine(isValidCpf, 'CPF inválido'),
  phone: z.string().regex(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/, 'Telefone inválido'),
  address: addressSchema.optional(),
  tableNumber: z.string().optional(),
})

export type IdentificationInput = z.infer<typeof identificationObjectSchema>

// Endereço só é obrigatório quando orderType === 'delivery', mesa só quando
// orderType === 'dine_in' — já sabido antes dessa tela (escolhido na tela de
// tipo de pedido), não é pergunta de novo ao cliente.
export function identificationSchema(orderType: OrderType) {
  return identificationObjectSchema.superRefine((data, ctx) => {
    if (orderType === 'delivery' && !data.address) {
      ctx.addIssue({ code: 'custom', path: ['address'], message: 'Endereço obrigatório para entrega' })
    }
    if (orderType === 'dine_in' && !data.tableNumber) {
      ctx.addIssue({ code: 'custom', path: ['tableNumber'], message: 'Número da mesa obrigatório' })
    }
  })
}
