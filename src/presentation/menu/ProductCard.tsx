import type { Product } from '../../domain/menu/Product'
import { useCart } from '../cart/useCart'
import { formatPrice } from './formatPrice'

export function ProductCard({ product }: { product: Product }) {
  const quantity = useCart((state) => state.items.find((item) => item.product.id === product.id)?.quantity ?? 0)
  const addItem = useCart((state) => state.addItem)
  const incrementItem = useCart((state) => state.incrementItem)
  const decrementItem = useCart((state) => state.decrementItem)

  return (
    <li className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary/10">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt=""
            loading="lazy"
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="font-body font-medium text-foreground">{product.name}</p>
        {product.description && (
          <p className="font-body text-sm text-foreground/70">{product.description}</p>
        )}
        <div className="mt-1 flex items-center justify-between">
          <p className="font-body font-medium text-secondary">{formatPrice(product.price)}</p>
          {quantity === 0 ? (
            <button
              type="button"
              onClick={() => addItem(product)}
              className="flex h-11 min-h-11 items-center rounded-md bg-primary px-4 font-body font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Adicionar
            </button>
          ) : (
            <div className="flex h-11 items-center gap-3 rounded-md bg-primary/10">
              <button
                type="button"
                onClick={() => decrementItem(product.id)}
                aria-label={`Remover um ${product.name}`}
                className="flex h-11 w-11 items-center justify-center text-lg font-body font-medium text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                −
              </button>
              <span className="min-w-4 text-center font-body font-medium text-foreground">{quantity}</span>
              <button
                type="button"
                onClick={() => incrementItem(product.id)}
                aria-label={`Adicionar mais um ${product.name}`}
                className="flex h-11 w-11 items-center justify-center text-lg font-body font-medium text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
