import type { ReactNode } from 'react'

/**
 * Topo das telas de entrada (loja, mesa). Enquanto a loja não tem foto cadastrada,
 * o espaço da foto vira um arranjo de blocos nas cores da marca.
 */
export function StoreHero({
  storeName,
  title,
  height,
  children,
}: {
  storeName: string
  title: ReactNode
  height: 'tall' | 'short'
  children?: ReactNode
}) {
  return (
    <div
      className={`relative flex items-end overflow-hidden bg-tile px-5 pb-6 ${height === 'tall' ? 'h-[min(380px,46dvh)]' : 'h-[min(300px,38dvh)]'}`}
    >
      <div aria-hidden="true" className="absolute -right-10 -top-6 h-56 w-44 rotate-6 rounded-[28px] bg-caramel" />
      <div aria-hidden="true" className="absolute right-28 top-16 h-24 w-24 rounded-[20px] bg-[#4f342b]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-tile to-transparent" />
      <div className="relative flex flex-col gap-1.5">
        {children}
        <h1 className="font-display text-[40px] font-bold leading-none tracking-tight">{title}</h1>
        {title !== storeName && <span className="text-sm text-soft">{storeName}</span>}
      </div>
    </div>
  )
}
