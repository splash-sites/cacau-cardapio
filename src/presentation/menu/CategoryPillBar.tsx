import { useEffect, useRef } from 'react'

// Altura real da barra (py-3 = 12px topo/base + h-11 = 44px do botão = 68px).
// MenuPage precisa desse número pra descontar da rolagem ao trocar de
// categoria — a barra é sticky (fica por cima), então rolar até o topo exato
// do cabeçalho da seção o deixaria escondido atrás dela. Se mudar o padding
// ou a altura do botão aqui, atualiza esse valor junto.
export const CATEGORY_PILL_BAR_HEIGHT_PX = 68

export function CategoryPillBar({
  categories,
  active,
  onSelect,
}: {
  categories: string[]
  active: string | null
  onSelect: (category: string) => void
}) {
  const activeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeButtonRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [active])

  if (categories.length <= 1) return null

  return (
    <nav
      aria-label="Categorias"
      className="sticky top-0 z-10 flex gap-2 overflow-x-auto bg-background px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {categories.map((category) => {
        const isActive = category === active
        return (
          <button
            key={category}
            type="button"
            ref={isActive ? activeButtonRef : null}
            aria-current={isActive}
            onClick={() => onSelect(category)}
            className={`flex h-11 min-h-11 shrink-0 items-center whitespace-nowrap rounded-full px-4 font-body text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isActive ? 'bg-accent text-accent-foreground' : 'bg-secondary/10 text-foreground/70'
            }`}
          >
            {category}
          </button>
        )
      })}
    </nav>
  )
}
