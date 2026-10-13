/** Assinatura discreta da plataforma no rodapé das telas de entrada. O cardápio é da loja. */
export function PoweredBy() {
  return (
    <p className="mt-auto flex items-center justify-center gap-1.5 px-5 pt-8 pb-[max(20px,env(safe-area-inset-bottom))] text-xs text-faint">
      feito com
      <img src="/prestio-logo-negativo.svg" alt="Prestio" className="h-4 w-auto opacity-80" />
    </p>
  )
}
