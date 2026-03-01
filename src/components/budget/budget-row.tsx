'use client'

import { toast } from 'sonner'
import type { BudgetWithSpent } from '@/lib/actions/budgets'
import { deleteBudget } from '@/lib/actions/budgets'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ProgressBar } from '@/components/ui/progress-bar'
import { formatKES } from '@/components/ui/currency'

interface BudgetRowProps {
  budget: BudgetWithSpent
  onDelete?: (id: string) => void
}

export function BudgetRow({ budget, onDelete }: BudgetRowProps) {
  const remaining = budget.amount - budget.spent
  const isOver = remaining < 0
  const { confirm, dialogProps } = useConfirmDialog()

  async function handleDelete() {
    const ok = await confirm({
      title: `Remove ${budget.category_name} budget?`,
      description: 'This will remove the budget for this category.',
      confirmLabel: 'Remove',
      variant: 'danger',
    })
    if (!ok) return

    const result = await deleteBudget(budget.id)
    if (result?.error) {
      toast.error(result.error)
      return
    }
    onDelete?.(budget.id)
  }

  return (
    <div className="flex flex-col gap-2 px-4 py-4 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-900">{budget.category_name}</span>
        <button
          onClick={handleDelete}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          aria-label={`Delete ${budget.category_name} budget`}
        >
          Remove
        </button>
      </div>
      <ProgressBar value={budget.spent} max={budget.amount} />
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {formatKES(budget.spent)} <span className="text-slate-400">of</span> {formatKES(budget.amount)}
        </span>
        <span className={isOver ? 'text-red-500 font-medium' : 'text-slate-500'}>
          {isOver ? `${formatKES(Math.abs(remaining))} over` : `${formatKES(remaining)} left`}
        </span>
      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  )
}
