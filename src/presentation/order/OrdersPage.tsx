import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { isOrderFromToday } from '../../domain/order/isOrderFromToday'
import { orderSummaryTotal } from '../../domain/order/orderSummaryTotal'
import { recentOrders } from '../../domain/order/recentOrders'
import { orderTypeLabel } from '../../domain/order/orderTypeLabel'
import { isValidCpf } from '../../domain/customer/cpf'
import { useCurrentStore } from '../store/useCurrentStore'
import { useCustomer } from '../customer/useCustomer'
import { formatPrice } from '../menu/formatPrice'
import { PageShell } from '../shared/PageShell'
import { fieldClass, fieldLabelClass, iconButtonClass, primaryButtonClass, stepTitleClass } from '../shared/ui'
import { useOrderHistory } from './useOrderHistory'
import type { OrderSummary } from '../../domain/order/OrderSummary'
import type { OrderStatus } from '../../domain/order/OrderStatus'

const STATUS_LABEL: Record<OrderStatus, string> = {
  received: 'Recebido',
  preparing: 'Em preparo',
  out_for_delivery: 'Saiu pra entrega',
  delivered: 'Entregue',
  finalized: 'Finalizado',
  cancelled: 'Cancelado',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  received: 'bg-chosen text-caramel',
  preparing: 'bg-chosen text-caramel',
  out_for_delivery: 'bg-[#1f2a36] text-info',
  delivered: 'bg-[#1f2a36] text-info',
  finalized: 'bg-[#1d2e24] text-success',
  cancelled: 'bg-[#3a1f1c] text-danger',
}

function statusLabel(order: OrderSummary): string {
  if (order.status === 'out_for_delivery' && order.orderType === 'pickup') return 'Pronto pra retirada'
  if (order.status === 'delivered' && order.orderType === 'pickup') return 'Retirado'
  return STATUS_LABEL[order.status]
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function OrderCard({ order }: { order: OrderSummary }) {
  const title = order.tableNumber ? `Mesa ${order.tableNumber}` : orderTypeLabel(order.orderType)
  return (
    <div className="flex flex-col gap-3 rounded-[20px] bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <h3 className="font-display text-xl font-bold">{title}</h3>
          <span className="text-[13px] text-muted">{formatTime(order.createdAt)}</span>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[order.status]}`}>
          {statusLabel(order)}
        </span>
      </div>
      <ul className="flex flex-col gap-1 text-[15px]">
        {order.items.map((item, index) => (
          <li key={index}>
            {item.quantity}× {item.productName}
            {item.note && <span className="text-muted"> ({item.note})</span>}
          </li>
        ))}
      </ul>
      <div className="flex items-baseline justify-between border-t border-line pt-3 tabular-nums">
        <span className="text-sm text-muted">Total</span>
        <span className="font-semibold">{formatPrice(orderSummaryTotal(order))}</span>
      </div>
    </div>
  )
}

function CpfLookupForm({ onSubmit }: { onSubmit: (cpf: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ cpf: string }>()

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data.cpf))}
      className="flex flex-col gap-4 px-5 pt-2"
      noValidate
    >
      <p className="text-[15px] text-muted">Digite o CPF usado no pedido. A gente não pede senha.</p>
      <label className={fieldLabelClass}>
        CPF
        <input
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          className={fieldClass}
          {...register('cpf', { validate: (value) => isValidCpf(value) || 'CPF inválido' })}
        />
        {errors.cpf && <span className="text-[13px] text-danger">{errors.cpf.message}</span>}
      </label>
      <button type="submit" className={primaryButtonClass}>
        Ver meus pedidos
      </button>
    </form>
  )
}

const HISTORY_LIMIT = 50

type OrdersTab = 'today' | 'history'

const TAB_LABEL: Record<OrdersTab, string> = {
  today: 'Hoje',
  history: 'Histórico',
}

export function OrdersPage() {
  const store = useCurrentStore()
  const navigate = useNavigate()
  const knownCpf = useCustomer((state) => state.customer?.cpf ?? null)
  const [manualCpf, setManualCpf] = useState<string | null>(null)
  const [tab, setTab] = useState<OrdersTab>('today')
  const cpf = knownCpf ?? manualCpf

  const { data: orders, isPending, isError } = useOrderHistory(store.id, cpf)
  const todayOrders = orders?.filter((order) => isOrderFromToday(order.createdAt))
  const historyOrders = orders && recentOrders(orders, HISTORY_LIMIT)
  const visibleOrders = tab === 'today' ? todayOrders : historyOrders

  return (
    <PageShell className="pb-10">
      <div className="px-5 py-4">
        <button type="button" onClick={() => navigate(-1)} aria-label="Voltar" className={iconButtonClass}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
      </div>
      <h1 className={`${stepTitleClass} px-5 pb-4`}>Meus pedidos</h1>

      {!cpf ? (
        <CpfLookupForm onSubmit={setManualCpf} />
      ) : (
        <div className="flex flex-col gap-3 px-5">
          <div className="flex gap-1 rounded-[16px] bg-surface-2 p-1" role="tablist">
            {(['today', 'history'] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={tab === option}
                onClick={() => setTab(option)}
                className={`h-11 flex-1 rounded-[12px] text-[15px] font-semibold transition-colors ${
                  tab === option ? 'bg-caramel text-on-caramel' : 'text-muted'
                }`}
              >
                {TAB_LABEL[option]}
              </button>
            ))}
          </div>

          {isPending && (
            <p className={isError ? 'text-danger' : 'text-muted'}>
              {isError
                ? 'Não foi possível carregar seus pedidos agora. Tentando de novo automaticamente…'
                : 'Carregando pedidos…'}
            </p>
          )}
          {visibleOrders && visibleOrders.length === 0 && (
            <p className="py-4 text-muted">
              {tab === 'today' ? 'Nenhum pedido feito hoje.' : 'Nenhum pedido encontrado com esse CPF.'}
            </p>
          )}
          {visibleOrders?.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </PageShell>
  )
}
