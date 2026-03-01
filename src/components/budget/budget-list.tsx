'use client'

import { useState } from 'react'
import type { BudgetWithSpent } from '@/lib/actions/budgets'
import { BudgetRow } from './budget-row'

interface BudgetListProps {
  budgets: BudgetWithSpent[]
}

export function BudgetList({ budgets: initialBudgets }: BudgetListProps) {
  const [budgets, setBudgets] = useState(initialBudgets)

  function handleDelete(id: string) {
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }

  if (budgets.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-10 text-center">
        <p className="text-muted-foreground text-sm">No budgets set for this month yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {budgets.map((budget) => (
        <BudgetRow key={budget.id} budget={budget} onDelete={handleDelete} />
      ))}
    </div>
  )
}
