import { useQuery } from '@tanstack/react-query'
import { supabaseOrderHistoryRepository } from '../../infrastructure/order/SupabaseOrderHistoryRepository'

const POLL_INTERVAL_MS = 5000

export function useOrderHistory(storeId: string, customerCpf: string | null) {
  return useQuery({
    queryKey: ['orderHistory', storeId, customerCpf],
    queryFn: () => supabaseOrderHistoryRepository.listOrders(storeId, customerCpf!),
    enabled: !!customerCpf,
    refetchInterval: POLL_INTERVAL_MS,
  })
}
