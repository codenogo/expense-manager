'use client'

interface IncomeVsExpensesProps {
  data: { month: string; label: string; income: number; expenses: number }[]
}

function formatCompact(cents: number): string {
  const amount = cents / 100
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
  return amount.toFixed(0)
}

export function IncomeVsExpenses({ data }: IncomeVsExpensesProps) {
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expenses]), 1)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-700">Income vs Expenses</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-400" />
            <span className="text-xs text-slate-500">Income</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-400" />
            <span className="text-xs text-slate-500">Expenses</span>
          </div>
        </div>
      </div>
      <div className="flex items-end gap-3 h-40">
        {data.map((d) => {
          const incomeHeight = maxVal > 0 ? (d.income / maxVal) * 100 : 0
          const expenseHeight = maxVal > 0 ? (d.expenses / maxVal) * 100 : 0
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex gap-1 items-end w-full" style={{ height: '120px' }}>
                <div className="flex-1 bg-slate-100 rounded-t flex items-end">
                  <div
                    className="w-full bg-emerald-400 rounded-t transition-all duration-300"
                    style={{ height: `${incomeHeight}%` }}
                  />
                </div>
                <div className="flex-1 bg-slate-100 rounded-t flex items-end">
                  <div
                    className="w-full bg-red-400 rounded-t transition-all duration-300"
                    style={{ height: `${expenseHeight}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-slate-500">{d.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
