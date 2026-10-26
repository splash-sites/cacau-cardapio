import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { confirmOrder } from '../../application/order/confirmOrder'
import { cartLoverTotal, cartTotal, itemUnitPrice } from '../../domain/cart/Cart'
import { formatCpf } from '../../domain/customer/cpf'
import { maskPhone } from '../../domain/customer/phone'
import { groupCartItems } from '../../domain/cart/groupCartItems'
import { isStockError, stockErrorMessage } from '../../domain/order/stockError'
import { useCart } from '../cart/useCart'
import { useCustomer } from '../customer/useCustomer'
import { formatPrice } from '../menu/formatPrice'
import { supabaseProductRepository } from '../../infrastructure/menu/SupabaseProductRepository'
import { supabaseOrderRepository } from '../../infrastructure/order/SupabaseOrderRepository'
import { useCurrentStore } from '../store/useCurrentStore'
import { CheckoutHeader } from '../shared/CheckoutHeader'
import { PageShell } from '../shared/PageShell'
import { primaryButtonClass, stepTitleClass } from '../shared/ui'
import { OrderTrackingView, type OrderSummaryLines } from './OrderTrackingView'
import { useOrderType } from './useOrderType'
import { buildWhatsappOrderMessage, buildWhatsappUrl } from './whatsappOrderMessage'

// PostgrestError (erro real que confirm_order lança) não é instanceof Error —
// é um objeto plano { message, code, details, hint }. Sem tratar esse caso à
// parte, o catch caía num JSON.stringify(err) e mostrava o JSON cru pro
// cliente (ex: {"code":"P0001","message":"..."})  em vez da mensagem.
function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') return err.message
  return 'Tente novamente em instantes.'
}

