import { Navigate, useNavigate } from 'react-router-dom'
import { cartTotal } from '../../domain/cart/Cart'
import { orderTypeLabel } from '../../domain/order/orderTypeLabel'
import { useOrderType } from '../order/useOrderType'
import { useCurrentStore } from '../store/StoreContext'
import { useCustomer } from '../customer/useCustomer'
import { formatPrice } from '../menu/formatPrice'
import { PageShell } from '../shared/PageShell'
import { useCart } from './useCart'

export function CartPage() {
  const store = useCurrentStore()
  const orderType = useOrderType((state) => state.orderType)
  const customer = useCustomer((state) => state.customer)
  const items = useCart((state) => state.items)
  const incrementItem = useCart((state) => state.incrementItem)
  const decrementItem = useCart((state) => state.decrementItem)
  const removeItem = useCart((state) => state.removeItem)
  const setNote = useCart((state) => state.setNote)
  const navigate = useNavigate()

  if (!orderType) return <Navigate to={`/${store.slug}`} replace />

  // pickup com cliente já conhecido não precisa de nenhum dado extra (sem mesa,
  // sem endereço) — pula identificação direto pra revisão.
  const nextStep = customer && orderType === 'pickup' ? 'revisao' : 'identificacao'

  return (
    <PageShell className="text-foreground">
      <div className="flex items-center gap-2 bg-accent px-4 py-4 text-background">
        <button
          type="button"
          onClick={() => navigate(`/${store.slug}/cardapio`)}
          aria-label="Voltar pro cardápio"
          className="flex h-11 w-11 min-h-11 shrink-0 items-center justify-center font-display text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          ←
        </button>
        <h1 className="font-display text-xl">Seu pedido</h1>
      </div>

      <div className="px-4 py-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-12 text-center">
            <p className="font-body text-foreground/70">Seu carrinho está vazio.</p>
            <button
              type="button"
              onClick={() => navigate(`/${store.slug}/cardapio`)}
              className="flex h-11 min-h-11 items-center rounded-full bg-primary px-4 font-body font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Ver cardápio {orderTypeLabel(orderType)}
            </button>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {items.map(({ product, quantity, note }) => (
                <li key={product.id} className="relative rounded-2xl bg-white p-3 shadow-sm">
                  <button
                    type="button"
                    onClick={() => removeItem(product.id)}
                    aria-label={`Remover ${product.name} do carrinho`}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center text-foreground/40 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex gap-3 pr-8">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary/10">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt=""
                          loading="lazy"
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="font-body font-medium text-foreground">{product.name}</p>
                      <p className="font-body text-sm text-foreground/70">{formatPrice(product.price)} cada</p>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex h-11 items-center gap-3 rounded-full bg-primary/10">
                          <button
                            type="button"
                            onClick={() => decrementItem(product.id)}
                            aria-label={`Remover um ${product.name}`}
                            className="flex h-11 w-11 items-center justify-center text-lg font-body font-medium text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                          >
                            −
                          </button>
                          <span className="min-w-4 text-center font-body font-medium text-foreground">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => incrementItem(product.id)}
                            aria-label={`Adicionar mais um ${product.name}`}
                            className="flex h-11 w-11 items-center justify-center text-lg font-body font-medium text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-body font-medium text-secondary">{formatPrice(product.price * quantity)}</p>
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={note ?? ''}
                    onChange={(e) => setNote(product.id, e.target.value)}
                    placeholder="Alguma observação? (ex: sem açúcar)"
                    className="mt-3 h-11 w-full rounded-xl border border-secondary/15 bg-background px-3 font-body text-sm placeholder:text-foreground/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  />
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between font-body font-medium text-secondary">
              <span>Total</span>
              <span>{formatPrice(cartTotal(items))}</span>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/${store.slug}/${nextStep}`)}
              className="mt-4 h-11 min-h-11 w-full rounded-full bg-primary font-body font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Continuar
            </button>
          </>
        )}
      </div>
    </PageShell>
  )
}
