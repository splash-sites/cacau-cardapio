import { ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { OrderType } from '../../domain/order/OrderType'
import { useCurrentStore } from '../store/useCurrentStore'
import { PageShell } from '../shared/PageShell'
import { PoweredBy } from '../shared/PoweredBy'
import { StoreHero } from '../store/StoreHero'
import { useOrderType } from './useOrderType'

interface OrderTypeOption {
  key: string
  orderType: OrderType
  label: string
}

export function OrderTypeSelectionPage() {
  const store = useCurrentStore()
  const setOrderType = useOrderType((state) => state.setOrderType)
  const setSalesChannel = useOrderType((state) => state.setSalesChannel)
  const navigate = useNavigate()

  const options: OrderTypeOption[] = []

  if (store.supportsDineIn) {
    options.push({ key: 'dine_in', orderType: 'dine_in', label: 'Pedir na cafeteria' })
  }

  if (store.supportsPickup && store.supportsDelivery) {
    // Loja aceita os dois: pickup e delivery viram uma escolha só nessa tela.
    // A diferença real (retirar x receber, com endereço) é perguntada no
    // checkout (IdentificationPage), não aqui.
    options.push({ key: 'pickup_delivery', orderType: 'pickup', label: 'Pedir para levar ou entregar' })
  } else if (store.supportsPickup) {
    options.push({ key: 'pickup', orderType: 'pickup', label: 'Pedir para levar' })
  } else if (store.supportsDelivery) {
    options.push({ key: 'delivery', orderType: 'delivery', label: 'Pedir para entregar' })
  }

  const handleSelect = (orderType: OrderType) => {
    setSalesChannel('retail')
    setOrderType(orderType)
    navigate(`/${store.slug}/cardapio`)
  }

  return (
    <PageShell className="flex min-h-dvh flex-col">
      <StoreHero storeName={store.name} title={store.name} height="tall" />
      <div className="flex flex-col gap-3 px-5 py-6">
        <p className="mb-1 text-base text-soft">Como você quer pedir hoje?</p>
        {options.map((option, index) => (
          <button
            key={option.key}
            type="button"
            onClick={() => handleSelect(option.orderType)}
            className={`flex h-16 items-center justify-between rounded-[20px] px-[22px] text-left text-lg font-semibold transition-opacity active:opacity-80 ${
              index === 0 ? 'bg-caramel text-on-caramel' : 'bg-surface-2 text-ink'
            }`}
          >
            {option.label}
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        ))}
        {options.length === 0 && (
          <p className="text-soft">Esta loja não está recebendo pedidos pelo cardápio agora.</p>
        )}
        <Link to={`/${store.slug}/pedidos`} className="self-center py-3 text-[15px] text-ink underline-offset-4 hover:underline">
          Ver meus pedidos
        </Link>
      </div>
      <PoweredBy />
    </PageShell>
  )
}
