'use client'

import { SimplePieChart } from '@/components/charts/pie-chart'

interface CategoryBreakdownProps {
  breakdown: { categoryName: string; amount: number; percentage: number }[]
}

const COLORS = ['#C4663A', '#2D8659', '#D4940A', '#6B5344', '#C53030', '#8A8279', '#B5764E', '#A3522D']

export function CategoryBreakdown({ breakdown }: CategoryBreakdownProps) {
  if (breakdown.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Spending by Category</h2>
        <p className="text-sm text-slate-400">No expenses this month.</p>
      </div>
    )
  }

  const pieData = breakdown.map((item, i) => ({
    name: item.categoryName,
    value: item.amount,
    color: COLORS[i % COLORS.length],
  }))

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Spending by Category</h2>
      <SimplePieChart data={pieData} height={280} />
    </div>
  )
}
