import {
  SHEETS_PER_HAND_TURN,
  SHEETS_PER_ROLL,
  WATER_LITERS_PER_ROLL,
  CO2_KG_PER_ROLL,
  DAYS_PER_MONTH,
} from '@/constants/kpi'
import type { DailyRecord, KpiMetrics } from '@/types'

export function calculateKpi(
  record: Pick<DailyRecord, 'bathroomTrips' | 'handTurns'>,
  rollPriceBrl: number,
): KpiMetrics {
  const sheetsPerUse = record.handTurns * SHEETS_PER_HAND_TURN
  const sheetsPerDay = record.bathroomTrips * sheetsPerUse
  const sheetsPerMonth = sheetsPerDay * DAYS_PER_MONTH
  const rollsPerMonth = sheetsPerMonth / SHEETS_PER_ROLL
  const costPerMonth = rollsPerMonth * rollPriceBrl
  const waterLitersPerMonth = rollsPerMonth * WATER_LITERS_PER_ROLL
  const co2KgPerMonth = rollsPerMonth * CO2_KG_PER_ROLL

  return {
    sheetsPerUse,
    sheetsPerDay,
    sheetsPerMonth,
    rollsPerMonth,
    costPerMonth,
    waterLitersPerMonth,
    co2KgPerMonth,
  }
}
