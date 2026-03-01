'use client'

import { SimplePieChart } from '@/components/charts/pie-chart'

interface CategoryBreakdownProps {
  breakdown: { categoryName: string; amount: number; percentage: number }[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#f87171', '#64748b', '#06b6d4', '#ec4899']

export function CategoryBreakdown({ breakdown }: CategoryBreakdownProps) {
  if (breakdown.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Spending by Category</h2>
        <p className="text-sm text-muted-foreground">No expenses this month.</p>
      </div>
    )
  }

  const pieData = breakdown.map((item, i) => ({
    name: item.categoryName,
    value: item.amount,
    color: COLORS[i % COLORS.length],
  }))

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-sm font-semibold text-foreground mb-4">Spending by Category</h2>
      <SimplePieChart data={pieData} height={280} />
    </div>
  )
}
