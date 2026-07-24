import { useContext } from 'react'
import type { Store } from '../../domain/store/Store'
import { StoreContext } from './StoreContext'

export function useCurrentStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useCurrentStore usado fora de StoreProvider')
  return store
}
