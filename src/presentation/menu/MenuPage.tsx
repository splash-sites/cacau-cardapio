import { useLayoutEffect, useMemo, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { cartItemCount, cartTotal } from '../../domain/cart/Cart'
import { browsingOrderTypeLabel } from '../../domain/order/orderTypeLabel'
import { useCart } from '../cart/useCart'
import { useOrderType } from '../order/useOrderType'
import { useCurrentStore } from '../store/useCurrentStore'
import { FixedBottomBar } from '../shared/FixedBottomBar'
import { PageShell } from '../shared/PageShell'
import { CATEGORY_PILL_BAR_HEIGHT_PX, CategoryPillBar } from './CategoryPillBar'
import { ProductCard } from './ProductCard'
import { PromotionCarousel } from './PromotionCarousel'
import { formatPrice } from './formatPrice'
import { buildRows, categoryRowIndex, nearestCategoryLabel } from './menuRows'
import { useMenu } from './useMenu'
import { usePromotions } from './usePromotions'

export function MenuPage() {
  const store = useCurrentStore()
  const orderType = useOrderType((state) => state.orderType)
  const items = useCart((state) => state.items)
  const navigate = useNavigate()

  const { data: groups, isLoading, isError } = useMenu(store.id, orderType)
  const { data: promotions } = usePromotions(store.id)

  const rows = useMemo(() => (groups ? buildRows(groups) : []), [groups])
  const categories = useMemo(() => (groups ? [...groups.keys()] : []), [groups])
  const rowIndexByCategory = useMemo(() => categoryRowIndex(rows), [rows])

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

  // Pílula ativa (scroll-spy): acha a linha que está bem no topo da área
  // visível agora (logo abaixo da barra fixa) e sobe até o cabeçalho de
  // categoria mais próximo dela. A barra é sticky e cobre os primeiros
  // CATEGORY_PILL_BAR_HEIGHT_PX da viewport — soma isso ao scrollOffset,
  // senão "topo visível" ficaria escondido atrás da barra.
  const virtualItems = rowVirtualizer.getVirtualItems()
  const scrollOffset = rowVirtualizer.scrollOffset ?? 0
  const topVisibleItem =
    virtualItems.find((item) => item.end > scrollOffset + CATEGORY_PILL_BAR_HEIGHT_PX) ?? virtualItems[0]
  const activeCategory = topVisibleItem ? nearestCategoryLabel(rows, topVisibleItem.index) : null

  function handleSelectCategory(category: string) {
    const index = rowIndexByCategory.get(category)
    if (index === undefined) return
    rowVirtualizer.scrollToIndex(index, { align: 'start' })
    // scrollToIndex alinha o topo do item com y=0 da viewport — mas a barra
    // de categoria é sticky e cobre esse espaço, escondendo o cabeçalho atrás
    // dela. Desconta a altura da barra pra ele ficar visível logo abaixo.
    setTimeout(() => window.scrollBy(0, -CATEGORY_PILL_BAR_HEIGHT_PX), 100)
  }

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

      <CategoryPillBar categories={categories} active={activeCategory} onSelect={handleSelectCategory} />

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
