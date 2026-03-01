import { formatKES } from '@/components/ui/currency'
import { ProgressBar } from '@/components/ui/progress-bar'
import type { BudgetWithSpent } from '@/lib/actions/budgets'

interface BudgetSummaryProps {
  budgets: BudgetWithSpent[]
}

export function BudgetSummary({ budgets }: BudgetSummaryProps) {
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalRemaining = totalBudgeted - totalSpent

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-sm font-semibold text-foreground mb-4">Overall Budget</h2>
      <div className="space-y-3">
        <ProgressBar value={totalSpent} max={totalBudgeted} />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Spent: <span className="font-medium text-foreground">{formatKES(totalSpent)}</span>
          </span>
          <span className="text-muted-foreground">
            Budget: <span className="font-medium text-foreground">{formatKES(totalBudgeted)}</span>
          </span>
        </div>
        <div className="pt-2 border-t border-border">
          <span className={`text-sm font-medium ${totalRemaining < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            {totalRemaining < 0
              ? `${formatKES(Math.abs(totalRemaining))} over budget`
              : `${formatKES(totalRemaining)} remaining`}
          </span>
        </div>
      </div>
    </div>
  )
}
