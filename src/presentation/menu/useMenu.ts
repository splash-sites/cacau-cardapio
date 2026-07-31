import { useQuery } from '@tanstack/react-query'
import { listMenu } from '../../application/menu/listMenu'
import type { OrderType } from '../../domain/order/OrderType'
import { supabaseProductRepository } from '../../infrastructure/menu/SupabaseProductRepository'

export function useMenu(storeId: string, orderType: OrderType | null) {
  return useQuery({
    queryKey: ['menu', storeId, orderType],
    queryFn: () => listMenu(supabaseProductRepository, storeId, orderType!),
    enabled: orderType !== null,
  })
}
