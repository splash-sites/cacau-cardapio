import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { cartLoverTotal, cartTotal, itemUnitLoverPrice, itemUnitPrice } from '../../domain/cart/Cart'
import type { CartItem } from '../../domain/cart/CartItem'
import { groupCartItems } from '../../domain/cart/groupCartItems'
import { remainingStock } from '../../domain/cart/stock'
import { useOrderType } from '../order/useOrderType'
import { useCurrentStore } from '../store/useCurrentStore'
import { useCustomer } from '../customer/useCustomer'
import { formatPrice } from '../menu/formatPrice'
import { CheckoutHeader } from '../shared/CheckoutHeader'
import { PageShell } from '../shared/PageShell'
import { ProductThumb } from '../shared/ProductThumb'
import { primaryButtonClass, stepTitleClass } from '../shared/ui'
import { useCart } from './useCart'

export function CartPage() {
  const store = useCurrentStore()
  const orderType = useOrderType((state) => state.orderType)
  const salesChannel = useOrderType((state) => state.salesChannel)
  const customer = useCustomer((state) => state.customer)
  const items = useCart((state) => state.items)
  const removeComboGroup = useCart((state) => state.removeComboGroup)
  const navigate = useNavigate()

  if (!orderType) return <Navigate to={`/${store.slug}`} replace />

  // Só pula identificação com cliente já conhecido quando NADA mais precisa ser
  // perguntado: sem mesa (dine_in) e sem chance de escolher entrega (loja sem
  // pickup+delivery juntos: se tivesse os dois, precisa passar pelo toggle
  // retirar/receber em IdentificationPage, mesmo com o cliente já identificado;
  // revendedor nunca tem o toggle, só retira).
  const nothingElseToAsk =
    orderType === 'pickup' && store.supportsPickup && (salesChannel === 'reseller' || !store.supportsDelivery)
  const nextStep = customer && nothingElseToAsk ? 'revisao' : 'identificacao'
  const regular = cartTotal(items)
  const lover = cartLoverTotal(items)

  return (
    <PageShell>
      <CheckoutHeader
        current="Sacola"
        onBack={() => navigate(`/${store.slug}/cardapio`)}
        backLabel="Voltar ao cardápio"
      />

      <div className="flex flex-col px-5 pb-48">
        <h1 className={`${stepTitleClass} mb-2`}>Sua sacola</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-start gap-4 pt-6">
            <p className="text-soft">Sua sacola está vazia.</p>
            <button
              type="button"
              onClick={() => navigate(`/${store.slug}/cardapio`)}
              className="text-[15px] font-semibold text-caramel underline-offset-4 hover:underline"
            >
              Ver o cardápio
            </button>
          </div>
        ) : (
          <>
            <ul className="flex flex-col">
              {groupCartItems(items).map((group) =>
                group.type === 'combo' ? (
                  <ComboGroupRow
                    key={group.comboGroupId}
                    items={group.items}
                    onRemove={() => removeComboGroup(group.comboGroupId)}
                  />
                ) : (
                  <CartItemRow key={group.item.id} item={group.item} />
                ),
              )}
            </ul>
            <button
              type="button"
              onClick={() => navigate(`/${store.slug}/cardapio`)}
              className="self-start py-3.5 text-[15px] text-ink underline-offset-4 hover:underline"
            >
              Adicionar mais itens
            </button>
          </>
        )}
      </div>

      {items.length > 0 && (
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
            <button type="button" onClick={() => navigate(`/${store.slug}/${nextStep}`)} className={primaryButtonClass}>
              Continuar
            </button>
          </div>
        </div>
      )}
    </PageShell>
  )
}

