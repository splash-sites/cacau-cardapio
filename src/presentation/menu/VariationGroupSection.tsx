import type { VariationGroup } from '../../domain/variation/VariationGroup'
import { formatPrice } from './formatPrice'

export function VariationGroupSection({
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
              className="flex min-h-11 w-full items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
