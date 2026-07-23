import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { orderSummaryTotal } from '../../domain/order/orderSummaryTotal'
import { orderTypeLabel } from '../../domain/order/orderTypeLabel'
import { isValidCpf } from '../../domain/customer/cpf'
import { useCurrentStore } from '../store/StoreContext'
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
  finalized: 'Entregue',
  cancelled: 'Cancelado',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  received: 'bg-amber-100 text-amber-800',
  preparing: 'bg-amber-100 text-amber-800',
  out_for_delivery: 'bg-blue-100 text-blue-800',
  finalized: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

function statusLabel(order: OrderSummary): string {
  if (order.status === 'out_for_delivery' && order.orderType === 'pickup') return 'Pronto pra retirada'
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
          className="h-11 rounded-md border border-secondary/30 px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          {...register('cpf', { validate: (value) => isValidCpf(value) || 'CPF inválido' })}
        />
        {errors.cpf && <span className="text-red-600">{errors.cpf.message}</span>}
      </label>
      <button
        type="submit"
        className="h-11 min-h-11 rounded-md bg-primary font-body font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        Ver meus pedidos
      </button>
    </form>
  )
}

export function OrdersPage() {
  const store = useCurrentStore()
  const navigate = useNavigate()
  const knownCpf = useCustomer((state) => state.customer?.cpf ?? null)
  const [manualCpf, setManualCpf] = useState<string | null>(null)
  const cpf = knownCpf ?? manualCpf

  const { data: orders, isLoading } = useOrderHistory(store.id, cpf)

  return (
    <PageShell className="text-foreground">
      <div className="flex items-center gap-2 bg-accent px-4 py-4 text-accent-foreground">
        <button
          type="button"
          onClick={() => navigate(`/${store.slug}/cardapio`)}
          aria-label="Voltar pro cardápio"
          className="flex h-11 w-11 min-h-11 shrink-0 items-center justify-center font-display text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          ←
        </button>
        <h1 className="font-display text-xl">Meus pedidos</h1>
      </div>

      {!cpf ? (
        <CpfLookupForm onSubmit={setManualCpf} />
      ) : (
        <div className="flex flex-col gap-3 p-4">
          {isLoading && <p className="font-body text-foreground/60">Carregando pedidos…</p>}
          {orders && orders.length === 0 && (
            <p className="font-body text-foreground/60">Nenhum pedido encontrado com esse CPF.</p>
          )}
          {orders?.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </PageShell>
  )
}
