'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { setBudget } from '@/lib/actions/budgets'
import type { Tables } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

  if (categories.length === 0) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-sm text-muted-foreground">No categories yet. Create categories to start budgeting.</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/categories">Create Categories</Link>
        </Button>
      </div>
    )
  }

  if (availableCategories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">All categories have budgets set for this month.</p>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="month" value={month} />

      {state?.error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Select name="category_id" required>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select category..." />
          </SelectTrigger>
          <SelectContent>
            {availableCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          name="amount"
          required
          min="0.01"
          step="0.01"
          placeholder="Amount (KES)"
          className="w-full sm:w-40"
        />

        <Button type="submit" disabled={pending}>
          {pending ? 'Adding...' : 'Add Budget'}
        </Button>
      </div>
    </form>
  )
}
