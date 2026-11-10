import type { BusinessHoursInterval } from '../../domain/store/BusinessHours'

export interface BusinessHoursRepository {
  listBusinessHours(storeId: string): Promise<BusinessHoursInterval[]>
}
