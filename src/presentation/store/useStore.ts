import { useQuery } from '@tanstack/react-query'
import { supabaseStoreRepository } from '../../infrastructure/store/SupabaseStoreRepository'

export function useStore(slug: string) {
  return useQuery({
    queryKey: ['store', slug],
    queryFn: () => supabaseStoreRepository.getStoreBySlug(slug),
  })
}
