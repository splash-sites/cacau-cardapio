import type { BusinessHoursRepository } from '../../application/store/BusinessHoursRepository'
import type { BusinessHoursInterval, Weekday } from '../../domain/store/BusinessHours'
import { supabase } from '../supabase/client'

interface BusinessHoursRow {
  weekday: number
  opens_at: string
  closes_at: string
}

/** O banco guarda `time` com segundos ("08:00:00") — o domínio só trabalha em minuto. */
function toHHMM(time: string): string {
  return time.slice(0, 5)
}

function toInterval(row: BusinessHoursRow): BusinessHoursInterval {
  return { weekday: row.weekday as Weekday, opensAt: toHHMM(row.opens_at), closesAt: toHHMM(row.closes_at) }
}

export class SupabaseBusinessHoursRepository implements BusinessHoursRepository {
  async listBusinessHours(storeId: string): Promise<BusinessHoursInterval[]> {
    const { data, error } = await supabase
      .from('store_business_hours')
      .select('weekday, opens_at, closes_at')
      .eq('store_id', storeId)
    if (error) throw error
    return (data as BusinessHoursRow[]).map(toInterval)
  }
}

export const supabaseBusinessHoursRepository = new SupabaseBusinessHoursRepository()
