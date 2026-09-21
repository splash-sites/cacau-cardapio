import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useCurrentStore } from '../store/useCurrentStore'
import { useOrderType } from './useOrderType'

// Entrada do canal de revendedor (/:storeSlug/atacado). Mesmas telas do varejo
// dali em diante — a diferença é só o canal no estado. Revendedor só retira no
// local: sempre 'pickup' (sem mesa, sem entrega). Loja sem retirada não tem atacado.
// `ready` pelo mesmo motivo do TableEntryPage: estado setado antes do <Navigate>.
export function ResellerEntryPage() {
  const store = useCurrentStore()
  const setSalesChannel = useOrderType((state) => state.setSalesChannel)
  const setOrderType = useOrderType((state) => state.setOrderType)
  const [ready, setReady] = useState(false)

  const valid = store.resellerEnabled && store.supportsPickup

  useEffect(() => {
    if (valid) {
      setSalesChannel('reseller')
      setOrderType('pickup')
    }
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid])

  if (!ready) return null
  if (!valid) return <Navigate to={`/${store.slug}`} replace />
  return <Navigate to={`/${store.slug}/cardapio`} replace />
}
