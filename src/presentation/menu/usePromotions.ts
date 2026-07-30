import { useQuery } from '@tanstack/react-query'
import { listPromotions } from '../../application/promotion/listPromotions'
import { supabasePromotionRepository } from '../../infrastructure/promotion/SupabasePromotionRepository'

export function usePromotions(storeId: string) {
  return useQuery({
    queryKey: ['promotions', storeId],
    queryFn: () => listPromotions(supabasePromotionRepository, storeId),
  })
}
