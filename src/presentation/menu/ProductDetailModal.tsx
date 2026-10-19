import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Minus, Plus } from 'lucide-react'
import type { AddonGroup } from '../../domain/addon/AddonGroup'
import {
  type AddonSelections,
  addonSelectionsLoverTotal,
  addonSelectionsTotal,
  resolveSelectedAddons,
} from '../../domain/addon/addonSelection'
import { cartItemId } from '../../domain/cart/Cart'
import { remainingStock } from '../../domain/cart/stock'
import type { Product } from '../../domain/menu/Product'
import type { VariationGroup } from '../../domain/variation/VariationGroup'
import {
  resolveBasePrice,
  resolveSelectedVariations,
  selectVariationOption,
  type VariationSelections,
} from '../../domain/variation/variationSelection'
import { useCart } from '../cart/useCart'
import { useOrderType } from '../order/useOrderType'
import { FixedBottomBar } from '../shared/FixedBottomBar'
import { StepHeader } from '../shared/StepHeader'
import { primaryButtonClass, stepTitleClass } from '../shared/ui'
import { AddonGroupSection } from './AddonGroupSection'
import { addonGroupHint } from './addonGroupHint'
import { formatPrice } from './formatPrice'
import { ImageLightbox } from './ImageLightbox'
import { useProductAddons } from './useProductAddons'
import { useProductVariations } from './useProductVariations'
import { VariationGroupSection } from './VariationGroupSection'

const TRANSITION_MS = 260

type Step = { kind: 'variation'; group: VariationGroup } | { kind: 'addon'; group: AddonGroup }

/**
 * Produto em tela cheia. Sempre abre na apresentação (foto grande, descrição, preço);
 * se tiver opções, "Escolher opções" leva a uma pergunta por etapa: cada grupo de
 * variação (obrigatório) e cada grupo de adicional (opcional) vira um passo. Quantidade
 * e observação ficam no último passo, junto do botão de adicionar. Produto sem opções
 * é só a apresentação.
 */
