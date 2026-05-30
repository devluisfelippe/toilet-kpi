'use client'

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import type { MonthlyKpiEntry } from '@/services/types'

interface KpiBarChartProps {
  data: MonthlyKpiEntry[]
}

export function KpiBarChart({ data }: KpiBarChartProps) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="month"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--card-foreground))',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value} rolos`, 'Consumo']}
          />
          <Bar dataKey="rolls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
