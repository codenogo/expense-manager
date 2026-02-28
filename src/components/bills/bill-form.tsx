'use client'

import { createRecurring, updateRecurring } from '@/lib/actions/recurring'
import type { Tables } from '@/types/database'

interface BillFormProps {
  accounts: Tables<'accounts'>[]
  categories: Tables<'categories'>[]
  item?: Tables<'recurring_items'>
}

const FREQUENCY_LABELS: Record<Tables<'recurring_items'>['frequency'], string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

export function BillForm({ accounts, categories, item }: BillFormProps) {
  const isEdit = !!item
  const action = isEdit ? updateRecurring.bind(null, item.id) : createRecurring

  const defaultAmount = item ? (item.amount / 100).toFixed(2) : ''

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          {isEdit ? 'Edit Bill' : 'New Bill'}
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
              defaultValue={item?.name ?? ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Netflix, Rent, Electricity"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
              Amount (KES)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={defaultAmount}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-slate-700 mb-1">
              Frequency
            </label>
            <select
              id="frequency"
              name="frequency"
              required
              defaultValue={item?.frequency ?? 'monthly'}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="next_due_date" className="block text-sm font-medium text-slate-700 mb-1">
              Next Due Date
            </label>
            <input
              id="next_due_date"
              name="next_due_date"
              type="date"
              required
              defaultValue={item?.next_due_date ?? ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-slate-700 mb-1">
              Category <span className="text-slate-400">(optional)</span>
            </label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={item?.category_id ?? ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">None</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="account_id" className="block text-sm font-medium text-slate-700 mb-1">
              Account <span className="text-slate-400">(optional)</span>
            </label>
            <select
              id="account_id"
              name="account_id"
              defaultValue={item?.account_id ?? ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">None</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Set an account to auto-create transactions when marking paid.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {isEdit ? 'Save Changes' : 'Create Bill'}
            </button>
            <a
              href="/bills"
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
