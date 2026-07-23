import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderTypeLabel } from '../../domain/order/orderTypeLabel'
import type { OrderType } from '../../domain/order/OrderType'
import { useCurrentStore } from '../store/StoreContext'
import { PageShell } from '../shared/PageShell'
import { useOrderType } from './useOrderType'

const OPTIONS: { type: OrderType; description: string }[] = [
  { type: 'dine_in', description: 'Vou consumir no local' },
  { type: 'pickup', description: 'Vou retirar no balcão' },
  { type: 'delivery', description: 'Quero receber no meu endereço' },
]

const ICONS: Record<OrderType, ReactElement> = {
  dine_in: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h14v5a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Z" />
      <path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17" />
      <path d="M7 2v3M11 2v3" />
    </svg>
  ),
  pickup: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h16l-1 12H5L4 8Z" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
    </svg>
  ),
  delivery: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 7h11v9H2z" />
      <path d="M13 10h4l3 3v3h-7z" />
      <circle cx="6.5" cy="18.5" r="1.5" />
      <circle cx="16.5" cy="18.5" r="1.5" />
    </svg>
  ),
}

export function OrderTypeSelectionPage() {
  const store = useCurrentStore()
  const setOrderType = useOrderType((state) => state.setOrderType)
  const navigate = useNavigate()

  const availableOptions = OPTIONS.filter((option) => {
    if (option.type === 'dine_in') return store.supportsDineIn
    if (option.type === 'pickup') return store.supportsPickup
    return store.supportsDelivery
  })

  const handleSelect = (type: OrderType) => {
    setOrderType(type)
    navigate(`/${store.slug}/cardapio`)
  }

  return (
    <PageShell className="flex flex-col justify-center gap-8 px-4 text-foreground">
      <div className="text-center">
        <h1 className="font-display text-3xl text-accent">{store.name}</h1>
        <p className="mt-1 font-body text-sm text-foreground/60">Como você quer pedir hoje?</p>
      </div>
      <div className="flex flex-col gap-3">
        {availableOptions.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => handleSelect(option.type)}
            className="flex min-h-11 items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-accent">
              {ICONS[option.type]}
            </span>
            <span className="flex flex-col">
              <span className="font-display text-lg text-accent">{orderTypeLabel(option.type)}</span>
              <span className="font-body text-sm text-foreground/60">{option.description}</span>
            </span>
          </button>
        ))}
      </div>
    </PageShell>
  )
}
