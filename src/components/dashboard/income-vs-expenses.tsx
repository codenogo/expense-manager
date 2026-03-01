'use client'

import { SimpleBarChart } from '@/components/charts/bar-chart'

interface IncomeVsExpensesProps {
  data: { month: string; label: string; income: number; expenses: number }[]
}

export function IncomeVsExpenses({ data }: IncomeVsExpensesProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Income vs Expenses</h2>
      <SimpleBarChart
        data={data}
        xKey="label"
        bars={[
          { key: 'income', color: '#10b981', name: 'Income' },
          { key: 'expenses', color: '#f87171', name: 'Expenses' },
        ]}
        height={240}
      />
    </div>
  )
}
