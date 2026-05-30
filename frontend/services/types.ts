import type { DailyRecord, KpiMetrics, UserProfile } from '@/types'

export interface ServiceResult<T> {
  data: T
  error?: string
}

export interface Partner {
  id: string
  name: string
  avatarInitials: string
  monthlyRolls: number
}

export interface Challenge {
  id: string
  title: string
  description: string
  badge: string
  target: number
  progress: number
  unit: string
  completed: boolean
}

export interface MonthlyKpiEntry {
  month: string
  rolls: number
  costBrl: number
  waterLiters: number
  co2Kg: number
}

export type { DailyRecord, KpiMetrics, UserProfile }
