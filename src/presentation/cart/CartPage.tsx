import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { cartLoverTotal, cartTotal, itemUnitLoverPrice, itemUnitPrice } from '../../domain/cart/Cart'
import { orderTypeLabel } from '../../domain/order/orderTypeLabel'
import { useOrderType } from '../order/useOrderType'
import { useCurrentStore } from '../store/useCurrentStore'
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
          className="flex h-11 w-11 min-h-11 shrink-0 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ArrowLeft size={20} aria-hidden="true" />
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
              {items.map((item) => {
                const { id, product, quantity, note, addons, variations } = item
                const unitLover = itemUnitLoverPrice(item)
                const unitRegular = itemUnitPrice(item)
                const variationNames = variations.map((variation) => variation.name)
                const addonNames = addons.map((addon) => addon.name)
                const detailLine = [...variationNames, ...addonNames].join(', ')

                return (
                  <li key={id} className="relative rounded-2xl bg-white p-3 shadow-sm">
                    <button
                      type="button"
                      onClick={() => removeItem(id)}
                      aria-label={`Remover ${product.name} do carrinho`}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center text-foreground/40 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <X size={16} aria-hidden="true" />
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
                        {detailLine && <p className="font-body text-xs text-foreground/60">{detailLine}</p>}
                        <p className="font-body text-sm">
                          <span className="font-medium text-primary">{formatPrice(unitLover)}</span>
                          <span className="text-foreground/40"> | </span>
                          <span className="text-foreground/60">{formatPrice(unitRegular)}</span>
                          <span className="text-foreground/50"> cada</span>
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="flex h-11 items-center gap-3 rounded-full bg-primary/10">
                            <button
                              type="button"
                              onClick={() => decrementItem(id)}
                              aria-label={`Remover um ${product.name}`}
                              className="flex h-11 w-11 items-center justify-center text-lg font-body font-medium text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                            >
                              −
                            </button>
                            <span className="min-w-4 text-center font-body font-medium text-foreground">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => incrementItem(id)}
                              aria-label={`Adicionar mais um ${product.name}`}
                              className="flex h-11 w-11 items-center justify-center text-lg font-body font-medium text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-body font-medium text-primary">{formatPrice(unitLover * quantity)}</p>
                            <p className="font-body text-xs text-foreground/50">{formatPrice(unitRegular * quantity)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={note ?? ''}
                      onChange={(e) => setNote(id, e.target.value)}
                      placeholder="Alguma observação? (ex: sem açúcar)"
                      className="mt-3 h-11 w-full rounded-xl border border-secondary/15 bg-background px-3 font-body text-sm placeholder:text-foreground/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    />
                  </li>
                )
              })}
            </ul>

            <div className="mt-6 flex items-center justify-between font-body">
              <span className="font-medium text-secondary">Total</span>
              <div className="text-right">
                <p className="font-medium text-primary">Cacau Lovers* {formatPrice(cartLoverTotal(items))}</p>
                <p className="text-sm text-foreground/50">{formatPrice(cartTotal(items))}</p>
              </div>
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
