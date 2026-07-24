import { Outlet, useParams } from 'react-router-dom'
import { StoreContext } from './StoreContext'
import { useStore } from './useStore'

export function StoreLayout() {
  const { storeSlug = '' } = useParams<{ storeSlug: string }>()
  const { data: store, isLoading, isError } = useStore(storeSlug)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-body text-foreground/70">Carregando…</p>
      </div>
    )
  }

  if (isError || !store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background px-4 text-center">
        <p className="font-display text-xl text-accent">Loja não encontrada</p>
        <p className="font-body text-foreground/70">Confira o link e tente de novo.</p>
      </div>
    )
  }

  return (
    <StoreContext.Provider value={store}>
      <Outlet />
    </StoreContext.Provider>
  )
}
