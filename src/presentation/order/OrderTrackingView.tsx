import { useNavigate } from 'react-router-dom'
import { Check, MessageCircle, X } from 'lucide-react'
import { currentStepIndex, orderStatusSteps } from '../../domain/order/orderStatusSteps'
import type { OrderType } from '../../domain/order/OrderType'
import { useCart } from '../cart/useCart'
import { useCurrentStore } from '../store/useCurrentStore'
import { PageShell } from '../shared/PageShell'
import { useOrderStatus } from './useOrderStatus'
import { useOrderType } from './useOrderType'

interface OrderTrackingViewProps {
  orderId: string
  orderType: OrderType
  tableNumber: string | null
  customerCpf: string
  whatsappUrl?: string | null
}

export function OrderTrackingView({ orderId, orderType, tableNumber, customerCpf, whatsappUrl }: OrderTrackingViewProps) {
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
            <X size={32} strokeWidth={2.5} className="text-red-600" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl text-accent">Pedido cancelado</h1>
          <p className="font-body text-foreground/60">Fale com a loja se tiver dúvidas.</p>
        </>
      ) : (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent">
            <Check size={32} strokeWidth={3} className="text-background" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-accent">Pedido enviado!</h1>
            <p className="mt-1 font-body text-foreground/60">
              {orderType === 'dine_in' && tableNumber && <>Aguarde, sua mesa é a nº {tableNumber}.<br /></>}
              Vamos preparar tudo com carinho.
            </p>
          </div>

          {whatsappUrl && (
            <div className="w-full rounded-2xl bg-primary/10 p-4">
              <p className="font-body text-sm text-accent">Finalize o pedido no WhatsApp pra combinar a entrega.</p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex h-11 min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary font-body font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                <MessageCircle size={18} aria-hidden="true" />
                Abrir WhatsApp
              </a>
            </div>
          )}

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
