import { Fragment } from 'react'
import { ChevronLeft } from 'lucide-react'
import { iconButtonClass } from './ui'

const STEPS = ['Sacola', 'Seus dados', 'Confirmar'] as const
export type CheckoutStep = (typeof STEPS)[number]

/** Topo das 3 telas de fechamento: voltar e onde a pessoa está (Sacola / Seus dados / Confirmar). */
export function CheckoutHeader({
  current,
  onBack,
  backLabel,
}: {
  current: CheckoutStep
  onBack: () => void
  backLabel: string
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <button type="button" onClick={onBack} aria-label={backLabel} className={iconButtonClass}>
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      <ol className="flex gap-1.5 text-[13px]" aria-label="Etapas do pedido">
        {STEPS.map((step, index) => (
          <Fragment key={step}>
            {index > 0 && (
              <li aria-hidden="true" className="text-line-strong">
                /
              </li>
            )}
            <li
              aria-current={step === current ? 'step' : undefined}
              className={step === current ? 'font-semibold text-ink' : 'text-muted'}
            >
              {step}
            </li>
          </Fragment>
        ))}
      </ol>
    </div>
  )
}
