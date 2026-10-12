/** Miniatura do produto: foto, ou a inicial do nome sobre o fundo de "sem foto". */
export function ProductThumb({
  name,
  imageUrl,
  size = 76,
  dimmed = false,
}: {
  name: string
  imageUrl: string | null
  size?: number
  dimmed?: boolean
}) {
  return (
    <div
      className="grid shrink-0 place-items-center overflow-hidden rounded-[18px] bg-tile font-display"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.37) }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" loading="lazy" width={size} height={size} className="h-full w-full object-cover" />
      ) : (
        <span className={dimmed ? 'text-faint' : 'text-caramel'} aria-hidden="true">
          {name.trim().charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}
