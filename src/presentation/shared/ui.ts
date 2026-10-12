// Classes compartilhadas do cardápio (identidade Ganache, tema escuro).

/** Botão da ação principal da tela: caramelo, 56px, cheio. */
export const primaryButtonClass =
  'flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-caramel px-5 text-[17px] font-semibold text-on-caramel transition-opacity disabled:opacity-50'

/** Botão secundário: contorno, mesma altura do principal. */
export const secondaryButtonClass =
  'flex h-14 w-full items-center justify-center gap-2 rounded-[18px] border-[1.5px] border-line-strong px-5 text-[17px] font-semibold text-ink transition-colors hover:bg-surface-2 disabled:opacity-50'

/** Botão quadrado de ícone (voltar, fechar, meus pedidos). */
export const iconButtonClass =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-surface-2 text-ink transition-colors hover:bg-tile'

/** Campo de texto escuro. */
export const fieldClass =
  'h-[52px] w-full rounded-[14px] border-[1.5px] border-line-strong bg-surface-2 px-4 text-base text-ink placeholder:text-faint transition-colors focus:border-caramel focus:outline-none'

export const fieldLabelClass = 'flex flex-col gap-1.5 text-sm text-muted'

/** Cartão de opção (radio/checkbox) — escolhido ganha fundo e borda caramelo. */
export function optionCardClass(selected: boolean): string {
  return `flex w-full items-center gap-3.5 rounded-[20px] border-[1.5px] px-4 py-4 text-left transition-colors ${
    selected ? 'border-caramel bg-chosen' : 'border-line-strong hover:bg-surface-2'
  }`
}

/** Título grande de etapa ("Qual tamanho?"). */
export const stepTitleClass = 'font-display text-[34px] font-bold leading-[1.05] tracking-tight'
