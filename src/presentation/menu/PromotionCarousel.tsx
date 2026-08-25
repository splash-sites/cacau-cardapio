import { useEffect, useState } from 'react'
import type { Product } from '../../domain/menu/Product'
import type { Promotion } from '../../domain/promotion/Promotion'
import { distributePromotionDiscount } from '../../domain/promotion/promotionPricing'
import { visiblePromotions } from '../../domain/promotion/visiblePromotions'
import { formatPrice } from './formatPrice'
import { ProductDetailModal } from './ProductDetailModal'
import { PromotionDetailModal } from './PromotionDetailModal'

const AUTOPLAY_MS = 3500

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Prévia do preço no card do carrossel, na quantidade base (1x o combo, sem
// adicional/variação escolhidos ainda — isso só acontece no PromotionDetailModal).
// Sem desconto (discountType null) retorna null e o card usa product.price/loverPrice
// como sempre foi.
function comboPreviewPrice(promotion: Promotion, products: Product[]): { regular: number; lover: number } | null {
  if (!promotion.discountType) return null

  const mainProduct = products.find((product) => product.id === promotion.productId)
  if (!mainProduct) return null

  const items = [{ productId: promotion.productId, quantity: 1, price: mainProduct.price, loverPrice: mainProduct.loverPrice }]
  for (const comboItem of promotion.comboItems) {
    const product = products.find((candidate) => candidate.id === comboItem.productId)
    if (!product) return null
    items.push({ productId: comboItem.productId, quantity: comboItem.quantity, price: product.price, loverPrice: product.loverPrice })
  }

  const sum = (priceOf: (item: (typeof items)[number]) => number) =>
    distributePromotionDiscount(
      items.map((item) => ({ productId: item.productId, quantity: item.quantity, unitPrice: priceOf(item) })),
      promotion.discountType,
      promotion.discountValue,
    ).reduce((total, line) => total + line.discountedUnitPrice * line.quantity, 0)

  return { regular: sum((item) => item.price), lover: sum((item) => item.loverPrice) }
}

export function PromotionCarousel({ promotions, products }: { promotions: Promotion[]; products: Product[] }) {
  const slides = visiblePromotions(promotions, products)
  const [index, setIndex] = useState(0)
  const [openProduct, setOpenProduct] = useState<Product | null>(null)
  const [openPromotion, setOpenPromotion] = useState<Promotion | null>(null)

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
  const previewPrice = comboPreviewPrice(promotion, products)

  return (
    <div className="mb-6">
      <div
        role="button"
        tabIndex={0}
        onClick={() => (promotion.discountType ? setOpenPromotion(promotion) : setOpenProduct(product))}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          if (promotion.discountType) setOpenPromotion(promotion)
          else setOpenProduct(product)
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
            <span className="font-body text-lg font-bold text-primary">{formatPrice(previewPrice?.lover ?? product.loverPrice)}</span>
            <span className="font-body text-sm text-background/50 line-through">{formatPrice(previewPrice?.regular ?? product.price)}</span>
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
      {openPromotion && (
        <PromotionDetailModal promotion={openPromotion} products={products} onClose={() => setOpenPromotion(null)} />
      )}
    </div>
  )
}
