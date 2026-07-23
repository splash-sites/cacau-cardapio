import { useQuery } from '@tanstack/react-query'
import { supabaseOrderStatusRepository } from '../../infrastructure/order/SupabaseOrderStatusRepository'

const POLL_INTERVAL_MS = 5000

export function useOrderStatus(orderId: string, customerCpf: string) {
  return useQuery({
    queryKey: ['orderStatus', orderId, customerCpf],
    queryFn: () => supabaseOrderStatusRepository.getStatus(orderId, customerCpf),
    refetchInterval: (query) => {
      const status = query.state.data
      return status === 'finalized' || status === 'cancelled' ? false : POLL_INTERVAL_MS
    },
  })
}
