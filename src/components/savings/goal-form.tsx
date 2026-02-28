'use client'

import type { Tables } from '@/types/database'

interface GoalFormProps {
  goal?: Tables<'savings_goals'>
  accounts: Tables<'accounts'>[]
  action: (formData: FormData) => Promise<void>
}

export function GoalForm({ goal, accounts, action }: GoalFormProps) {
  const defaultTarget = goal ? (goal.target_amount / 100).toFixed(2) : ''

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          {goal ? 'Edit Goal' : 'New Savings Goal'}
        </h2>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={goal?.name ?? ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Emergency Fund"
            />
          </div>

          <div>
            <label
              htmlFor="target_amount"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Target Amount (KES)
            </label>
            <input
              id="target_amount"
              name="target_amount"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={defaultTarget}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-slate-700 mb-1">
              Deadline <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              defaultValue={goal?.deadline ?? ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="account_id" className="block text-sm font-medium text-slate-700 mb-1">
              Linked Account <span className="text-slate-400">(optional)</span>
            </label>
            <select
              id="account_id"
              name="account_id"
              defaultValue={goal?.account_id ?? ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- None --</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {goal ? 'Save Changes' : 'Create Goal'}
            </button>
            <a
              href="/savings"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
