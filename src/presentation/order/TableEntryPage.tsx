import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useCurrentStore } from '../store/useCurrentStore'
import { useOrderType } from './useOrderType'

// Entrada via QR code de mesa: pré-seleciona dine_in e o número da mesa,
// pulando a tela de escolha de tipo de pedido. `ready` garante que o estado
// já foi setado antes de navegar — evita MenuPage ler orderType antigo (null)
// numa corrida entre este efeito e o <Navigate>.
export function TableEntryPage() {
  const store = useCurrentStore()
  const { numeroMesa } = useParams<{ numeroMesa: string }>()
  const setOrderType = useOrderType((state) => state.setOrderType)
  const setTableNumber = useOrderType((state) => state.setTableNumber)
  const [ready, setReady] = useState(false)

  const valid = store.supportsDineIn && !!numeroMesa?.trim()

  useEffect(() => {
    if (valid) {
      setOrderType('dine_in')
      setTableNumber(numeroMesa!.trim())
    }
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, numeroMesa])

  if (!ready) return null
  if (!valid) return <Navigate to={`/${store.slug}`} replace />
  return <Navigate to={`/${store.slug}/cardapio`} replace />
}
