import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import type { AddonGroup } from '../../domain/addon/AddonGroup'
import {
  type AddonSelections,
  addonSelectionsLoverTotal,
  addonSelectionsTotal,
  groupSelectedQuantity,
  resolveSelectedAddons,
  toggleAddonOption,
} from '../../domain/addon/addonSelection'
import { cartItemId } from '../../domain/cart/Cart'
import type { Product } from '../../domain/menu/Product'
import type { VariationGroup } from '../../domain/variation/VariationGroup'
import {
  isVariationSelectionComplete,
  resolveBasePrice,
  resolveSelectedVariations,
  selectVariationOption,
  type VariationSelections,
} from '../../domain/variation/variationSelection'
import { useCart } from '../cart/useCart'
import { formatPrice } from './formatPrice'
import { ImageLightbox } from './ImageLightbox'
import { useProductAddons } from './useProductAddons'
import { useProductVariations } from './useProductVariations'

const TRANSITION_MS = 300
const UNMOUNT_DELAY_MS = 310
const SWIPE_CLOSE_THRESHOLD_PX = 90

export function ProductDetailModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const addItem = useCart((state) => state.addItem)
  const setNote = useCart((state) => state.setNote)

  const { data: addonGroups, isPending: addonsPending, isError: addonsError } = useProductAddons(product.id)
  const { data: variationGroups, isPending: variationsPending, isError: variationsError } = useProductVariations(product.id)
  const optionsLoading = addonsPending || variationsPending
  const optionsLoadError = addonsError || variationsError

  const [visible, setVisible] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStartY = useRef<number | null>(null)

  const [selections, setSelections] = useState<AddonSelections>({})
  const [variationSelections, setVariationSelections] = useState<VariationSelections>({})
  const [notes, setNotes] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (lightboxOpen) return
      handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, UNMOUNT_DELAY_MS)
  }

  function handleTouchStart(event: React.TouchEvent) {
    dragStartY.current = event.touches[0].clientY
    setDragging(true)
  }

  function handleTouchMove(event: React.TouchEvent) {
    if (dragStartY.current === null) return
    const delta = event.touches[0].clientY - dragStartY.current
    if (delta > 0) setDragY(delta)
  }

  function handleTouchEnd() {
    if (dragY > SWIPE_CLOSE_THRESHOLD_PX) handleClose()
    else setDragY(0)
    dragStartY.current = null
    setDragging(false)
  }

  const groups = addonGroups ?? []
  const varGroups = variationGroups ?? []
  const variations = resolveSelectedVariations(variationSelections, varGroups)
  const variationsComplete = isVariationSelectionComplete(variationSelections, varGroups)

  function handleAdd() {
    const selectedAddons = resolveSelectedAddons(selections, groups)
    addItem(product, selectedAddons, variations, quantity)
    if (notes.trim()) setNote(cartItemId(product.id, selectedAddons, variations), notes.trim())
    handleClose()
  }

  const addonsTotal = addonSelectionsTotal(selections, groups)
  const addonsLoverTotal = addonSelectionsLoverTotal(selections, groups)
  const { regular: baseRegular, lover: baseLover } = resolveBasePrice(product, variations)
  const loverTotal = (baseLover + addonsLoverTotal) * quantity
  const regularTotal = (baseRegular + addonsTotal) * quantity

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="presentation">
      <div
        onClick={handleClose}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
        className={`absolute inset-0 bg-black/50 transition-opacity ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        style={{
          transitionDuration: `${TRANSITION_MS}ms`,
          transform: visible ? `translateY(${dragY}px)` : 'translateY(100%)',
        }}
        className={`relative z-10 flex max-h-[88vh] w-full max-w-sm flex-col overflow-hidden rounded-t-[20px] bg-background shadow-xl ease-out ${
          dragging ? '' : 'transition-transform'
        }`}
      >
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex shrink-0 justify-center pb-1 pt-2"
        >
          <span className="h-1.5 w-10 rounded-full bg-foreground/20" aria-hidden="true" />
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="relative aspect-square w-full shrink-0 bg-secondary/10">
            {product.imageUrl && (
              <>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label={`Ver imagem ampliada de ${product.name}`}
                  className="block h-full w-full cursor-pointer"
                >
                  <img src={product.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs"
                >
                  🔍
                </span>
              </>
            )}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Fechar"
              className="absolute right-3 top-3 flex h-9 w-9 min-h-9 items-center justify-center rounded-full bg-white/70 text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col gap-4 px-4 py-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-accent">{product.name}</h2>
              {product.description && (
                <p className="mt-1 font-body text-sm text-foreground/70">{product.description}</p>
              )}
              <p className="mt-1 font-body text-sm">
                <span className="font-medium text-primary">Lover {formatPrice(baseLover)}</span>
                <span className="text-foreground/40"> | </span>
                <span className="text-foreground/60">Não Lover {formatPrice(baseRegular)}</span>
              </p>
            </div>

            {varGroups.map((group) => (
              <VariationGroupSection
                key={group.id}
                group={group}
                selectedOptionId={variationSelections[group.id]}
                onSelect={(optionId) =>
                  setVariationSelections((current) => selectVariationOption(current, group.id, optionId))
                }
              />
            ))}

            {groups.map((group) => (
              <AddonGroupSection
                key={group.id}
                group={group}
                selections={selections}
                onChange={setSelections}
              />
            ))}

            <label className="flex flex-col gap-1">
              <span className="font-body text-xs font-bold uppercase tracking-wide text-secondary">Observações</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ex: sem açúcar, pouco gelo..."
                rows={2}
                className="w-full rounded-xl border border-secondary/15 bg-white px-3 py-2 font-body text-sm placeholder:text-foreground/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              />
            </label>

            <div className="flex items-center justify-between">
              <span className="font-body text-xs font-bold uppercase tracking-wide text-secondary">Quantidade</span>
              <div className="flex h-11 items-center gap-3 rounded-full bg-primary/10">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Diminuir quantidade"
                  className="flex h-11 w-11 items-center justify-center text-lg font-body font-medium text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  −
                </button>
                <span className="min-w-4 text-center font-body font-medium text-foreground">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Aumentar quantidade"
                  className="flex h-11 w-11 items-center justify-center text-lg font-body font-medium text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
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
          {optionsLoadError ? (
            <p className="mb-2 text-center font-body text-xs text-red-600">
              Não foi possível carregar as opções deste produto. Tente fechar e abrir de novo.
            </p>
          ) : optionsLoading ? (
            <p className="mb-2 text-center font-body text-xs text-foreground/50">Carregando opções…</p>
          ) : (
            !variationsComplete && (
              <p className="mb-2 text-center font-body text-xs text-secondary">Escolha as opções acima pra continuar</p>
            )
          )}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!variationsComplete || optionsLoadError || optionsLoading}
            className="h-11 min-h-11 w-full rounded-2xl bg-primary font-body font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60"
          >
            Adicionar ao pedido
          </button>
        </div>
      </div>

      {lightboxOpen && product.imageUrl && (
        <ImageLightbox
          imageUrl={product.imageUrl}
          name={product.name}
          price={formatPrice(product.price)}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}

function VariationGroupSection({
  group,
  selectedOptionId,
  onSelect,
}: {
  group: VariationGroup
  selectedOptionId: string | undefined
  onSelect: (optionId: string) => void
}) {
  return (
    <div>
      <p className="font-body text-xs font-bold uppercase tracking-wide text-secondary">{group.name}</p>
      <div className="mt-1 flex flex-col gap-1">
        {group.options.map((option) => {
          const selected = option.id === selectedOptionId
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(option.id)}
              className="flex min-h-11 w-full items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected ? 'border-primary' : 'border-secondary/30'
                }`}
              >
                {selected && <span className="h-3 w-3 rounded-full bg-primary" aria-hidden="true" />}
              </span>
              <span className="flex-1 font-body text-sm text-foreground">{option.name}</span>
              {option.price !== 0 && (
                <span className="flex flex-col items-end font-body text-xs leading-tight">
                  <span className="font-medium text-primary">
                    {option.loverPrice !== option.price && 'Lover* '}
                    {group.priceMode === 'replace' ? formatPrice(option.loverPrice) : `+${formatPrice(option.loverPrice)}`}
                  </span>
                  {option.loverPrice !== option.price && (
                    <span className="text-foreground/50">
                      {group.priceMode === 'replace' ? formatPrice(option.price) : `+${formatPrice(option.price)}`}
                    </span>
                  )}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AddonGroupSection({
  group,
  selections,
  onChange,
}: {
  group: AddonGroup
  selections: AddonSelections
  onChange: (selections: AddonSelections) => void
}) {
  const isFull = group.maxQuantity !== null && groupSelectedQuantity(selections, group) >= group.maxQuantity

  return (
    <div>
      <p className="font-body text-xs font-bold uppercase tracking-wide text-secondary">{group.name}</p>
      <div className="mt-1 flex flex-col gap-1">
        {group.options.map((option) => {
          const selected = (selections[option.id] ?? 0) > 0
          const blocked = !selected && group.selectionType === 'multiple' && isFull

          return (
            <button
              key={option.id}
              type="button"
              role={group.selectionType === 'single' ? 'radio' : 'checkbox'}
              aria-checked={selected}
              disabled={blocked}
              onClick={() => onChange(toggleAddonOption(selections, group, option.id))}
              className="flex min-h-11 w-full items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40"
            >
              {group.selectionType === 'single' ? (
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? 'border-primary' : 'border-secondary/30'
                  }`}
                >
                  {selected && <span className="h-3 w-3 rounded-full bg-primary" aria-hidden="true" />}
                </span>
              ) : (
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
                    selected ? 'border-primary bg-primary text-primary-foreground' : 'border-secondary/30 bg-white'
                  }`}
                >
                  {selected && <Check size={14} aria-hidden="true" />}
                </span>
              )}
              <span className="flex-1 font-body text-sm text-foreground">{option.name}</span>
              <span className="flex flex-col items-end font-body text-xs leading-tight">
                <span className="font-medium text-primary">
                  {option.loverPrice !== option.price && 'Lover* '}+{formatPrice(option.loverPrice)}
                </span>
                {option.loverPrice !== option.price && (
                  <span className="text-foreground/50">+{formatPrice(option.price)}</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
