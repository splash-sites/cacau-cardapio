// Banco tem nome de produto cadastrado com capitalização inconsistente
// (TUDO MAIÚSCULO, tudo minúsculo, Title Case, dependendo de quem cadastrou
// no admin) — padroniza pra exibição: primeira letra maiúscula, resto
// minúsculo. Aplicado uma vez só, na borda onde o dado entra no app
// (SupabaseProductRepository), então o resto do app (domain, presentation)
// já lê o nome sempre normalizado, sem precisar chamar isso em cada tela.
export function formatProductName(name: string): string {
  if (!name) return name
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
}
