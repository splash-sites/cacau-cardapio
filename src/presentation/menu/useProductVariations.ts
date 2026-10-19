import { queryOptions, useQuery } from '@tanstack/react-query'
import { supabaseVariationRepository } from '../../infrastructure/variation/SupabaseVariationRepository'

export function productVariationsQuery(productId: string) {
  return queryOptions({
    queryKey: ['product-variations', productId],
    queryFn: () => supabaseVariationRepository.listProductVariationGroups(productId),
  })
}

export function useProductVariations(productId: string) {
  return useQuery(productVariationsQuery(productId))
}
