import { useQuery } from '@tanstack/react-query'
import { supabaseBusinessHoursRepository } from '../../infrastructure/store/SupabaseBusinessHoursRepository'

export function useBusinessHours(storeId: string) {
  return useQuery({
    queryKey: ['business-hours', storeId],
    queryFn: () => supabaseBusinessHoursRepository.listBusinessHours(storeId),
  })
}
