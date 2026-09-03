// Imagem crua do Supabase Storage pode vir enorme (foto de celular sem
// compressão, vistas de até 14MB pro upload real de um cliente) — baixar isso
// só pra mostrar uma miniatura de 78x78 é o principal motivo do cardápio
// carregar devagar. O Storage do Supabase tem endpoint de transformação de
// imagem sob demanda (/storage/v1/render/image/...), habilitado neste
// projeto (confirmado: 1.4MB → ~40KB só ajustando width/height) — troca
// só a URL, sem precisar reprocessar nada no upload.
const OBJECT_PATH = '/storage/v1/object/public/'
const RENDER_PATH = '/storage/v1/render/image/public/'

// width/height em CSS px do maior uso — dobra pra 2x internamente (tela
// retina/alta densidade), então cada chamador não precisa calcular isso.
export function resizedImageUrl(url: string | null, width: number, height: number, quality = 70): string | null {
  if (!url) return null
  if (!url.includes(OBJECT_PATH)) return url // não é do nosso Storage — não mexe

  const [base, query] = url.split('?')
  const params = new URLSearchParams(query)
  params.set('width', String(width * 2))
  params.set('height', String(height * 2))
  params.set('resize', 'cover')
  params.set('quality', String(quality))

  return `${base.replace(OBJECT_PATH, RENDER_PATH)}?${params.toString()}`
}
