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
          { key: 'income', color: '#2D8659', name: 'Income' },
          { key: 'expenses', color: '#C4663A', name: 'Expenses' },
        ]}
        height={240}
      />
    </div>
  )
}
