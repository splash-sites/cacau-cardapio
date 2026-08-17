import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { isOrderFromToday } from '../../domain/order/isOrderFromToday'
import { orderSummaryTotal } from '../../domain/order/orderSummaryTotal'
import { recentOrders } from '../../domain/order/recentOrders'
import { orderTypeLabel } from '../../domain/order/orderTypeLabel'
import { isValidCpf } from '../../domain/customer/cpf'
import { useCurrentStore } from '../store/useCurrentStore'
import { useCustomer } from '../customer/useCustomer'
import { formatPrice } from '../menu/formatPrice'
import { PageShell } from '../shared/PageShell'
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
  received: 'bg-amber-100 text-amber-800',
  preparing: 'bg-amber-100 text-amber-800',
  out_for_delivery: 'bg-blue-100 text-blue-800',
  delivered: 'bg-blue-100 text-blue-800',
  finalized: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
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
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-accent">{title}</h3>
        <span className="font-body text-xs text-foreground/50">{formatTime(order.createdAt)}</span>
      </div>
      <ul className="mt-2 font-body text-sm text-foreground/80">
        {order.items.map((item, index) => (
          <li key={index}>
            {item.quantity}× {item.productName}
            {item.note && <span className="text-foreground/50"> — {item.note}</span>}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-secondary/15 pt-3">
        <span className={`rounded-full px-3 py-1 font-body text-xs font-medium ${STATUS_COLOR[order.status]}`}>
          {statusLabel(order)}
        </span>
        <span className="font-body font-medium text-secondary">{formatPrice(orderSummaryTotal(order))}</span>
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
      className="flex flex-col gap-4 px-4 pt-8"
      noValidate
    >
      <p className="font-body text-sm text-foreground/70">Digite seu CPF pra ver seus pedidos.</p>
      <label className="flex flex-col gap-1 font-body text-sm">
        CPF
        <input
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          className="h-11 rounded-md border border-secondary/30 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          {...register('cpf', { validate: (value) => isValidCpf(value) || 'CPF inválido' })}
        />
        {errors.cpf && <span className="text-red-600">{errors.cpf.message}</span>}
      </label>
      <button
        type="submit"
        className="h-11 min-h-11 rounded-md bg-primary font-body font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
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
    <PageShell className="text-foreground">
      <div className="flex items-center gap-2 bg-accent px-4 py-4 text-accent-foreground">
        <button
          type="button"
          onClick={() => navigate(`/${store.slug}/cardapio`)}
          aria-label="Voltar pro cardápio"
          className="flex h-11 w-11 min-h-11 shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <h1 className="font-display text-xl">Meus pedidos</h1>
      </div>

      {!cpf ? (
        <CpfLookupForm onSubmit={setManualCpf} />
      ) : (
        <div className="flex flex-col gap-3 p-4">
          <div className="flex gap-2 rounded-full bg-secondary/10 p-1" role="tablist">
            {(['today', 'history'] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={tab === option}
                onClick={() => setTab(option)}
                className={`h-11 min-h-11 flex-1 rounded-full font-body text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  tab === option ? 'bg-primary text-primary-foreground' : 'text-secondary'
                }`}
              >
                {TAB_LABEL[option]}
              </button>
            ))}
          </div>

          {isPending && (
            <p className={`font-body ${isError ? 'text-red-600' : 'text-foreground/60'}`}>
              {isError
                ? 'Não foi possível carregar seus pedidos agora. Tentando de novo automaticamente…'
                : 'Carregando pedidos…'}
            </p>
          )}
          {visibleOrders && visibleOrders.length === 0 && (
            <p className="font-body text-foreground/60">
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
