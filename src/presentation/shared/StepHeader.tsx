import { ChevronLeft } from 'lucide-react'
import { iconButtonClass } from './ui'

/** Topo das telas em etapas: voltar, "Passo 1 de 3" e a barrinha de progresso. */
export function StepHeader({
  step,
  total,
  onBack,
  backLabel = 'Voltar',
}: {
  step: number
  total: number
  onBack: () => void
  backLabel?: string
}) {
  return (
    <div className="flex flex-col gap-3.5 px-5 pt-4">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} aria-label={backLabel} className={iconButtonClass}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        {total > 1 && (
          <span className="text-sm text-muted">
            Passo {step} de {total}
          </span>
        )}
      </div>
      {total > 1 && (
        <div className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: total }, (_, index) => (
            <span
              key={index}
              className={`h-1 flex-1 rounded-sm transition-colors ${index < step ? 'bg-caramel' : 'bg-[#3a2822]'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
