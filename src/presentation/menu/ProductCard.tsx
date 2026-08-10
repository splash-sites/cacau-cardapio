import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Product } from '../../domain/menu/Product'
import { formatPrice } from './formatPrice'
import { ProductDetailModal } from './ProductDetailModal'

export function ProductCard({ product }: { product: Product }) {
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <article className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm">
      <div className="h-[78px] w-[78px] shrink-0 overflow-hidden rounded-xl bg-secondary/10">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt=""
            loading="lazy"
            width={78}
            height={78}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <p className="font-body text-lg font-bold text-foreground">{product.name}</p>
        <span className="inline-flex w-fit items-center rounded-full border border-primary px-2 py-0.5 font-body text-[11px] font-medium text-secondary">
          Cacau Lovers*
        </span>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="font-body text-[19px] font-bold text-primary">{formatPrice(product.loverPrice)}</span>
          <span className="font-body text-sm text-foreground/50">{formatPrice(product.price)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDetailOpen(true)}
        aria-label={`Ver detalhes de ${product.name}`}
        className="flex h-11 w-11 min-h-11 shrink-0 items-center justify-center self-start rounded-full bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Plus size={20} aria-hidden="true" />
      </button>

      {detailOpen && <ProductDetailModal product={product} onClose={() => setDetailOpen(false)} />}
    </article>
  )
}
