import { Check } from 'lucide-react'
import type { AddonGroup } from '../../domain/addon/AddonGroup'
import { type AddonSelections, groupSelectedQuantity, toggleAddonOption } from '../../domain/addon/addonSelection'
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
              className="flex min-h-11 w-full items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40"
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
