export interface DailyRecord {
  date: string
  bathroomTrips: number
  handTurns: number
  usedWater: boolean
}

export interface UserProfile {
  rollPriceBrl: number
  consumptionProfile: 'economic' | 'moderate' | 'high'
}

export interface KpiMetrics {
  sheetsPerUse: number
  sheetsPerDay: number
  sheetsPerMonth: number
  rollsPerMonth: number
  costPerMonth: number
  waterLitersPerMonth: number
  co2KgPerMonth: number
}

export type ConsumptionProfile = 'economic' | 'moderate' | 'high'

export interface ConsumptionProfileConfig {
  label: string
  sheetsPerDay: number
  rollsPerYear: number
}
