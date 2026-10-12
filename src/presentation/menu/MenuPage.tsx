import { useLayoutEffect, useMemo, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ChevronLeft, ReceiptText } from 'lucide-react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { cartItemCount, cartTotal } from '../../domain/cart/Cart'
import { browsingOrderTypeLabel } from '../../domain/order/orderTypeLabel'
import { useCart } from '../cart/useCart'
import { useOrderType } from '../order/useOrderType'
import { useCurrentStore } from '../store/useCurrentStore'
import { FixedBottomBar } from '../shared/FixedBottomBar'
import { PageShell } from '../shared/PageShell'
import { prefersReducedMotion } from '../shared/prefersReducedMotion'
import { iconButtonClass, primaryButtonClass } from '../shared/ui'
import { CATEGORY_PILL_BAR_HEIGHT_PX, CategoryPillBar } from './CategoryPillBar'
import { PRODUCT_ROW_HEIGHT_PX, ProductCard } from './ProductCard'
import { PromotionCarousel } from './PromotionCarousel'
import { formatPrice } from './formatPrice'
import { buildRows, categoryRowIndex, nearestCategoryLabel } from './menuRows'
import { useMenu } from './useMenu'
import { usePromotions } from './usePromotions'

const CATEGORY_ROW_HEIGHT_PX = 56

export function MenuPage() {
  const store = useCurrentStore()
  const orderType = useOrderType((state) => state.orderType)
  const salesChannel = useOrderType((state) => state.salesChannel)
  const tableNumber = useOrderType((state) => state.tableNumber)
  const items = useCart((state) => state.items)
  const navigate = useNavigate()

  const { data: groups, isLoading, isError } = useMenu(store.id, orderType, salesChannel)
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
    // Números exatos, não estimativa: a linha de produto tem altura fixa
    // (PRODUCT_ROW_HEIGHT_PX, ver ProductCard.tsx) e o cabeçalho de categoria
    // também (CATEGORY_ROW_HEIGHT_PX). É isso que permite scrollToIndex com
    // behavior:'smooth' pousar exato.
    estimateSize: (index) => (rows[index]?.type === 'category' ? CATEGORY_ROW_HEIGHT_PX : PRODUCT_ROW_HEIGHT_PX),
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

  // Com o card de produto em altura FIXA (ver ProductCard.tsx e o
  // estimateSize acima), scrollToIndex não precisa mais corrigir a posição
  // depois de chegar perto (a estimativa já é exata) — sobra só descontar a
  // altura da barra fixa. scrollToOffset manual (bypassando scrollToIndex)
  // não tratava o scrollMargin do mesmo jeito e pousava ~400-500px errado —
  // scrollToIndex continua sendo o único jeito comprovado de acertar isso.
  //
  // A correção da barra roda via 'scrollend' NATIVO do navegador (não do
  // virtualizer, não um setTimeout chutado) — só depois que a rolagem
  // termina de vez, mesmo pra behavior:'auto' (aplicar na hora ainda corria
  // cedo demais, antes do scroll instantâneo realmente registrar). Se
  // clicar noutra categoria antes da correção anterior disparar, cancela o
  // listener velho — senão ele aplica na hora errada, em cima do scroll novo.
  const pendingCorrectionRef = useRef<(() => void) | null>(null)

  function handleSelectCategory(category: string) {
    const index = rowIndexByCategory.get(category)
    if (index === undefined) return

    if (pendingCorrectionRef.current) {
      window.removeEventListener('scrollend', pendingCorrectionRef.current)
      pendingCorrectionRef.current = null
    }

    const reduceMotion = prefersReducedMotion()
    rowVirtualizer.scrollToIndex(index, { align: 'start', behavior: reduceMotion ? 'auto' : 'smooth' })

    const correct = () => {
      window.scrollBy(0, -CATEGORY_PILL_BAR_HEIGHT_PX)
      pendingCorrectionRef.current = null
    }

    if (reduceMotion) {
      // 'scrollend' não dispara de forma confiável pra scroll instantâneo
      // (testado ao vivo — scrollY chegava no lugar certo e ficava parado,
      // o listener nunca rodava). Um rAF já basta aqui: sem remedição
      // dinâmica pra esperar (altura fixa), só precisa da rolagem
      // instantânea ter registrado antes de corrigir.
      requestAnimationFrame(correct)
    } else {
      pendingCorrectionRef.current = correct
      window.addEventListener('scrollend', correct, { once: true })
    }
  }

  if (!orderType) return <Navigate to={`/${store.slug}`} replace />

  const itemCount = cartItemCount(items)

  const title = salesChannel === 'reseller' ? 'Revenda' : browsingOrderTypeLabel(orderType, store)
  const subtitle = tableNumber ? `Mesa ${tableNumber}` : null

  return (
    <PageShell>
      <header className="flex items-center gap-3 px-5 pb-3 pt-4">
        <button
          type="button"
          onClick={() => navigate(`/${store.slug}`)}
          aria-label="Voltar para o início"
          className={iconButtonClass}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] text-muted">{store.name}</span>
          <h1 className="truncate font-display text-2xl font-bold leading-tight">
            {title}
            {subtitle && <span className="text-caramel"> · {subtitle}</span>}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/${store.slug}/pedidos`)}
          aria-label="Meus pedidos"
          className={iconButtonClass}
        >
          <ReceiptText size={20} aria-hidden="true" />
        </button>
      </header>

      {salesChannel === 'reseller' && (
        <div className="px-5 pb-4">
          <p className="font-display text-[28px] font-bold leading-[1.05] tracking-tight">
            Preço de atacado, retirada no balcão
          </p>
        </div>
      )}

      {salesChannel === 'retail' && groups && promotions && promotions.length > 0 && (
        <div className="px-5 pb-4">
          <PromotionCarousel promotions={promotions} products={[...groups.values()].flat()} />
        </div>
      )}

      <CategoryPillBar categories={categories} active={activeCategory} onSelect={handleSelectCategory} />

      <div className="px-5 pb-32">
        {isLoading && <p className="py-6 text-muted">Carregando cardápio…</p>}
        {isError && <p className="py-6 text-danger">Não foi possível carregar o cardápio agora.</p>}
        {groups && groups.size === 0 && <p className="py-6 text-muted">Nenhum item disponível no momento.</p>}

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
                    <h2
                      className="flex items-end pb-1 font-display text-[22px] font-bold"
                      style={{ height: CATEGORY_ROW_HEIGHT_PX }}
                    >
                      {row.category}
                    </h2>
                  ) : (
                    <ProductCard product={row.product} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {itemCount > 0 && (
        <FixedBottomBar>
          <button
            type="button"
            onClick={() => navigate(`/${store.slug}/carrinho`)}
            className={`${primaryButtonClass} justify-between`}
          >
            <span className="text-[15px] font-medium">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </span>
            <span>
              Ver sacola <span className="tabular-nums">{formatPrice(cartTotal(items))}</span>
            </span>
          </button>
        </FixedBottomBar>
      )}
    </PageShell>
  )
}
