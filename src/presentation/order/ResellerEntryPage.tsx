import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useCurrentStore } from '../store/useCurrentStore'
import { useOrderType } from './useOrderType'

// Entrada do canal de revendedor (/:storeSlug/atacado). Mesmas telas do varejo
// dali em diante — a diferença é só o canal no estado. Sem mesa: revendedor só
// retira ou recebe, então cai em 'pickup' (o toggle retirar/receber continua
// sendo feito na identificação) ou 'delivery' se a loja não aceitar retirada.
// `ready` pelo mesmo motivo do TableEntryPage: estado setado antes do <Navigate>.
export function ResellerEntryPage() {
  const store = useCurrentStore()
  const setSalesChannel = useOrderType((state) => state.setSalesChannel)
  const setOrderType = useOrderType((state) => state.setOrderType)
  const [ready, setReady] = useState(false)

  const orderType = store.supportsPickup ? 'pickup' : store.supportsDelivery ? 'delivery' : null
  const valid = store.resellerEnabled && orderType !== null

  useEffect(() => {
    if (valid && orderType) {
      setSalesChannel('reseller')
      setOrderType(orderType)
    }
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, orderType])

  if (!ready) return null
  if (!valid) return <Navigate to={`/${store.slug}`} replace />
  return <Navigate to={`/${store.slug}/cardapio`} replace />
}
