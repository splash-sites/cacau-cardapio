import { createContext } from 'react'
import type { Store } from '../../domain/store/Store'

export const StoreContext = createContext<Store | null>(null)
