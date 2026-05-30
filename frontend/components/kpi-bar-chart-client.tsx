'use client'

import dynamic from 'next/dynamic'
import type { MonthlyKpiEntry } from '@/services/types'

const KpiBarChart = dynamic(
  () => import('@/components/kpi-bar-chart').then((m) => m.KpiBarChart),
  { ssr: false }
)

interface KpiBarChartClientProps {
  data: MonthlyKpiEntry[]
}

export function KpiBarChartClient({ data }: KpiBarChartClientProps) {
  return <KpiBarChart data={data} />
}
