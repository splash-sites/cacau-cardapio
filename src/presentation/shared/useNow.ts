import { useEffect, useState } from 'react'

/** Hora atual, atualizada a cada `intervalMs` — pra banner de "loja fechada" não ficar preso no instante em que a página abriu. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
