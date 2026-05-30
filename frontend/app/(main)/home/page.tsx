import { getMonthlyKpi } from '@/services/records.service'
import { getChallenges } from '@/services/challenges.service'
import { getDailyQuote } from '@/constants/quotes'
import { ChallengesSection } from '@/components/challenges-section'
import { DailyRecordDialog } from '@/components/daily-record-dialog'
import { DailyQuote } from '@/components/daily-quote'
import { KpiBarChartClient } from '@/components/kpi-bar-chart-client'

export default async function HomePage() {
  const [kpiResult, challengesResult] = await Promise.all([
    getMonthlyKpi(),
    getChallenges(),
  ])
  const quote = getDailyQuote()

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Consumo mensal — rolos
        </h1>
        <KpiBarChartClient data={kpiResult.data} />
      </div>

      <DailyRecordDialog />

      <ChallengesSection challenges={challengesResult.data} />

      <DailyQuote quote={quote} />
    </div>
  )
}
