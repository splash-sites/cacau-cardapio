import type { Product } from '../../domain/menu/Product'

export type MenuRow = { type: 'category'; category: string } | { type: 'product'; product: Product }

export function buildRows(groups: Map<string, Product[]>): MenuRow[] {
  const rows: MenuRow[] = []
  for (const [category, products] of groups.entries()) {
    rows.push({ type: 'category', category })
    for (const product of products) {
      rows.push({ type: 'product', product })
    }
  }
  return rows
}

// Categoria "atual" pra pílula ativa (scroll-spy): a linha em `index` pode
// ser um produto no meio de uma categoria, não o cabeçalho dela — anda pra
// trás até achar o cabeçalho mais próximo. Não depende de o cabeçalho estar
// de fato montado no DOM (a lista é virtualizada, o cabeçalho pode já ter
// saído da tela por cima) — só depende da ordem de `rows`, que é estável.
export function nearestCategoryLabel(rows: MenuRow[], index: number): string | null {
  for (let i = Math.min(index, rows.length - 1); i >= 0; i--) {
    const row = rows[i]
    if (row?.type === 'category') return row.category
  }
  return null
}

// Índice de cada cabeçalho de categoria em `rows` — pra rowVirtualizer.scrollToIndex
// saber pra onde rolar quando o cliente toca numa pílula.
export function categoryRowIndex(rows: MenuRow[]): Map<string, number> {
  const map = new Map<string, number>()
  rows.forEach((row, index) => {
    if (row.type === 'category' && !map.has(row.category)) map.set(row.category, index)
  })
  return map
}
