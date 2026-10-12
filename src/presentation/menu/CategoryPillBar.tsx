import { useEffect, useRef } from 'react'

// Altura real da barra (h-11 = 44px das abas + pt-2 = 8px = 52px). MenuPage
// precisa desse número pra descontar da rolagem ao trocar de categoria: a barra
// é sticky (fica por cima), então rolar até o topo exato do cabeçalho da seção o
// deixaria escondido atrás dela. Se mudar a altura aqui, atualiza esse valor junto.
export const CATEGORY_PILL_BAR_HEIGHT_PX = 52

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
      className="scrollbar-hidden sticky top-0 z-10 flex gap-5 overflow-x-auto border-b border-line bg-bg px-5 pt-2"
      style={{ height: CATEGORY_PILL_BAR_HEIGHT_PX }}
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
            className={`-mb-px flex h-11 shrink-0 items-center whitespace-nowrap border-b-2 text-[15px] transition-colors ${
              isActive ? 'border-caramel font-semibold text-ink' : 'border-transparent text-faint'
            }`}
          >
            {category}
          </button>
        )
      })}
    </nav>
  )
}
