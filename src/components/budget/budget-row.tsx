'use client'

import type { BudgetWithSpent } from '@/lib/actions/budgets'
import { deleteBudget } from '@/lib/actions/budgets'
import { ProgressBar } from '@/components/ui/progress-bar'
import { formatKES } from '@/components/ui/currency'

interface BudgetRowProps {
  budget: BudgetWithSpent
  onDelete?: (id: string) => void
}

export function BudgetRow({ budget, onDelete }: BudgetRowProps) {
  const remaining = budget.amount - budget.spent
  const isOver = remaining < 0

  async function handleDelete() {
    const result = await deleteBudget(budget.id)
    if (result?.error) {
      alert(result.error)
      return
    }
    onDelete?.(budget.id)
  }

  return (
    <div className="flex flex-col gap-2 px-4 py-4 border-b border-border last:border-b-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{budget.category_name}</span>
        <button
          onClick={handleDelete}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          aria-label={`Delete ${budget.category_name} budget`}
        >
          Remove
        </button>
      </div>
      <ProgressBar value={budget.spent} max={budget.amount} />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {formatKES(budget.spent)} <span className="text-muted-foreground/70">of</span> {formatKES(budget.amount)}
        </span>
        <span className={isOver ? 'text-red-500 font-medium' : 'text-muted-foreground'}>
          {isOver ? `${formatKES(Math.abs(remaining))} over` : `${formatKES(remaining)} left`}
        </span>
      </div>
    </div>
  )
}
