import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coffee, ShoppingBag } from 'lucide-react'
import type { OrderType } from '../../domain/order/OrderType'
import { useCurrentStore } from '../store/useCurrentStore'
import { PageShell } from '../shared/PageShell'
import { useOrderType } from './useOrderType'

interface OrderTypeOption {
  key: string
  orderType: OrderType
  label: string
  description: string
  icon: ReactElement
}

export function OrderTypeSelectionPage() {
  const store = useCurrentStore()
  const setOrderType = useOrderType((state) => state.setOrderType)
  const navigate = useNavigate()

  const options: OrderTypeOption[] = []

  if (store.supportsDineIn) {
    options.push({
      key: 'dine_in',
      orderType: 'dine_in',
      label: 'Cafeteria',
      description: 'Vou consumir no local',
      icon: <Coffee size={20} aria-hidden="true" />,
    })
  }

  if (store.supportsPickup || store.supportsDelivery) {
    // pickup e delivery viraram uma escolha só nessa tela — a diferença real
    // (retirar x receber, com endereço) é perguntada no checkout
    // (IdentificationPage). orderType aqui é só o catálogo usado durante a
    // navegação (available_pickup); se a loja não aceitar pickup, usa
    // available_delivery e o checkout nem pergunta de novo (só um modo possível).
    options.push({
      key: 'pickup_delivery',
      orderType: store.supportsPickup ? 'pickup' : 'delivery',
      label: 'Para Levar/Entrega',
      description: 'Retire no balcão ou receba no seu endereço',
      icon: <ShoppingBag size={20} aria-hidden="true" />,
    })
  }

  const handleSelect = (orderType: OrderType) => {
    setOrderType(orderType)
    navigate(`/${store.slug}/cardapio`)
  }

  return (
    <PageShell className="flex flex-col justify-center gap-8 px-4 text-foreground">
      <div className="text-center">
        <h1 className="font-display text-3xl text-accent">{store.name}</h1>
        <p className="mt-1 font-body text-sm text-foreground/60">Como você quer pedir hoje?</p>
      </div>
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => handleSelect(option.orderType)}
            className="flex min-h-11 items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-accent">
              {option.icon}
            </span>
            <span className="flex flex-col">
              <span className="font-display text-lg text-accent">{option.label}</span>
              <span className="font-body text-sm text-foreground/60">{option.description}</span>
            </span>
          </button>
        ))}
      </div>
    </PageShell>
  )
}
