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
import { prefersReducedMotion } from '../shared/prefersReducedMotion'
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
    // Números exatos, não estimativa — ProductCard tem altura sempre igual
    // (nome com line-clamp-2 + min-h-14, ver ProductCard.tsx), medido ao
    // vivo: linha de produto 153px (card 141 + pb-3 12px), categoria 28px.
    // É isso que permite scrollToIndex com behavior:'smooth' pousar exato.
    estimateSize: (index) => (rows[index]?.type === 'category' ? 28 : 153),
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
