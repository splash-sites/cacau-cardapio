import { useLayoutEffect, useMemo, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { cartItemCount, cartTotal } from '../../domain/cart/Cart'
import type { Product } from '../../domain/menu/Product'
import { browsingOrderTypeLabel } from '../../domain/order/orderTypeLabel'
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

type MenuRow = { type: 'category'; category: string } | { type: 'product'; product: Product }

function buildRows(groups: Map<string, Product[]>): MenuRow[] {
  const rows: MenuRow[] = []
  for (const [category, products] of groups.entries()) {
    rows.push({ type: 'category', category })
    for (const product of products) {
      rows.push({ type: 'product', product })
    }
  }
  return rows
}

export function MenuPage() {
  const store = useCurrentStore()
  const orderType = useOrderType((state) => state.orderType)
  const items = useCart((state) => state.items)
  const navigate = useNavigate()

  const { data: groups, isLoading, isError } = useMenu(store.id, orderType)
  const { data: promotions } = usePromotions(store.id)

  const rows = useMemo(() => (groups ? buildRows(groups) : []), [groups])

  const listRef = useRef<HTMLDivElement>(null)
  const listOffsetRef = useRef(0)

  useLayoutEffect(() => {
    listOffsetRef.current = listRef.current?.offsetTop ?? 0
  })

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: (index) => (rows[index]?.type === 'category' ? 36 : 128),
    overscan: 8,
    scrollMargin: listOffsetRef.current,
  })

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
            <h1 className="font-display text-2xl">{browsingOrderTypeLabel(orderType, store)}</h1>
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

        {groups && groups.size > 0 && (
          <div ref={listRef} style={{ position: 'relative', height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
                  }}
                >
                  {row.type === 'category' ? (
                    <h2 className="mb-2 mt-6 font-body text-sm font-bold uppercase tracking-wide text-primary first:mt-0">
                      {row.category}
                    </h2>
                  ) : (
                    <div className="pb-3">
                      <ProductCard product={row.product} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
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
