import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { AddonOption } from '../../domain/addon/AddonOption'
import {
  type AddonSelections,
  addonSelectionsLoverTotal,
  addonSelectionsTotal,
  resolveSelectedAddons,
} from '../../domain/addon/addonSelection'
import type { ComboLineInput } from '../../domain/cart/Cart'
import type { Product } from '../../domain/menu/Product'
import type { Promotion } from '../../domain/promotion/Promotion'
import { distributePromotionDiscount, type PromotionPricingLine } from '../../domain/promotion/promotionPricing'
import {
  isVariationSelectionComplete,
  resolveBasePrice,
  resolveSelectedVariations,
  selectVariationOption,
  type VariationSelections,
} from '../../domain/variation/variationSelection'
import type { VariationOption } from '../../domain/variation/VariationOption'
import { useCart } from '../cart/useCart'
import { AddonGroupSection } from './AddonGroupSection'
import { formatPrice } from './formatPrice'
import { useProductAddons } from './useProductAddons'
import { useProductVariations } from './useProductVariations'
import { VariationGroupSection } from './VariationGroupSection'

const TRANSITION_MS = 300
const UNMOUNT_DELAY_MS = 310

interface ComboSlot {
  productId: string
  product: Product
  quantity: number
}

interface ComboSlotState {
  // Preço BASE (produto + variação), SEM adicional — é só isso que entra no
  // cálculo de desconto do combo (distributePromotionDiscount). Adicional
  // nunca é descontado, soma por cima igual em qualquer produto.
  baseRegularPrice: number
  baseLoverPrice: number
  addonsRegularTotal: number
  addonsLoverTotal: number
  addons: AddonOption[]
  variations: VariationOption[]
  ready: boolean
  error: boolean
}

