import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { cartLoverTotal, cartTotal, itemUnitLoverPrice, itemUnitPrice } from '../../domain/cart/Cart'
import type { CartItem } from '../../domain/cart/CartItem'
import { groupCartItems } from '../../domain/cart/groupCartItems'
import { browsingOrderTypeLabel } from '../../domain/order/orderTypeLabel'
import { useOrderType } from '../order/useOrderType'
import { useCurrentStore } from '../store/useCurrentStore'
import { useCustomer } from '../customer/useCustomer'
import { formatPrice } from '../menu/formatPrice'
import { PageShell } from '../shared/PageShell'
import { resizedImageUrl } from '../shared/resizedImageUrl'
import { useCart } from './useCart'

export function CartPage() {
  const store = useCurrentStore()
  const orderType = useOrderType((state) => state.orderType)
  const customer = useCustomer((state) => state.customer)
  const items = useCart((state) => state.items)
  const incrementItem = useCart((state) => state.incrementItem)
  const decrementItem = useCart((state) => state.decrementItem)
  const removeItem = useCart((state) => state.removeItem)
  const removeComboGroup = useCart((state) => state.removeComboGroup)
  const setNote = useCart((state) => state.setNote)
  const navigate = useNavigate()

  if (!orderType) return <Navigate to={`/${store.slug}`} replace />

  // Só pula identificação com cliente já conhecido quando NADA mais precisa ser
  // perguntado: sem mesa (dine_in) e sem chance de escolher entrega (loja sem
  // pickup+delivery juntos — se tivesse os dois, precisa passar pelo toggle
  // retirar/receber em IdentificationPage, mesmo com o cliente já identificado).
  const nothingElseToAsk = orderType === 'pickup' && store.supportsPickup && !store.supportsDelivery
  const nextStep = customer && nothingElseToAsk ? 'revisao' : 'identificacao'

  return (
    <PageShell className="text-foreground">
      <div className="flex items-center gap-2 bg-accent px-4 py-4 text-background">
        <button
          type="button"
          onClick={() => navigate(`/${store.slug}/cardapio`)}
          aria-label="Voltar pro cardápio"
          className="flex h-11 w-11 min-h-11 shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
              className="flex h-11 min-h-11 items-center rounded-full bg-primary px-4 font-body font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Ver cardápio {browsingOrderTypeLabel(orderType, store)}
            </button>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {groupCartItems(items).map((group) => {
                if (group.type === 'combo') {
                  return (
                    <ComboGroupCard
                      key={group.comboGroupId}
                      items={group.items}
                      onRemove={() => removeComboGroup(group.comboGroupId)}
                    />
                  )
                }

                const { id, product, quantity, note, addons, variations } = group.item
                const unitLover = itemUnitLoverPrice(group.item)
                const unitRegular = itemUnitPrice(group.item)
                const variationNames = variations.map((variation) => variation.name)
                const addonNames = addons.map((addon) => addon.name)
                const detailLine = [...variationNames, ...addonNames].join(', ')

                return (
                  <li key={id} className="relative rounded-2xl bg-white p-3 shadow-sm">
                    <button
                      type="button"
                      onClick={() => removeItem(id)}
                      aria-label={`Remover ${product.name} do carrinho`}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center text-foreground/40 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                    <div className="flex gap-3 pr-8">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary/10">
                        {product.imageUrl && (
                          <img
                            src={resizedImageUrl(product.imageUrl, 64, 64) ?? undefined}
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
                              className="flex h-11 w-11 items-center justify-center text-lg font-body font-medium text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            >
                              −
                            </button>
                            <span className="min-w-4 text-center font-body font-medium text-foreground">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => incrementItem(id)}
                              aria-label={`Adicionar mais um ${product.name}`}
                              className="flex h-11 w-11 items-center justify-center text-lg font-body font-medium text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                      className="mt-3 h-11 w-full rounded-xl border border-secondary/15 bg-background px-3 font-body text-sm placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
              className="mt-4 h-11 min-h-11 w-full rounded-full bg-primary font-body font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Continuar
            </button>
          </>
        )}
      </div>
    </PageShell>
  )
}

// Combo é atômico: sem +/- de quantidade nem remoção por linha — só o grupo
// inteiro (mesma decisão de produto do PromotionDetailModal).
function ComboGroupCard({ items, onRemove }: { items: CartItem[]; onRemove: () => void }) {
  const loverTotal = items.reduce((sum, item) => sum + itemUnitLoverPrice(item) * item.quantity, 0)
  const regularTotal = items.reduce((sum, item) => sum + itemUnitPrice(item) * item.quantity, 0)

  return (
    <li className="relative rounded-2xl bg-white p-3 shadow-sm">
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remover combo do carrinho"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center text-foreground/40 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <X size={16} aria-hidden="true" />
      </button>
      <p className="pr-8 font-body text-xs font-bold uppercase tracking-wide text-secondary">Combo</p>
      <ul className="mt-2 flex flex-col gap-1">
        {items.map((item) => {
          const detailLine = [...item.variations.map((variation) => variation.name), ...item.addons.map((addon) => addon.name)].join(', ')
          return (
            <li key={item.id} className="font-body text-sm text-foreground">
              {item.quantity}× {item.product.name}
              {detailLine && <span className="text-foreground/50"> ({detailLine})</span>}
            </li>
          )
        })}
      </ul>
      <div className="mt-2 flex items-center justify-end gap-2 border-t border-secondary/15 pt-2">
        <p className="font-body font-medium text-primary">{formatPrice(loverTotal)}</p>
        <span className="text-foreground/40">|</span>
        <p className="font-body text-sm text-foreground/50">{formatPrice(regularTotal)}</p>
      </div>
    </li>
  )
}
