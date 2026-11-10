/** 0 = domingo .. 6 = sábado (mesma convenção do `Date.getDay()` e do `extract(dow from ...)` do Postgres). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** Um intervalo em que a loja aceita pedido. "HH:MM" (sem segundos). */
export interface BusinessHoursInterval {
  weekday: Weekday
  opensAt: string
  closesAt: string
}
