import { useQuery } from '@tanstack/react-query'
import { supabaseAddonRepository } from '../../infrastructure/addon/SupabaseAddonRepository'

export function useProductAddons(productId: string) {
  return useQuery({
    queryKey: ['product-addons', productId],
    queryFn: () => supabaseAddonRepository.listProductAddonGroups(productId),
  })
}
