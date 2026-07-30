import { useQuery } from '@tanstack/react-query'
import { hasActiveOrders } from '../../domain/order/hasActiveOrders'
import { supabaseOrderHistoryRepository } from '../../infrastructure/order/SupabaseOrderHistoryRepository'

const POLL_INTERVAL_MS = 5000

export function useOrderHistory(storeId: string, customerCpf: string | null) {
  return useQuery({
    queryKey: ['orderHistory', storeId, customerCpf],
    queryFn: () => supabaseOrderHistoryRepository.listOrders(storeId, customerCpf!),
    enabled: !!customerCpf,
    // Para de fazer polling quando nenhum pedido da lista está mais em
    // andamento — pedido finalizado/cancelado não muda de status, então
    // continuar perguntando é requisição sem utilidade nenhuma.
    refetchInterval: (query) => {
      const orders = query.state.data
      return orders && !hasActiveOrders(orders) ? false : POLL_INTERVAL_MS
    },
  })
}
