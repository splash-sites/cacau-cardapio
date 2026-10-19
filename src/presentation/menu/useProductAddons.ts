import { queryOptions, useQuery } from '@tanstack/react-query'
import { supabaseAddonRepository } from '../../infrastructure/addon/SupabaseAddonRepository'

export function productAddonsQuery(productId: string) {
  return queryOptions({
    queryKey: ['product-addons', productId],
    queryFn: () => supabaseAddonRepository.listProductAddonGroups(productId),
  })
}

export function useProductAddons(productId: string) {
  return useQuery(productAddonsQuery(productId))
}