export function ReviewPage() {
  const store = useCurrentStore()
  const orderType = useOrderType((state) => state.orderType)
  const tableNumber = useOrderType((state) => state.tableNumber)
  const salesChannel = useOrderType((state) => state.salesChannel)
  const items = useCart((state) => state.items)
  const clearCart = useCart((state) => state.clear)
  const refreshStock = useCart((state) => state.refreshStock)
  const queryClient = useQueryClient()
  const customer = useCustomer((state) => state.customer)
  const navigate = useNavigate()

  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [stockRefreshed, setStockRefreshed] = useState(false)
  const [summary, setSummary] = useState<OrderSummaryLines | null>(null)

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
        summary={summary}
      />
    )
  }

  // Depois de um erro de estoque o carrinho pode ter esvaziado — fica na tela pra mostrar o motivo.
  if (items.length === 0 && status !== 'error') return <Navigate to={`/${store.slug}/cardapio`} replace />

  const handleConfirm = async () => {
    setStatus('submitting')
    try {
      const result = await confirmOrder(supabaseOrderRepository, {
        storeId: store.id,
        orderType,
        customer,
        items,
        tableNumber,
        salesChannel,
      })
      // Precisa montar a mensagem antes do clearCart — depois disso os itens somem do estado.
      if (orderType === 'delivery' && store.whatsappNumber) {
        const message = buildWhatsappOrderMessage(store.name, customer, items)
        setWhatsappUrl(buildWhatsappUrl(store.whatsappNumber, message))
      }
      // Resumo guardado antes de limpar a sacola: o acompanhamento mostra o que foi pedido.
      setSummary({
        lines: items.map((item) => ({
          label: `${item.quantity}× ${item.product.name}`,
          total: itemUnitPrice(item) * item.quantity,
        })),
        total: cartTotal(items),
      })
      clearCart()
      setOrderId(result.id)
    } catch (err) {
      console.error('confirmOrder falhou:', err)
      const message = extractErrorMessage(err)
      const stockError = isStockError(message)
      setErrorMessage(stockError ? stockErrorMessage(message) : message)
      setStockRefreshed(false)
      // Saldo acabou entre o carrinho e a confirmação: recarrega o saldo e ajusta o carrinho.
      if (stockError) await refreshCartWithFreshStock()
      setStatus('error')
    }
  }

  const refreshCartWithFreshStock = async () => {
    try {
      const fresh = await supabaseProductRepository.listProducts(store.id, salesChannel)
      refreshStock(fresh, salesChannel)
      await queryClient.invalidateQueries({ queryKey: ['menu', store.id] })
      setStockRefreshed(true)
    } catch (refreshErr) {
      console.error('refresh de estoque falhou:', refreshErr)
    }
  }

  const regular = cartTotal(items)
  const lover = cartLoverTotal(items)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const fulfillment =
    orderType === 'dine_in'
      ? `Na cafeteria${tableNumber ? `, mesa ${tableNumber}` : ''}`
      : orderType === 'delivery'
        ? 'Entrega no seu endereço'
        : 'Retirada no balcão'
  const paymentNote =
    orderType === 'dine_in'
      ? 'Pagamento no caixa.'
      : orderType === 'delivery'
        ? 'Pagamento via pix no WhatsApp da loja.'
        : 'Pagamento na retirada, direto no balcão.'
  const canSwitchFulfillment =
    orderType !== 'dine_in' && salesChannel === 'retail' && store.supportsPickup && store.supportsDelivery

  return (
    <PageShell>
      <CheckoutHeader
        current="Confirmar"
        onBack={() => navigate(`/${store.slug}/identificacao`)}
        backLabel="Voltar para seus dados"
      />

      <div className="flex flex-col gap-4 px-5 pb-48">
        <h1 className={stepTitleClass}>Tudo certo?</h1>

        <section className="flex flex-col gap-1 rounded-[20px] bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[17px] font-semibold">{fulfillment}</h2>
            {canSwitchFulfillment && (
              <button
                type="button"
                onClick={() => navigate(`/${store.slug}/identificacao`)}
                className="text-sm font-semibold text-caramel"
              >
                Alterar
              </button>
            )}
          </div>
          {customer.address && orderType === 'delivery' && (
            <span className="text-sm text-muted">
              {customer.address.street}, {customer.address.number}
              {customer.address.complement ? ` - ${customer.address.complement}` : ''}, {customer.address.neighborhood},{' '}
              {customer.address.city}/{customer.address.state}
            </span>
          )}
        </section>

        <section className="flex flex-col gap-1 rounded-[20px] bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[17px] font-semibold">{customer.fullName}</span>
            <button
              type="button"
              onClick={() => navigate(`/${store.slug}/identificacao`)}
              className="text-sm font-semibold text-caramel"
            >
              Alterar
            </button>
          </div>
          <span className="text-sm text-muted">
            CPF {formatCpf(customer.cpf)}
            {customer.phone && `, ${maskPhone(customer.phone)}`}
          </span>
        </section>

        <section className="flex flex-col gap-2.5 rounded-[20px] bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[17px] font-semibold">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </span>
            <button
              type="button"
              onClick={() => navigate(`/${store.slug}/carrinho`)}
              className="text-sm font-semibold text-caramel"
            >
              Alterar
            </button>
          </div>
          <ul className="flex flex-col gap-2 text-[15px] tabular-nums">
            {groupCartItems(items).map((group) => {
              if (group.type === 'combo') {
                const comboTotal = group.items.reduce((sum, item) => sum + itemUnitPrice(item) * item.quantity, 0)
                return (
                  <li key={group.comboGroupId} className="flex flex-col gap-1">
                    <span className="w-fit rounded-full bg-chosen px-2 py-0.5 text-xs font-semibold text-caramel">Combo</span>
                    <div className="flex justify-between gap-3">
                      <span>{group.items.map((item) => `${item.quantity}× ${item.product.name}`).join(' + ')}</span>
                      <span className="shrink-0">{formatPrice(comboTotal).replace('R$', '').trim()}</span>
                    </div>
                  </li>
                )
              }
              const { id, product, quantity, addons, variations } = group.item
              const detailLine = [...variations.map((v) => v.name), ...addons.map((a) => a.name)].join(', ')
              return (
                <li key={id} className="flex justify-between gap-3">
                  <span>
                    {quantity}× {product.name}
                    {detailLine && <span className="text-muted"> {detailLine}</span>}
                  </span>
                  <span className="shrink-0">{formatPrice(itemUnitPrice(group.item) * quantity).replace('R$', '').trim()}</span>
                </li>
              )
            })}
          </ul>
        </section>

        <p className="text-sm text-muted">{paymentNote}</p>

        {status === 'error' && (
          <div role="alert" className="flex flex-col gap-2 rounded-[20px] bg-[#3a1f1c] p-4 text-[15px] text-danger">
            <p>Não foi possível confirmar seu pedido. {errorMessage}</p>
            {stockRefreshed && (
              <>
                <p className="text-ink">Atualizamos sua sacola com o estoque disponível agora. Confira as quantidades.</p>
                <button
                  type="button"
                  onClick={() => navigate(`/${store.slug}/carrinho`)}
                  className="mt-1 self-start text-[15px] font-semibold text-caramel"
                >
                  Revisar sacola
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 flex justify-center">
        <div className="flex w-full max-w-[430px] flex-col gap-2.5 rounded-t-3xl bg-surface px-5 pt-3.5 pb-[max(20px,env(safe-area-inset-bottom))]">
          <div className="flex items-baseline justify-between tabular-nums">
            <span className="text-[15px] text-muted">Total</span>
            <span className="text-lg font-semibold">
              {formatPrice(regular)}
              {lover < regular && (
                <span className="text-sm font-medium text-caramel"> Lover {formatPrice(lover).replace('R$', '').trim()}</span>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={status === 'submitting' || items.length === 0}
            className={primaryButtonClass}
          >
            {status === 'submitting' ? 'Confirmando…' : 'Confirmar pedido'}
          </button>
        </div>
      </div>
    </PageShell>
  )
}
