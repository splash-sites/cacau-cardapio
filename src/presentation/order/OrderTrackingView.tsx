import { useNavigate } from 'react-router-dom'
import { currentStepIndex, orderStatusSteps } from '../../domain/order/orderStatusSteps'
import type { OrderType } from '../../domain/order/OrderType'
import { useCart } from '../cart/useCart'
import { useCurrentStore } from '../store/StoreContext'
import { PageShell } from '../shared/PageShell'
import { useOrderStatus } from './useOrderStatus'
import { useOrderType } from './useOrderType'

interface OrderTrackingViewProps {
  orderId: string
  orderType: OrderType
  tableNumber: string | null
  customerCpf: string
}

export function OrderTrackingView({ orderId, orderType, tableNumber, customerCpf }: OrderTrackingViewProps) {
  const store = useCurrentStore()
  const navigate = useNavigate()
  const clearCart = useCart((state) => state.clear)
  const clearTableNumber = useOrderType((state) => state.clearTableNumber)

  const { data: status, isLoading } = useOrderStatus(orderId, customerCpf)

  const handleNewOrder = () => {
    // nome/CPF/telefone ficam guardados de propósito pra não repedir a cada
    // pedido — só a mesa (por visita) e o carrinho são limpos aqui.
    clearCart()
    clearTableNumber()
    navigate(`/${store.slug}/cardapio`)
  }

  const steps = orderStatusSteps(orderType)
  const stepIndex = status ? currentStepIndex(steps, status) : -1

  return (
    <PageShell className="flex flex-col items-center justify-center gap-6 px-4 text-center text-foreground">
      {status === 'cancelled' ? (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-red-600" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </div>
          <h1 className="font-display text-2xl text-accent">Pedido cancelado</h1>
          <p className="font-body text-foreground/60">Fale com a loja se tiver dúvidas.</p>
        </>
      ) : (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-background" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl text-accent">Pedido enviado!</h1>
            <p className="mt-1 font-body text-foreground/60">
              {orderType === 'dine_in' && tableNumber && <>Aguarde, sua mesa é a nº {tableNumber}.<br /></>}
              Vamos preparar tudo com carinho.
            </p>
          </div>

          {isLoading ? (
            <p className="font-body text-sm text-foreground/60">Carregando status…</p>
          ) : (
            <div className="w-full">
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
                {steps.map((step, index) => (
                  <div
                    key={step.status}
                    className={`h-1.5 rounded-full ${index <= stepIndex ? 'bg-accent' : 'bg-accent/15'}`}
                  />
                ))}
              </div>
              <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
                {steps.map((step, index) => (
                  <span
                    key={step.status}
                    className={`font-body text-xs ${index <= stepIndex ? 'font-medium text-accent' : 'text-foreground/40'}`}
                  >
                    {step.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <button
        type="button"
        onClick={handleNewOrder}
        className="h-11 min-h-11 rounded-md bg-primary px-6 font-body font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        Fazer novo pedido
      </button>
    </PageShell>
  )
}
