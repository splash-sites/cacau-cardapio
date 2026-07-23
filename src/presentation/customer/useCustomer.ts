import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Customer } from '../../domain/customer/Customer'

interface CustomerState {
  customer: Customer | null
  setCustomer: (customer: Customer) => void
  clear: () => void
}

// Persistido de propósito: nome/CPF/telefone não precisam ser repedidos a cada
// pedido no mesmo aparelho (só endereço de delivery é sempre pedido de novo,
// ver IdentificationPage) — CPF já não é secreto neste app, guardar localmente
// não adiciona exposição nova.
export const useCustomer = create<CustomerState>()(
  persist(
    (set) => ({
      customer: null,
      setCustomer: (customer) => set({ customer }),
      clear: () => set({ customer: null }),
    }),
    { name: 'splash-customer' },
  ),
)
