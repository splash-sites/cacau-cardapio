import { Check } from 'lucide-react'
import type { AddonGroup } from '../../domain/addon/AddonGroup'
import { type AddonSelections, groupSelectedQuantity, toggleAddonOption } from '../../domain/addon/addonSelection'
import { optionCardClass } from '../shared/ui'
import { formatPrice } from './formatPrice'

export function AddonGroupSection({
  group,
  selections,
  onChange,
}: {
  group: AddonGroup
  selections: AddonSelections
  onChange: (selections: AddonSelections) => void
}) {
  const isFull = group.maxQuantity !== null && groupSelectedQuantity(selections, group) >= group.maxQuantity
  const single = group.selectionType === 'single'

  return (
    <div role={single ? 'radiogroup' : 'group'} aria-label={group.name} className="flex flex-col gap-3">
      {group.options.map((option) => {
        const selected = (selections[option.id] ?? 0) > 0
        const blocked = !selected && !single && isFull
        const hasLover = option.loverPrice < option.price

        return (
          <button
            key={option.id}
            type="button"
            role={single ? 'radio' : 'checkbox'}
            aria-checked={selected}
            disabled={blocked}
            onClick={() => onChange(toggleAddonOption(selections, group, option.id))}
            className={`${optionCardClass(selected)} disabled:opacity-40`}
          >
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="text-[17px] font-semibold">{option.name}</span>
              <span className="text-sm tabular-nums">
                + {formatPrice(option.price)}
                {hasLover && <span className="text-caramel"> Lover {formatPrice(option.loverPrice)}</span>}
              </span>
            </span>
            <span
              aria-hidden="true"
              className={`grid h-[22px] w-[22px] shrink-0 place-items-center border-2 ${single ? 'rounded-full' : 'rounded-md'} ${
                selected ? 'border-caramel bg-caramel text-on-caramel' : 'border-line-strong'
              }`}
            >
              {selected && (single ? <span className="h-2.5 w-2.5 rounded-full bg-on-caramel" /> : <Check size={14} strokeWidth={3} />)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