function CartItemRow({ item }: { item: CartItem }) {
  const items = useCart((state) => state.items)
  const incrementItem = useCart((state) => state.incrementItem)
  const decrementItem = useCart((state) => state.decrementItem)
  const setNote = useCart((state) => state.setNote)
  const salesChannel = useOrderType((state) => state.salesChannel)
  const [editingNote, setEditingNote] = useState(false)

  const { id, product, quantity, note, addons, variations } = item
  const unitLover = itemUnitLoverPrice(item)
  const unitRegular = itemUnitPrice(item)
  const detailLine = [...variations.map((variation) => variation.name), ...addons.map((addon) => addon.name)].join(', ')
  // O saldo do produto no canal limita o carrinho (soma de todas as linhas dele).
  const stockLeft = remainingStock(items, product, salesChannel)
  const atStockLimit = stockLeft !== null && stockLeft <= 0

  return (
    <li className="flex flex-col gap-2 border-b border-line py-3.5">
      <div className="flex items-center gap-3.5">
        <ProductThumb name={product.name} imageUrl={product.imageUrl} size={60} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-base font-semibold">{product.name}</span>
          {detailLine && <span className="text-[13px] text-muted">{detailLine}</span>}
          <span className="text-[15px] tabular-nums">
            <b className="font-semibold">{formatPrice(unitRegular * quantity)}</b>
            {unitLover < unitRegular && <span className="whitespace-nowrap text-caramel"> Lover {formatPrice(unitLover * quantity)}</span>}
          </span>
        </div>
        <div className="flex h-11 shrink-0 items-center rounded-[14px] border-[1.5px] border-line-strong">
          <button
            type="button"
            onClick={() => decrementItem(id)}
            aria-label={quantity === 1 ? `Tirar ${product.name} da sacola` : `Tirar um ${product.name}`}
            className="grid h-11 w-9 place-items-center"
          >
            {quantity === 1 ? <Trash2 size={16} aria-hidden="true" /> : <Minus size={16} aria-hidden="true" />}
          </button>
          <span className="w-5 text-center font-semibold tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => incrementItem(id)}
            disabled={atStockLimit}
            aria-label={`Mais um ${product.name}`}
            className="grid h-11 w-9 place-items-center disabled:opacity-40"
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      {atStockLimit && <p className="text-[13px] text-muted">Você já pediu todo o estoque disponível.</p>}
      {editingNote || note ? (
        <input
          type="text"
          value={note ?? ''}
          onChange={(event) => setNote(id, event.target.value)}
          aria-label={`Observação para ${product.name}`}
          placeholder="Ex: sem açúcar"
          autoFocus={editingNote && !note}
          className="h-11 w-full rounded-[14px] border-[1.5px] border-line-strong bg-surface-2 px-3.5 text-[15px] text-ink placeholder:text-faint focus:border-caramel focus:outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditingNote(true)}
          className="self-start pl-[74px] text-[13px] text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Escrever observação
        </button>
      )}
    </li>
  )
}

// Combo é atômico: sem +/- de quantidade nem remoção por linha, só o grupo
// inteiro (mesma decisão de produto do PromotionDetailModal).
function ComboGroupRow({ items, onRemove }: { items: CartItem[]; onRemove: () => void }) {
  const loverTotal = items.reduce((sum, item) => sum + itemUnitLoverPrice(item) * item.quantity, 0)
  const regularTotal = items.reduce((sum, item) => sum + itemUnitPrice(item) * item.quantity, 0)

  return (
    <li className="flex flex-col gap-2 border-b border-line py-3.5">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-chosen px-2.5 py-0.5 text-xs font-semibold text-caramel">Combo</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Tirar o combo da sacola"
          className="grid h-11 w-11 place-items-center rounded-[14px] text-muted hover:text-danger"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <ul className="flex flex-col gap-1 text-[15px]">
        {items.map((item) => {
          const detailLine = [...item.variations.map((variation) => variation.name), ...item.addons.map((addon) => addon.name)].join(', ')
          return (
            <li key={item.id}>
              {item.quantity}× {item.product.name}
              {detailLine && <span className="text-muted"> {detailLine}</span>}
            </li>
          )
        })}
      </ul>
      <span className="text-[15px] tabular-nums">
        <b className="font-semibold">{formatPrice(regularTotal)}</b>
        {loverTotal < regularTotal && <span className="whitespace-nowrap text-caramel"> Lover {formatPrice(loverTotal)}</span>}
      </span>
    </li>
  )
}
