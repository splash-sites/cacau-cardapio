import { createContext, useContext } from 'react'
import type { Store } from '../../domain/store/Store'

const StoreContext = createContext<Store | null>(null)

export const StoreProvider = StoreContext.Provider

export function useCurrentStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useCurrentStore usado fora de StoreProvider')
  return store
}
