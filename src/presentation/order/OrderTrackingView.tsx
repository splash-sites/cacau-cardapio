import { useNavigate } from 'react-router-dom'
import { Check, MessageCircle } from 'lucide-react'
import { currentStepIndex, orderStatusSteps } from '../../domain/order/orderStatusSteps'
import type { OrderStatus } from '../../domain/order/OrderStatus'
import type { OrderType } from '../../domain/order/OrderType'
import { useCart } from '../cart/useCart'
import { formatPrice } from '../menu/formatPrice'
import { useCurrentStore } from '../store/useCurrentStore'
import { PageShell } from '../shared/PageShell'
import { primaryButtonClass } from '../shared/ui'
import { useOrderStatus } from './useOrderStatus'
import { useOrderType } from './useOrderType'

/** O que foi pedido, guardado na hora de confirmar (a sacola é limpa logo depois). */
export interface OrderSummaryLines {
  lines: { label: string; total: number }[]
  total: number
}

interface OrderTrackingViewProps {
  orderId: string
  orderType: OrderType
  tableNumber: string | null
  customerCpf: string
  whatsappUrl?: string | null
  summary?: OrderSummaryLines | null
}

function headline(status: OrderStatus | null | undefined, orderType: OrderType): string {
  switch (status) {
    case 'preparing':
      return 'Seu pedido está sendo preparado'
    case 'out_for_delivery':
      return orderType === 'pickup' ? 'Pronto! Pode retirar no balcão' : 'Seu pedido saiu para entrega'
    case 'delivered':
      return orderType === 'pickup' ? 'Pedido retirado' : 'Pedido entregue'
    case 'finalized':
      return 'Tudo certo. Obrigado!'
    case 'cancelled':
      return 'Pedido cancelado'
    default:
      return 'Pedido enviado!'
  }
}

function context(orderType: OrderType, tableNumber: string | null): string {
  if (orderType === 'dine_in') return tableNumber ? `Mesa ${tableNumber}. A gente leva até você.` : 'Na cafeteria.'
  if (orderType === 'delivery') return 'Entrega no seu endereço.'
  return 'Retirada no balcão.'
}

export function OrderTrackingView({
  orderId,
  orderType,
  tableNumber,
  customerCpf,
  whatsappUrl,
  summary,
}: OrderTrackingViewProps) {
  const store = useCurrentStore()
  const navigate = useNavigate()
  const clearCart = useCart((state) => state.clear)
  const clearTableNumber = useOrderType((state) => state.clearTableNumber)

  const { data: status, isPending, isError } = useOrderStatus(orderId, customerCpf)

  const handleNewOrder = () => {
    // nome/CPF/telefone ficam guardados de propósito pra não repedir a cada
    // pedido: só a mesa (por visita) e a sacola são limpas aqui.
    clearCart()
    clearTableNumber()
    navigate(`/${store.slug}/cardapio`)
  }

  const steps = orderStatusSteps(orderType)
  const stepIndex = status ? currentStepIndex(steps, status) : 0
  const cancelled = status === 'cancelled'

  return (
    <PageShell className="flex min-h-dvh flex-col gap-7 px-5 pt-12 pb-8">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted">{context(orderType, tableNumber)}</span>
        <h1 className={`font-display text-[36px] font-bold leading-[1.05] tracking-tight ${cancelled ? 'text-danger' : ''}`}>
          {headline(status, orderType)}
        </h1>
        {cancelled && <p className="text-soft">Fale com a loja se tiver alguma dúvida.</p>}
      </div>

      {whatsappUrl && !cancelled && (
        <div className="flex flex-col gap-3 rounded-[20px] bg-surface p-4">
          <p className="text-[15px] text-soft">Mande o pedido pelo WhatsApp para combinar a entrega com a loja.</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={primaryButtonClass}>
            <MessageCircle size={18} aria-hidden="true" />
            Abrir WhatsApp
          </a>
        </div>
      )}

      {!cancelled &&
        (isPending ? (
          <p className={`text-sm ${isError ? 'text-danger' : 'text-muted'}`}>
            {isError ? 'Não foi possível carregar o status agora. Tentando de novo…' : 'Carregando status…'}
          </p>
        ) : (
          <ol aria-label="Andamento do pedido" className="flex flex-col">
            {steps.map((step, index) => {
              const done = index < stepIndex || (index === stepIndex && step.status === 'finalized')
              const current = index === stepIndex && !done
              const isLast = index === steps.length - 1
              return (
                <li key={step.status} aria-current={current ? 'step' : undefined} className="flex gap-3.5">
                  <div className="flex flex-col items-center">
                    {done ? (
                      <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-caramel">
                        <Check size={12} strokeWidth={3} className="text-on-caramel" aria-hidden="true" />
                      </span>
                    ) : (
                      <span
                        className={`h-[22px] w-[22px] rounded-full ${current ? 'border-[3px] border-caramel bg-bg' : 'border-2 border-[#3a2822]'}`}
                      />
                    )}
                    {!isLast && (
                      <span className={`min-h-[34px] w-0.5 flex-1 ${index < stepIndex ? 'bg-caramel' : 'bg-[#3a2822]'}`} />
                    )}
                  </div>
                  <span
                    className={`pb-[18px] text-base ${current ? 'font-semibold text-ink' : done ? 'text-ink' : 'text-faint'}`}
                  >
                    {step.label}
                  </span>
                </li>
              )
            })}
          </ol>
        ))}

      {summary && summary.lines.length > 0 && (
        <div className="flex flex-col gap-2 rounded-[20px] bg-surface p-4 text-[15px] tabular-nums">
          {summary.lines.map((line, index) => (
            <div key={index} className="flex justify-between gap-3">
              <span>{line.label}</span>
              <span className="shrink-0">{formatPrice(line.total)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-[#3a2822] pt-2.5 font-semibold">
            <span>Total</span>
            <span>{formatPrice(summary.total)}</span>
          </div>
        </div>
      )}

      <p className="text-[13px] text-muted">Esta tela se atualiza sozinha. O pedido também fica em "Meus pedidos".</p>

      <button
        type="button"
        onClick={handleNewOrder}
        className="mt-auto self-center py-3 text-[15px] text-ink underline-offset-4 hover:underline"
      >
        Fazer outro pedido
      </button>
    </PageShell>
  )
}
