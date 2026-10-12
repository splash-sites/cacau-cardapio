import type { ReactNode } from 'react'

// Barras fixas (fixed inset-x-0) ocupam a viewport inteira, não só a coluna de
// PageShell: esse wrapper centraliza o conteúdo delas na mesma largura de
// celular. O degradê de cima deixa a lista "sumir" por baixo do botão em vez de
// cortar seco. className estiliza a barra visível (o div interno).
export function FixedBottomBar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center">
      <div
        className={`pointer-events-auto w-full max-w-[430px] bg-gradient-to-t from-bg from-70% to-transparent px-5 pt-6 pb-[max(20px,env(safe-area-inset-bottom))] ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
