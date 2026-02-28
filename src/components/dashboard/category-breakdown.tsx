import { formatKES } from '@/components/ui/currency'

interface CategoryBreakdownProps {
  breakdown: { categoryName: string; amount: number; percentage: number }[]
}

export function CategoryBreakdown({ breakdown }: CategoryBreakdownProps) {
  if (breakdown.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Spending by Category</h2>
        <p className="text-sm text-slate-400">No expenses this month.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Spending by Category</h2>
      <div className="space-y-3">
        {breakdown.map((item) => (
          <div key={item.categoryName}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-700">{item.categoryName}</span>
              <span className="text-sm font-medium text-slate-900">{formatKES(item.amount)}</span>
            </div>
            <div className="bg-slate-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{item.percentage}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}
