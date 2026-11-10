import type { BusinessHoursInterval } from './BusinessHours'

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** `date` é sempre lido no horário local de quem chama (navegador do cliente). */
export function isStoreOpenAt(hours: BusinessHoursInterval[], date: Date): boolean {
  const weekday = date.getDay()
  const minutes = date.getHours() * 60 + date.getMinutes()
  return hours.some(
    (interval) => interval.weekday === weekday && toMinutes(interval.opensAt) <= minutes && minutes < toMinutes(interval.closesAt),
  )
}

/** "08:00–12:00" e "14:00–18:00" juntos, ou `null` se a loja não abre nesse dia. */
export function describeHoursForWeekday(hours: BusinessHoursInterval[], weekday: BusinessHoursInterval['weekday']): string | null {
  const todays = hours.filter((interval) => interval.weekday === weekday).sort((a, b) => a.opensAt.localeCompare(b.opensAt))
  if (todays.length === 0) return null
  return todays.map((interval) => `${interval.opensAt}–${interval.closesAt}`).join(' e ')
}