export function PromotionDetailModal({
  promotion,
  products,
  onClose,
}: {
  promotion: Promotion
  products: Product[]
  onClose: () => void
}) {
  const addCombo = useCart((state) => state.addCombo)

  const [visible, setVisible] = useState(false)
  const [comboQuantity, setComboQuantity] = useState(1)
  const [slotStates, setSlotStates] = useState<Record<string, ComboSlotState>>({})

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, UNMOUNT_DELAY_MS)
  }

  const mainProduct = products.find((product) => product.id === promotion.productId)
  const slots: ComboSlot[] = mainProduct
    ? [
        { productId: promotion.productId, product: mainProduct, quantity: 1 },
        ...promotion.comboItems.flatMap((item) => {
          const product = products.find((candidate) => candidate.id === item.productId)
          return product ? [{ productId: item.productId, product, quantity: item.quantity }] : []
        }),
      ]
    : []

  // Defesa extra: visiblePromotions já garante que produto principal + todos os
  // itens do combo estão disponíveis antes do carrossel mostrar a promoção — se
  // isso mudou entre carregar o carrossel e abrir o modal (ex: ficou sem
  // estoque), fecha em vez de mostrar um combo incompleto.
  if (!mainProduct || slots.length !== promotion.comboItems.length + 1) {
    return null
  }

  function handleSlotChange(productId: string, state: ComboSlotState) {
    setSlotStates((current) => ({ ...current, [productId]: state }))
  }

  const allReady = slots.every((slot) => slotStates[slot.productId]?.ready)
  const anyError = slots.some((slot) => slotStates[slot.productId]?.error)

  // Só a parte BASE (produto+variação) entra na distribuição de desconto —
  // adicional nunca é descontado, ver ComboSlotState.
  function buildBaseLines(priceOf: (state: ComboSlotState) => number): PromotionPricingLine[] {
    return slots.map((slot) => {
      const state = slotStates[slot.productId]
      return {
        productId: slot.productId,
        quantity: slot.quantity * comboQuantity,
        unitPrice: state ? priceOf(state) : 0,
      }
    })
  }

  const discountedBaseRegular = distributePromotionDiscount(
    buildBaseLines((state) => state.baseRegularPrice),
    promotion.discountType,
    promotion.discountValue,
  )
  const discountedBaseLover = distributePromotionDiscount(
    buildBaseLines((state) => state.baseLoverPrice),
    promotion.discountType,
    promotion.discountValue,
  )

  function totalWithAddons(discounted: typeof discountedBaseRegular, addonsTotalOf: (state: ComboSlotState) => number) {
    return discounted.reduce((sum, line) => {
      const state = slotStates[line.productId]
      const addonsTotal = state ? addonsTotalOf(state) : 0
      return sum + (line.discountedUnitPrice + addonsTotal) * line.quantity
    }, 0)
  }

  const regularTotal = totalWithAddons(discountedBaseRegular, (state) => state.addonsRegularTotal)
  const loverTotal = totalWithAddons(discountedBaseLover, (state) => state.addonsLoverTotal)

  function handleAdd() {
    if (!allReady) return
    const comboGroupId = crypto.randomUUID()
    const lines: ComboLineInput[] = slots.map((slot) => {
      const state = slotStates[slot.productId]!
      const discountedBase = discountedBaseRegular.find((line) => line.productId === slot.productId)!.discountedUnitPrice
      const discountedBaseLoverPrice = discountedBaseLover.find((line) => line.productId === slot.productId)!.discountedUnitPrice
      return {
        product: slot.product,
        addons: state.addons,
        variations: state.variations,
        quantity: slot.quantity * comboQuantity,
        discountedUnitPrice: discountedBase,
        discountedLoverUnitPrice: discountedBaseLoverPrice,
      }
    })
    addCombo(comboGroupId, promotion.id, lines)
    handleClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="presentation">
      <div
        onClick={handleClose}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
        className={`absolute inset-0 bg-black/50 transition-opacity ease-out motion-reduce:transition-none ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={promotion.title}
        style={{
          transitionDuration: `${TRANSITION_MS}ms`,
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
        }}
        className="relative z-10 flex max-h-[88vh] w-full sm:max-w-sm flex-col overflow-hidden rounded-t-[20px] bg-background shadow-xl transition-transform ease-out motion-reduce:transition-none"
      >
        <div className="flex shrink-0 items-start justify-between gap-2 px-4 pt-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-accent">{promotion.title}</h2>
            {promotion.subtitle && <p className="mt-1 font-body text-sm text-foreground/70">{promotion.subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="flex h-11 w-11 min-h-11 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="flex flex-col gap-4">
            {slots.map((slot) => (
              <ComboSlotSection
                key={slot.productId}
                product={slot.product}
                quantity={slot.quantity}
                onChange={(state) => handleSlotChange(slot.productId, state)}
              />
            ))}

            <div className="flex items-center justify-between">
              <span className="font-body text-xs font-bold uppercase tracking-wide text-secondary">Quantidade</span>
              <div className="flex h-11 items-center gap-3 rounded-full bg-primary/10">
                <button
                  type="button"
                  onClick={() => setComboQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Diminuir quantidade"
                  className="flex h-11 w-11 items-center justify-center text-lg font-body font-medium text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  −
                </button>
                <span className="min-w-4 text-center font-body font-medium text-foreground">{comboQuantity}</span>
                <button
                  type="button"
                  onClick={() => setComboQuantity((q) => q + 1)}
                  aria-label="Aumentar quantidade"
                  className="flex h-11 w-11 items-center justify-center text-lg font-body font-medium text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-secondary/15 bg-background px-4 py-3">
          <div className="mb-2 flex items-center justify-between font-body text-sm">
            <span className="font-medium text-primary">Cacau Lovers* {formatPrice(loverTotal)}</span>
            <span className="text-foreground/50">{formatPrice(regularTotal)}</span>
          </div>
          {anyError ? (
            <p className="mb-2 text-center font-body text-xs text-red-600">
              Não foi possível carregar as opções desse combo. Tente fechar e abrir de novo.
            </p>
          ) : (
            !allReady && (
              <p className="mb-2 text-center font-body text-xs text-secondary">Escolha as opções acima pra continuar</p>
            )
          )}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!allReady}
            className="h-11 min-h-11 w-full rounded-2xl bg-primary font-body font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
          >
            Adicionar combo
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function ComboSlotSection({
  product,
  quantity,
  onChange,
}: {
  product: Product
  quantity: number
  onChange: (state: ComboSlotState) => void
}) {
  const { data: addonGroups, isPending: addonsPending, isError: addonsError } = useProductAddons(product.id)
  const { data: variationGroups, isPending: variationsPending, isError: variationsError } = useProductVariations(product.id)
  const [selections, setSelections] = useState<AddonSelections>({})
  const [variationSelections, setVariationSelections] = useState<VariationSelections>({})

  const groups = addonGroups ?? []
  const varGroups = variationGroups ?? []
  const variations = resolveSelectedVariations(variationSelections, varGroups)
  const variationsComplete = isVariationSelectionComplete(variationSelections, varGroups)
  const addons = resolveSelectedAddons(selections, groups)
  const addonsRegular = addonSelectionsTotal(selections, groups)
  const addonsLover = addonSelectionsLoverTotal(selections, groups)
  const { regular: baseRegular, lover: baseLover } = resolveBasePrice(product, variations)

  const loading = addonsPending || variationsPending
  const error = addonsError || variationsError
  const ready = !loading && !error && variationsComplete

  const addonIdsKey = addons.map((addon) => addon.id).join(',')
  const variationIdsKey = variations.map((variation) => variation.id).join(',')

  useEffect(() => {
    onChange({
      baseRegularPrice: baseRegular,
      baseLoverPrice: baseLover,
      addonsRegularTotal: addonsRegular,
      addonsLoverTotal: addonsLover,
      addons,
      variations,
      ready,
      error,
    })
    // addons/variations recriados a cada render — comparamos pelas chaves de id
    // pra não disparar o efeito à toa, mas o valor usado no callback é sempre o
    // atual (closure), não o da render que registrou o efeito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseRegular, addonsRegular, baseLover, addonsLover, addonIdsKey, variationIdsKey, ready, error])

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-secondary/15 bg-white/40 p-3">
      <div className="flex items-center gap-3">
        {product.imageUrl && (
          <img src={product.imageUrl} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        )}
        <p className="font-body text-sm font-bold text-foreground">
          {quantity > 1 && `${quantity}× `}
          {product.name}
        </p>
      </div>

      {loading && <p className="font-body text-xs text-foreground/50">Carregando opções…</p>}
      {error && <p className="font-body text-xs text-red-600">Não foi possível carregar as opções desse item.</p>}

      {varGroups.map((group) => (
        <VariationGroupSection
          key={group.id}
          group={group}
          selectedOptionId={variationSelections[group.id]}
          onSelect={(optionId) => setVariationSelections((current) => selectVariationOption(current, group.id, optionId))}
        />
      ))}

      {groups.map((group) => (
        <AddonGroupSection key={group.id} group={group} selections={selections} onChange={setSelections} />
      ))}
    </div>
  )
}
