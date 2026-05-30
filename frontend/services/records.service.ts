import { calculateKpi } from '@/utils/calculate-kpi'
import { DEFAULT_ROLL_PRICE_BRL } from '@/constants/kpi'
import type { DailyRecord, MonthlyKpiEntry, ServiceResult } from './types'

const MOCK_MONTHLY_KPI: MonthlyKpiEntry[] = [
  { month: 'Fev', rolls: 2.1, costBrl: 5.25, waterLiters: 294, co2Kg: 0.13 },
  { month: 'Mar', rolls: 1.8, costBrl: 4.5, waterLiters: 252, co2Kg: 0.11 },
  { month: 'Abr', rolls: 2.4, costBrl: 6.0, waterLiters: 336, co2Kg: 0.14 },
  { month: 'Mai', rolls: 1.5, costBrl: 3.75, waterLiters: 210, co2Kg: 0.09 },
]

// TODO: replace with GET /api/records when API is ready
export async function getMonthlyKpi(): Promise<ServiceResult<MonthlyKpiEntry[]>> {
  return { data: MOCK_MONTHLY_KPI }
}

// TODO: replace with POST /api/records when API is ready
export async function createRecord(
  record: Omit<DailyRecord, 'date'>
): Promise<ServiceResult<DailyRecord>> {
  const newRecord: DailyRecord = {
    ...record,
    date: new Date().toISOString().split('T')[0],
  }
  calculateKpi(record, DEFAULT_ROLL_PRICE_BRL)
  return { data: newRecord }
}
