import { useEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { StoreContext } from './StoreContext'
import { useStore } from './useStore'

export function StoreLayout() {
  const { storeSlug = '' } = useParams<{ storeSlug: string }>()
  const { data: store, isLoading, isError } = useStore(storeSlug)

  useEffect(() => {
    if (store) document.title = `${store.name} · Cardápio`
  }, [store])

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <p className="text-muted">Carregando…</p>
      </div>
    )
  }

  if (isError || !store) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-bg px-4 text-center">
        <p className="font-display text-3xl font-bold">Loja não encontrada</p>
        <p className="text-muted">Confira o link e tente de novo.</p>
      </div>
    )
  }

  return (
    <StoreContext.Provider value={store}>
      <Outlet />
    </StoreContext.Provider>
  )
}
