import { useEffect, useState } from 'react'
import type { Product } from '../../domain/menu/Product'
import type { Promotion } from '../../domain/promotion/Promotion'
import { distributePromotionDiscount } from '../../domain/promotion/promotionPricing'
import { visiblePromotions } from '../../domain/promotion/visiblePromotions'
import { prefersReducedMotion } from '../shared/prefersReducedMotion'
import { formatPrice } from './formatPrice'
import { ProductDetailModal } from './ProductDetailModal'
import { PromotionDetailModal } from './PromotionDetailModal'

const AUTOPLAY_MS = 3500

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
    <div>
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
        className="relative block h-44 w-full cursor-pointer overflow-hidden rounded-3xl bg-tile text-left"
      >
        <img
          src={promotion.imageUrl ?? undefined}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/70 to-transparent" aria-hidden="true" />

        <div className="relative flex h-full flex-col justify-center gap-1 px-5">
          {promotion.badgeLabel && (
            <span className="mb-1 inline-flex w-fit items-center rounded-full bg-caramel px-2.5 py-0.5 text-xs font-semibold text-on-caramel">
              {promotion.badgeLabel}
            </span>
          )}
          <p className="font-display text-[22px] font-bold leading-tight">{promotion.title}</p>
          {promotion.subtitle && <p className="text-sm text-soft">{promotion.subtitle}</p>}
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-semibold tabular-nums">{formatPrice(previewPrice?.regular ?? product.price)}</span>
            {(previewPrice?.lover ?? product.loverPrice) < (previewPrice?.regular ?? product.price) && (
              <span className="text-sm text-caramel tabular-nums">Lover {formatPrice(previewPrice?.lover ?? product.loverPrice)}</span>
            )}
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
                  className="flex h-6 w-5 items-center justify-center"
                >
                  <span
                    className={`h-1.5 rounded-full transition-all ${
                      slideIndex === index ? 'w-4 bg-caramel' : 'w-1.5 bg-ink/40'
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