export function ProductDetailModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const addItem = useCart((state) => state.addItem)
  const setNote = useCart((state) => state.setNote)
  const cartItems = useCart((state) => state.items)
  const salesChannel = useOrderType((state) => state.salesChannel)

  const { data: addonGroups, isPending: addonsPending, isError: addonsError } = useProductAddons(product.id)
  const { data: variationGroups, isPending: variationsPending, isError: variationsError } = useProductVariations(product.id)
  const optionsLoading = addonsPending || variationsPending
  const optionsLoadError = addonsError || variationsError

  const [visible, setVisible] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [selections, setSelections] = useState<AddonSelections>({})
  const [variationSelections, setVariationSelections] = useState<VariationSelections>({})
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [lightboxOpen, setLightboxOpen] = useState(false)

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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || lightboxOpen) return
      handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, TRANSITION_MS)
  }

  const groups = addonGroups ?? []
  const varGroups = variationGroups ?? []
  const steps: Step[] = [
    ...varGroups.map((group): Step => ({ kind: 'variation', group })),
    ...groups.map((group): Step => ({ kind: 'addon', group })),
  ]
  // Índice 0 é sempre a apresentação do produto; as opções vêm a partir do índice 1.
  const totalSteps = 1 + steps.length
  const step: Step | undefined = stepIndex > 0 ? steps[stepIndex - 1] : undefined
  const isLastStep = stepIndex >= totalSteps - 1

  // Saldo do produto no canal limitando o carrinho (null = sem limite).
  const stockLeft = remainingStock(cartItems, product, salesChannel)
  const maxQuantity = stockLeft ?? Infinity
  const outOfStock = stockLeft !== null && stockLeft <= 0

  const variations = resolveSelectedVariations(variationSelections, varGroups)
  const stepComplete = step?.kind !== 'variation' || variationSelections[step.group.id] !== undefined

  const addonsTotal = addonSelectionsTotal(selections, groups)
  const addonsLoverTotal = addonSelectionsLoverTotal(selections, groups)
  const { regular: baseRegular, lover: baseLover } = resolveBasePrice(product, variations)
  const regularTotal = (baseRegular + addonsTotal) * quantity
  const loverTotal = (baseLover + addonsLoverTotal) * quantity
  const choicesSummary = [...variations.map((variation) => variation.name), ...resolveSelectedAddons(selections, groups).map((addon) => addon.name)]

  function handleAdd() {
    const selectedAddons = resolveSelectedAddons(selections, groups)
    addItem(product, selectedAddons, variations, quantity)
    if (notes.trim()) setNote(cartItemId(product.id, selectedAddons, variations), notes.trim())
    handleClose()
  }

  function handlePrimary() {
    if (isLastStep) handleAdd()
    else setStepIndex((index) => index + 1)
  }

  const primaryDisabled = optionsLoading || optionsLoadError || !stepComplete || (isLastStep && outOfStock)
  const hasLover = loverTotal < regularTotal

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      style={{ transitionDuration: `${TRANSITION_MS}ms` }}
      className={`fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-bg text-ink transition-opacity ease-out motion-reduce:transition-none ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="mx-auto flex min-h-full w-full max-w-[430px] flex-col pb-44">
        {/* A apresentação não conta como passo: "Passo X de Y" só nas etapas de opção. */}
        <StepHeader
          step={stepIndex}
          total={stepIndex > 0 ? steps.length : 1}
          onBack={() => (stepIndex > 0 ? setStepIndex((index) => index - 1) : handleClose())}
          backLabel={stepIndex > 0 ? 'Voltar' : 'Voltar ao cardápio'}
        />

        <div className="flex flex-col gap-3.5 px-5 pt-5">
          {stepIndex === 0 ? (
            <ProductIntro product={product} onOpenImage={() => setLightboxOpen(true)} />
          ) : (
            <span className="text-sm text-muted">
              {[product.name, ...variations.map((variation) => variation.name)].join(', ')}
            </span>
          )}

          {step && (
            <div className="flex flex-col gap-1">
              <h2 className={stepTitleClass}>{step.group.name}</h2>
              <span className="text-sm text-muted">
                {step.kind === 'variation' ? 'Escolha uma opção' : addonGroupHint(step.group)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 px-5 pt-6">
          {optionsLoadError && (
            <p className="text-danger">Não foi possível carregar as opções deste produto. Volte e abra de novo.</p>
          )}

          {step?.kind === 'variation' && (
            <VariationGroupSection
              group={step.group}
              selectedOptionId={variationSelections[step.group.id]}
              onSelect={(optionId) =>
                setVariationSelections((current) => selectVariationOption(current, step.group.id, optionId))
              }
            />
          )}

          {step?.kind === 'addon' && (
            <AddonGroupSection group={step.group} selections={selections} onChange={setSelections} />
          )}

          {isLastStep && !optionsLoading && !optionsLoadError && (
            <div className="mt-3 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold">Quantidade</span>
                <div className="flex h-12 items-center rounded-[14px] border-[1.5px] border-line-strong">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    disabled={quantity <= 1}
                    aria-label="Diminuir quantidade"
                    className="grid h-12 w-12 place-items-center disabled:opacity-40"
                  >
                    <Minus size={18} aria-hidden="true" />
                  </button>
                  <span className="w-6 text-center font-semibold tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
                    disabled={quantity >= maxQuantity}
                    aria-label="Aumentar quantidade"
                    className="grid h-12 w-12 place-items-center disabled:opacity-40"
                  >
                    <Plus size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
              {stockLeft !== null && (
                <p className="text-right text-[13px] text-muted">
                  {outOfStock ? 'Você já pediu todo o estoque disponível.' : `Restam ${stockLeft} em estoque.`}
                </p>
              )}

              {showNotes || notes ? (
                <label className="flex flex-col gap-1.5 text-sm text-muted">
                  Observação
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Ex: sem açúcar, pouco gelo"
                    rows={2}
                    autoFocus={showNotes && !notes}
                    className="w-full resize-none rounded-[14px] border-[1.5px] border-line-strong bg-surface-2 px-4 py-3 text-base text-ink placeholder:text-faint focus:border-caramel focus:outline-none"
                  />
                </label>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNotes(true)}
                  className="self-start py-1 text-[15px] text-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  Adicionar observação
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <FixedBottomBar className="flex flex-col gap-2.5">
        {isLastStep && !optionsLoading && (
          <div className="flex items-baseline justify-between gap-3 text-[15px] tabular-nums">
            <span className="min-w-0 truncate text-muted">
              {quantity} {product.name}
              {choicesSummary.length > 0 && ` com ${choicesSummary.join(', ')}`}
            </span>
            <span className="shrink-0 text-right">
              {formatPrice(regularTotal)}
              {hasLover && <span className="block text-[13px] text-caramel">Lover {formatPrice(loverTotal)}</span>}
            </span>
          </div>
        )}
        <button type="button" onClick={handlePrimary} disabled={primaryDisabled} className={primaryButtonClass}>
          {optionsLoading
            ? 'Carregando opções…'
            : isLastStep
              ? 'Adicionar ao pedido'
              : stepIndex === 0
                ? 'Escolher opções'
                : 'Continuar'}
        </button>
      </FixedBottomBar>

      {lightboxOpen && product.imageUrl && (
        <ImageLightbox
          imageUrl={product.imageUrl}
          name={product.name}
          price={formatPrice(product.price)}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>,
    document.body,
  )
}

/** Apresentação do produto (igual pra todos, com ou sem opções): foto grande, nome, descrição e preço. */
function ProductIntro({ product, onOpenImage }: { product: Product; onOpenImage: () => void }) {
  const hasLover = product.loverPrice < product.price

  return (
    <div className="flex flex-col gap-4">
      {product.imageUrl ? (
        <button
          type="button"
          onClick={onOpenImage}
          aria-label={`Ver foto de ${product.name}`}
          className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-tile"
        >
          <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
        </button>
      ) : (
        <div className="grid aspect-[4/3] w-full place-items-center rounded-3xl bg-tile font-display text-7xl text-caramel" aria-hidden="true">
          {product.name.trim().charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <h2 className={stepTitleClass}>{product.name}</h2>
        {product.description && <p className="text-[15px] text-soft">{product.description}</p>}
        <p className="text-lg tabular-nums">
          <b className="font-semibold">{formatPrice(product.price)}</b>
          {hasLover && <span className="text-caramel"> Lover {formatPrice(product.loverPrice)}</span>}
        </p>
      </div>
    </div>
  )
}
