// Preço "Cacau Lovers" e adicionais são só protótipo visual — o schema hoje
// tem um preço único por produto (`products.price`) e nenhuma tabela de
// adicionais. Nada aqui é somado ao carrinho real (ver useCart); enquanto o
// schema/RPC não suportar isso de verdade, é só decoração da tela.
const LOVER_DISCOUNT = 0.2

export interface MockExtra {
  id: string
  name: string
  loverPrice: number
  regularPrice: number
}

export const MOCK_EXTRAS: MockExtra[] = [
  { id: 'chantilly', name: 'Chantilly', loverPrice: 1.5, regularPrice: 2 },
  { id: 'canela', name: 'Canela extra', loverPrice: 0.5, regularPrice: 0.8 },
  { id: 'leite-amendoas', name: 'Leite de amêndoas', loverPrice: 2, regularPrice: 2.5 },
  { id: 'chocolate', name: 'Chocolate extra', loverPrice: 1.5, regularPrice: 2 },
  { id: 'shot-espresso', name: 'Shot de espresso', loverPrice: 3, regularPrice: 4 },
]

export function mockLoverPrice(regularPrice: number): number {
  return regularPrice * (1 - LOVER_DISCOUNT)
}
