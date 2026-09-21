import { useQuery } from '@tanstack/react-query'
import { listMenu } from '../../application/menu/listMenu'
import type { OrderType } from '../../domain/order/OrderType'
import type { SalesChannel } from '../../domain/order/SalesChannel'
import { supabaseCategoryRepository } from '../../infrastructure/menu/SupabaseCategoryRepository'
import { supabaseProductRepository } from '../../infrastructure/menu/SupabaseProductRepository'

export function useMenu(storeId: string, orderType: OrderType | null, channel: SalesChannel = 'retail') {
  return useQuery({
    queryKey: ['menu', storeId, orderType, channel],
    queryFn: () => listMenu(supabaseProductRepository, supabaseCategoryRepository, storeId, orderType!, channel),
    enabled: orderType !== null,
  })
}
