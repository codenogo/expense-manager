'use client'

import { useState, useTransition } from 'react'
import { createRule, updateRule } from '@/lib/actions/rules'
import type { Tables } from '@/types/database'

interface RuleFormProps {
  categories: Tables<'categories'>[]
  rule?: Tables<'categorization_rules'>
  onDone?: () => void
}

export function RuleForm({ categories, rule, onDone }: RuleFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)

    startTransition(async () => {
      const result = rule
        ? await updateRule(rule.id, formData)
        : await createRule(formData)

      if (result?.error) {
        setError(result.error)
      } else {
        onDone?.()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="match_pattern" className="text-sm font-medium text-slate-700">
            Pattern <span className="text-red-500">*</span>
          </label>
          <input
            id="match_pattern"
            name="match_pattern"
            type="text"
            required
            defaultValue={rule?.match_pattern ?? ''}
            placeholder="e.g. Safaricom"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="match_type" className="text-sm font-medium text-slate-700">
            Match type <span className="text-red-500">*</span>
          </label>
          <select
            id="match_type"
            name="match_type"
            required
            defaultValue={rule?.match_type ?? 'contains'}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="contains">Contains</option>
            <option value="exact">Exact</option>
            <option value="starts_with">Starts with</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="category_id" className="text-sm font-medium text-slate-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue={rule?.category_id ?? ''}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="priority" className="text-sm font-medium text-slate-700">
            Priority
          </label>
          <input
            id="priority"
            name="priority"
            type="number"
            defaultValue={rule?.priority ?? 0}
            placeholder="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400">Higher number = higher priority</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Saving...' : rule ? 'Update Rule' : 'Add Rule'}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            disabled={isPending}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
