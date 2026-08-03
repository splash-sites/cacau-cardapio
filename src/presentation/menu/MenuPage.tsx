import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { cartItemCount, cartTotal } from '../../domain/cart/Cart'
import { orderTypeLabel } from '../../domain/order/orderTypeLabel'
import { useCart } from '../cart/useCart'
import { useOrderType } from '../order/useOrderType'
import { useCurrentStore } from '../store/useCurrentStore'
import { FixedBottomBar } from '../shared/FixedBottomBar'
import { PageShell } from '../shared/PageShell'
import { ProductCard } from './ProductCard'
import { PromotionCarousel } from './PromotionCarousel'
import { formatPrice } from './formatPrice'
import { useMenu } from './useMenu'
import { usePromotions } from './usePromotions'

export function MenuPage() {
  const store = useCurrentStore()
  const orderType = useOrderType((state) => state.orderType)
  const items = useCart((state) => state.items)
  const navigate = useNavigate()

  const { data: groups, isLoading, isError } = useMenu(store.id, orderType)
  const { data: promotions } = usePromotions(store.id)

  if (!orderType) return <Navigate to={`/${store.slug}`} replace />

  const itemCount = cartItemCount(items)

  return (
    <PageShell className="text-foreground">
      <div className="flex items-start justify-between gap-2 bg-accent px-4 py-5 text-background">
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => navigate(`/${store.slug}`)}
            aria-label="Voltar"
            className="flex h-11 w-11 min-h-11 shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
          <div>
            <h1 className="font-display text-2xl">{orderTypeLabel(orderType)}</h1>
            <p className="font-body text-sm text-background/70">Monte seu pedido com carinho, no seu ritmo.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/${store.slug}/pedidos`)}
          aria-label="Meus pedidos"
          className="flex h-11 w-11 min-h-11 shrink-0 items-center justify-center rounded-full bg-background/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ShoppingBag size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="px-4 py-6 pb-24">
        {groups && promotions && promotions.length > 0 && (
          <PromotionCarousel promotions={promotions} products={[...groups.values()].flat()} />
        )}

        {isLoading && <p className="font-body text-foreground/70">Carregando cardápio…</p>}
        {isError && <p className="font-body text-red-600">Não foi possível carregar o cardápio agora.</p>}
        {groups && groups.size === 0 && (
          <p className="font-body text-foreground/70">Nenhum item disponível no momento.</p>
        )}

        {groups &&
          [...groups.entries()].map(([category, products]) => (
            <section key={category} className="mb-6">
              <h2 className="mb-2 font-body text-sm font-bold uppercase tracking-wide text-primary">{category}</h2>
              <ul className="flex flex-col gap-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ul>
            </section>
          ))}
      </div>

      {itemCount > 0 && (
        <FixedBottomBar className="px-4 pb-4">
          <button
            type="button"
            onClick={() => navigate(`/${store.slug}/carrinho`)}
            className="flex min-h-11 w-full items-center justify-between rounded-full bg-accent px-5 py-3 font-body text-accent-foreground shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>{itemCount} {itemCount === 1 ? 'item' : 'itens'} · {formatPrice(cartTotal(items))}</span>
            <span className="font-medium">Ver carrinho ›</span>
          </button>
        </FixedBottomBar>
      )}
    </PageShell>
  )
}
