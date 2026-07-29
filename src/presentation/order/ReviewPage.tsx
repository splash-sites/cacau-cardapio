import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { confirmOrder } from '../../application/order/confirmOrder'
import { cartLoverTotal, cartTotal, itemUnitLoverPrice, itemUnitPrice } from '../../domain/cart/Cart'
import { orderTypeLabel } from '../../domain/order/orderTypeLabel'
import { useCart } from '../cart/useCart'
import { useCustomer } from '../customer/useCustomer'
import { formatPrice } from '../menu/formatPrice'
import { supabaseOrderRepository } from '../../infrastructure/order/SupabaseOrderRepository'
import { useCurrentStore } from '../store/useCurrentStore'
import { PageShell } from '../shared/PageShell'
import { OrderTrackingView } from './OrderTrackingView'
import { useOrderType } from './useOrderType'
import { buildWhatsappOrderMessage, buildWhatsappUrl } from './whatsappOrderMessage'

export function ReviewPage() {
  const store = useCurrentStore()
  const orderType = useOrderType((state) => state.orderType)
  const tableNumber = useOrderType((state) => state.tableNumber)
  const items = useCart((state) => state.items)
  const clearCart = useCart((state) => state.clear)
  const customer = useCustomer((state) => state.customer)
  const navigate = useNavigate()

  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!orderType) return <Navigate to={`/${store.slug}`} replace />
  if (!customer) return <Navigate to={`/${store.slug}/identificacao`} replace />

  if (orderId) {
    return (
      <OrderTrackingView
        orderId={orderId}
        orderType={orderType}
        tableNumber={tableNumber}
        customerCpf={customer.cpf}
        whatsappUrl={whatsappUrl}
      />
    )
  }

  if (items.length === 0) return <Navigate to={`/${store.slug}/cardapio`} replace />

  const handleConfirm = async () => {
    setStatus('submitting')
    try {
      const result = await confirmOrder(supabaseOrderRepository, {
        storeId: store.id,
        orderType,
        customer,
        items,
        tableNumber,
      })
      // Precisa montar a mensagem antes do clearCart — depois disso os itens somem do estado.
      if (orderType === 'delivery' && store.whatsappNumber) {
        const message = buildWhatsappOrderMessage(store.name, customer, items)
        setWhatsappUrl(buildWhatsappUrl(store.whatsappNumber, message))
      }
      clearCart()
      setOrderId(result.id)
    } catch (err) {
      console.error('confirmOrder falhou:', err)
      setErrorMessage(err instanceof Error ? err.message : JSON.stringify(err))
      setStatus('error')
    }
  }

  return (
    <PageShell className="flex flex-col gap-6 px-4 py-8 text-foreground">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(`/${store.slug}/identificacao`)}
          aria-label="Voltar"
          className="flex h-11 w-11 min-h-11 shrink-0 items-center justify-center text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
        <h1 className="font-display text-2xl text-accent">Revisar pedido</h1>
      </div>

      <section>
        <h2 className="mb-2 font-display text-lg text-accent">
          {orderTypeLabel(orderType)}
          {orderType === 'dine_in' && tableNumber ? ` · Mesa ${tableNumber}` : ''}
        </h2>
        <ul>
          {items.map((item) => {
            const { id, product, quantity, addons, variations } = item
            const unitLover = itemUnitLoverPrice(item)
            const unitRegular = itemUnitPrice(item)
            const detailLine = [...variations.map((v) => v.name), ...addons.map((a) => a.name)].join(', ')

            return (
              <li key={id} className="flex justify-between border-b border-secondary/15 py-2 font-body">
                <div>
                  <span>{quantity}× {product.name}</span>
                  {detailLine && <p className="font-body text-xs text-foreground/60">{detailLine}</p>}
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">{formatPrice(unitLover * quantity)}</p>
                  <p className="text-xs text-foreground/50">{formatPrice(unitRegular * quantity)}</p>
                </div>
              </li>
            )
          })}
        </ul>
        <div className="flex justify-between pt-2 font-body">
          <span className="font-medium text-secondary">Total</span>
          <div className="text-right">
            <p className="font-medium text-primary">Cacau Lovers* {formatPrice(cartLoverTotal(items))}</p>
            <p className="text-sm text-foreground/50">{formatPrice(cartTotal(items))}</p>
          </div>
        </div>
      </section>

      <section className="font-body">
        <h2 className="mb-2 font-display text-lg text-accent">Seus dados</h2>
        <p>{customer.fullName}</p>
        <p>{customer.phone}</p>
        {customer.address && (
          <p>
            {customer.address.street}, {customer.address.number}
            {customer.address.complement ? ` - ${customer.address.complement}` : ''} — {customer.address.neighborhood},{' '}
            {customer.address.city}/{customer.address.state}
          </p>
        )}
      </section>

      {status === 'error' && (
        <p className="font-body text-red-600">
          Não foi possível confirmar seu pedido. {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={status === 'submitting'}
        className="h-11 min-h-11 rounded-md bg-primary font-body font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60"
      >
        {status === 'submitting' ? 'Confirmando…' : 'Confirmar pedido'}
      </button>
    </PageShell>
  )
}
