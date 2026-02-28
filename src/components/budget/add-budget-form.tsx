'use client'

import { useActionState } from 'react'
import { setBudget } from '@/lib/actions/budgets'
import type { Tables } from '@/types/database'

type ActionState = { error?: string } | null

interface AddBudgetFormProps {
  categories: Tables<'categories'>[]
  budgetedCategoryIds: string[]
  month: string
}

export function AddBudgetForm({ categories, budgetedCategoryIds, month }: AddBudgetFormProps) {
  const availableCategories = categories.filter((c) => !budgetedCategoryIds.includes(c.id))

  async function formAction(_state: ActionState, formData: FormData): Promise<ActionState> {
    const result = await setBudget(formData)
    return result ?? null
  }

  const [state, action, pending] = useActionState<ActionState, FormData>(formAction, null)

  if (availableCategories.length === 0) {
    return (
      <p className="text-sm text-slate-500 italic">All categories have budgets set for this month.</p>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="month" value={month} />

      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          name="category_id"
          required
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select category…</option>
          {availableCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="amount"
          required
          min="0.01"
          step="0.01"
          placeholder="Amount (KES)"
          className="w-full sm:w-40 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <button
          type="submit"
          disabled={pending}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Adding…' : 'Add Budget'}
        </button>
      </div>
    </form>
  )
}
