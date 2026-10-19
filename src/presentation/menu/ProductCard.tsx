import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import type { Product } from '../../domain/menu/Product'
import { useCart } from '../cart/useCart'
import { ProductThumb } from '../shared/ProductThumb'
import { formatPrice } from './formatPrice'
import { ProductDetailModal } from './ProductDetailModal'
import { productAddonsQuery } from './useProductAddons'
import { productVariationsQuery } from './useProductVariations'

// Altura FIXA da linha (cabe nome em 2 linhas + descrição + preço; 117px com a borda).
// É o que deixa a lista virtualizada do MenuPage pousar exato ao tocar numa
// categoria; o texto ao lado da miniatura corta com "..." em vez de esticar a linha.
export const PRODUCT_ROW_HEIGHT_PX = 117

export function ProductCard({ product }: { product: Product }) {
  const queryClient = useQueryClient()
  const [detailOpen, setDetailOpen] = useState(false)
  const quantityInCart = useCart((state) =>
    state.items.filter((item) => item.product.id === product.id && !item.comboGroupId).reduce((sum, item) => sum + item.quantity, 0),
  )
  const hasLover = product.loverPrice < product.price

  // Começa a buscar as opções no toque (antes do clique) pra o modal já abrir sabendo as etapas.
  function prefetchOptions() {
    void queryClient.prefetchQuery(productAddonsQuery(product.id))
    void queryClient.prefetchQuery(productVariationsQuery(product.id))
  }

  return (
    <>
      <button
        type="button"
        onPointerDown={prefetchOptions}
        onClick={() => {
          prefetchOptions()
          setDetailOpen(true)
        }}
        aria-label={`Ver detalhes de ${product.name}`}
        className="flex w-full items-center gap-3.5 border-b border-line py-3.5 text-left transition-colors active:bg-surface"
        style={{ height: PRODUCT_ROW_HEIGHT_PX }}
      >
        <ProductThumb name={product.name} imageUrl={product.imageUrl} />

        <span className="flex max-h-full min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
          <span className="line-clamp-2 text-[17px] font-semibold leading-tight">{product.name}</span>
          {product.description && <span className="line-clamp-1 text-[13px] text-muted">{product.description}</span>}
          <span className="text-[15px] tabular-nums">
            <b className="font-semibold">{formatPrice(product.price)}</b>
            {hasLover && <span className="whitespace-nowrap text-caramel"> Lover {formatPrice(product.loverPrice)}</span>}
          </span>
        </span>

        <span
          aria-hidden="true"
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border-[1.5px] text-[15px] font-semibold ${
            quantityInCart > 0 ? 'border-caramel bg-chosen text-caramel' : 'border-line-strong text-ink'
          }`}
        >
          {quantityInCart > 0 ? quantityInCart : <Plus size={20} />}
        </span>
      </button>

      {detailOpen && <ProductDetailModal product={product} onClose={() => setDetailOpen(false)} />}
    </>
  )
}
