import { describe, expect, it } from 'vitest'
import { resizedImageUrl } from './resizedImageUrl'

const STORAGE_URL =
  'https://ybvgjserzbbxgufbsscg.supabase.co/storage/v1/object/public/product-images/store-1/foto.png'

describe('resizedImageUrl', () => {
  it('troca /object/public/ por /render/image/public/ e adiciona width/height (2x)', () => {
    const result = resizedImageUrl(STORAGE_URL, 78, 78)
    expect(result).toBe(
      'https://ybvgjserzbbxgufbsscg.supabase.co/storage/v1/render/image/public/product-images/store-1/foto.png?width=156&height=156&resize=cover&quality=70',
    )
  })

  it('aceita quality customizada', () => {
    const result = resizedImageUrl(STORAGE_URL, 100, 100, 85)
    expect(result).toContain('quality=85')
  })

  it('null passa direto', () => {
    expect(resizedImageUrl(null, 78, 78)).toBeNull()
  })

  it('URL que não é do Storage do projeto passa sem mudar', () => {
    const external = 'https://cdn.exemplo.com/foto.png'
    expect(resizedImageUrl(external, 78, 78)).toBe(external)
  })

  it('preserva query string existente na URL original', () => {
    const withQuery = `${STORAGE_URL}?token=abc123`
    const result = resizedImageUrl(withQuery, 50, 50)
    expect(result).toContain('token=abc123')
    expect(result).toContain('width=100')
  })
})
