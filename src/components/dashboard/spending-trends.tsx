'use client'

import { SimpleBarChart } from '@/components/charts/bar-chart'

interface SpendingTrendsProps {
  data: { month: string; label: string; expenses: number }[]
}

export function SpendingTrends({ data }: SpendingTrendsProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Monthly Spending</h2>
      <SimpleBarChart
        data={data}
        xKey="label"
        bars={[{ key: 'expenses', color: '#C4663A', name: 'Expenses' }]}
        height={240}
      />
    </div>
  )
}
