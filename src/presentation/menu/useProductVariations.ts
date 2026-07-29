import { useQuery } from '@tanstack/react-query'
import { supabaseVariationRepository } from '../../infrastructure/variation/SupabaseVariationRepository'

export function useProductVariations(productId: string) {
  return useQuery({
    queryKey: ['product-variations', productId],
    queryFn: () => supabaseVariationRepository.listProductVariationGroups(productId),
  })
}
