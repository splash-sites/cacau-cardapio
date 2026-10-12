import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useCurrentStore } from '../store/useCurrentStore'
import { PageShell } from '../shared/PageShell'
import { StoreHero } from '../store/StoreHero'
import { useOrderType } from './useOrderType'

// Entrada via QR code de mesa: já marca dine_in e o número da mesa e mostra as
// boas-vindas com o número, antes do cardápio. `ready` garante que o estado
// já foi setado antes de qualquer navegação (evita MenuPage ler orderType antigo).
export function TableEntryPage() {
  const store = useCurrentStore()
  const navigate = useNavigate()
  const { numeroMesa } = useParams<{ numeroMesa: string }>()
  const setOrderType = useOrderType((state) => state.setOrderType)
  const setTableNumber = useOrderType((state) => state.setTableNumber)
  const clearTableNumber = useOrderType((state) => state.clearTableNumber)
  const setSalesChannel = useOrderType((state) => state.setSalesChannel)
  const [ready, setReady] = useState(false)

  const valid = store.supportsDineIn && !!numeroMesa?.trim()
  const table = numeroMesa?.trim() ?? ''

  useEffect(() => {
    if (valid) {
      setSalesChannel('retail')
      setOrderType('dine_in')
      setTableNumber(table)
    }
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, table])

  if (!ready) return null
  if (!valid) return <Navigate to={`/${store.slug}`} replace />

  function orderToGo() {
    clearTableNumber()
    setOrderType(store.supportsPickup ? 'pickup' : 'delivery')
    navigate(`/${store.slug}/cardapio`)
  }

  return (
    <PageShell className="flex min-h-dvh flex-col">
      <StoreHero
        storeName={store.name}
        height="short"
        title={
          <>
            Você está
            <br />
            na mesa {table}
          </>
        }
      />
      <div className="flex flex-col gap-3.5 px-5 py-6">
        <p className="text-base text-soft">
          Peça por aqui e a gente leva até a sua mesa. Pode pedir mais de uma vez: tudo vai para a mesma conta.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/${store.slug}/cardapio`)}
          className="flex h-16 items-center justify-between rounded-[20px] bg-caramel px-[22px] text-lg font-semibold text-on-caramel transition-opacity active:opacity-80"
        >
          Ver o cardápio
          <ChevronRight size={22} aria-hidden="true" />
        </button>
        {(store.supportsPickup || store.supportsDelivery) && (
          <button type="button" onClick={orderToGo} className="self-center py-2.5 text-[15px] text-ink underline-offset-4 hover:underline">
            Não é a mesa {table}? Pedir para levar
          </button>
        )}
      </div>
    </PageShell>
  )
}
