import { useEffect, useState } from 'react'
import type { Product } from '../../domain/menu/Product'
import type { Promotion } from '../../domain/promotion/Promotion'
import { visiblePromotions } from '../../domain/promotion/visiblePromotions'
import { formatPrice } from './formatPrice'
import { ProductDetailModal } from './ProductDetailModal'

const AUTOPLAY_MS = 3500

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function PromotionCarousel({ promotions, products }: { promotions: Promotion[]; products: Product[] }) {
  const slides = visiblePromotions(promotions, products)
  const [index, setIndex] = useState(0)
  const [openProduct, setOpenProduct] = useState<Product | null>(null)

  useEffect(() => {
    setIndex(0)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1 || prefersReducedMotion()) return
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) return null

  const promotion = slides[index]
  const product = products.find((item) => item.id === promotion.productId)
  if (!product) return null

  return (
    <div className="mb-6">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpenProduct(product)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          setOpenProduct(product)
        }}
        aria-label={`Ver detalhes de ${product.name}`}
        className="relative block h-40 w-full cursor-pointer overflow-hidden rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <img src={promotion.imageUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-accent/95 via-accent/70 to-transparent" aria-hidden="true" />

        <div className="relative flex h-full flex-col justify-center gap-1 px-4">
          {promotion.badgeLabel && (
            <span className="mb-1 inline-flex w-fit items-center rounded-full bg-primary px-2 py-0.5 font-body text-[11px] font-medium text-primary-foreground">
              {promotion.badgeLabel}
            </span>
          )}
          <p className="font-display text-xl text-background">{promotion.title}</p>
          {promotion.subtitle && <p className="font-body text-sm text-background/70">{promotion.subtitle}</p>}
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-body text-lg font-bold text-primary">{formatPrice(product.loverPrice)}</span>
            <span className="font-body text-sm text-background/50 line-through">{formatPrice(product.price)}</span>
          </div>

          {slides.length > 1 && (
            <div className="mt-2 flex gap-1" role="tablist" aria-label="Promoções">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={slideIndex === index}
                  aria-label={`Ver promoção ${slideIndex + 1}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    setIndex(slideIndex)
                  }}
                  className="flex h-6 w-4 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span
                    className={`h-1.5 rounded-full transition-all ${
                      slideIndex === index ? 'w-4 bg-primary' : 'w-1.5 bg-background/40'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {openProduct && <ProductDetailModal product={openProduct} onClose={() => setOpenProduct(null)} />}
    </div>
  )
}
