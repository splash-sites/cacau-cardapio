import type { ReactNode } from 'react'

// Barras fixas (fixed inset-x-0) ocupam a viewport inteira, não só a coluna de
// PageShell — esse wrapper centraliza o conteúdo delas na mesma largura de
// celular, senão a barra fica esticada enquanto o resto da página fica estreita.
// className estiliza a barra visível (o div interno), não o posicionamento.
export function FixedBottomBar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 flex justify-center">
      <div className={`w-full max-w-sm ${className}`}>{children}</div>
    </div>
  )
}
