'use client'

interface SpendingTrendsProps {
  data: { month: string; label: string; expenses: number }[]
}

function formatCompact(cents: number): string {
  const amount = cents / 100
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
  return amount.toFixed(0)
}

export function SpendingTrends({ data }: SpendingTrendsProps) {
  const maxExpense = Math.max(...data.map(d => d.expenses), 1)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Monthly Spending</h2>
      <div className="flex items-end gap-2 h-40">
        {data.map((d) => {
          const height = maxExpense > 0 ? (d.expenses / maxExpense) * 100 : 0
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-slate-400">{formatCompact(d.expenses)}</span>
              <div className="w-full bg-slate-100 rounded-t flex items-end" style={{ height: '120px' }}>
                <div
                  className="w-full bg-red-400 rounded-t transition-all duration-300"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">{d.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
