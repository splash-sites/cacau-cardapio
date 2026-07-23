import { Navigate, useNavigate } from 'react-router-dom'
import { cartItemCount, cartTotal } from '../../domain/cart/Cart'
import { useCart } from '../cart/useCart'
import { useOrderType } from '../order/useOrderType'
import { useCurrentStore } from '../store/StoreContext'
import { FixedBottomBar } from '../shared/FixedBottomBar'
import { PageShell } from '../shared/PageShell'
import { ProductCard } from './ProductCard'
import { formatPrice } from './formatPrice'
import { useMenu } from './useMenu'

export function MenuPage() {
  const store = useCurrentStore()
  const orderType = useOrderType((state) => state.orderType)
  const items = useCart((state) => state.items)
  const navigate = useNavigate()

  const { data: groups, isLoading, isError } = useMenu(store.id, orderType ?? 'dine_in')

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
            className="flex h-11 w-11 min-h-11 shrink-0 items-center justify-center font-display text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            ←
          </button>
          <div>
            <h1 className="font-display text-2xl">{store.name}</h1>
            <p className="font-body text-sm text-background/70">Monte seu pedido com carinho, no seu ritmo.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/${store.slug}/pedidos`)}
          aria-label="Meus pedidos"
          className="flex h-11 w-11 min-h-11 shrink-0 items-center justify-center rounded-full bg-background/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 7h12l1 13H5L6 7Z" />
            <path d="M9 7V6a3 3 0 0 1 6 0v1" />
          </svg>
        </button>
      </div>

      <div className="px-4 py-6 pb-24">
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
            className="flex min-h-11 w-full items-center justify-between rounded-full bg-accent px-5 py-3 font-body text-accent-foreground shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span>{itemCount} {itemCount === 1 ? 'item' : 'itens'} · {formatPrice(cartTotal(items))}</span>
            <span className="font-medium">Ver carrinho ›</span>
          </button>
        </FixedBottomBar>
      )}
    </PageShell>
  )
}
