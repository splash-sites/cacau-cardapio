import type { Address } from './Address'

export interface Customer {
  fullName: string
  cpf: string
  phone: string
  address: Address | null
}
