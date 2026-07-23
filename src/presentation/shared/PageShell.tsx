import type { ReactNode } from 'react'

// Largura de celular sempre, mesmo em tela grande — o app é pensado só pra
// mobile (ver "Mobile-first de verdade" no CLAUDE.md), então em vez de crescer
// pra ocupar a tela toda no desktop, fica centralizado como se fosse um telefone.
export function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className="flex min-h-screen justify-center bg-background">
      <div className={`w-full max-w-sm ${className}`}>{children}</div>
    </div>
  )
}
