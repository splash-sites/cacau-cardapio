import type { VariationGroup } from '../../domain/variation/VariationGroup'
import { optionCardClass } from '../shared/ui'
import { formatPrice } from './formatPrice'

/** Opções de uma variação (obrigatória, escolhe 1), em cartões grandes de toque. */
export function VariationGroupSection({
  group,
  selectedOptionId,
  onSelect,
}: {
  group: VariationGroup
  selectedOptionId: string | undefined
  onSelect: (optionId: string) => void
}) {
  const sign = group.priceMode === 'replace' ? '' : '+ '

  return (
    <div role="radiogroup" aria-label={group.name} className="flex flex-col gap-3">
      {group.options.map((option) => {
        const selected = option.id === selectedOptionId
        const hasLover = option.loverPrice < option.price
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(option.id)}
            className={optionCardClass(selected)}
          >
            <span
              aria-hidden="true"
              className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2 ${
                selected ? 'border-caramel' : 'border-line-strong'
              }`}
            >
              {selected && <span className="h-3 w-3 rounded-full bg-caramel" />}
            </span>
            <span className="flex-1 text-[17px] font-semibold">{option.name}</span>
            {option.price !== 0 && (
              <span className="flex flex-col items-end tabular-nums">
                <b className="text-base font-semibold">
                  {sign}
                  {formatPrice(option.price)}
                </b>
                {hasLover && (
                  <span className="text-[13px] text-caramel">
                    Lover {sign}
                    {formatPrice(option.loverPrice)}
                  </span>
                )}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
