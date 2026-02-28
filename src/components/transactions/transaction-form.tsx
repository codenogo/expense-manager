'use client'

import Link from 'next/link'
import { createTransaction, updateTransaction } from '@/lib/actions/transactions'
import type { Tables } from '@/types/database'

interface TransactionFormProps {
  accounts: Tables<'accounts'>[]
  categories: Tables<'categories'>[]
  transaction?: Tables<'transactions'>
}

export function TransactionForm({ accounts, categories, transaction }: TransactionFormProps) {
  const isEdit = !!transaction
  const action = isEdit
    ? updateTransaction.bind(null, transaction.id)
    : createTransaction

  const defaultAmount = transaction ? (transaction.amount / 100).toFixed(2) : ''
  const today = new Date().toISOString().split('T')[0]
  const defaultDate = transaction?.date ?? today
  const defaultType = transaction?.type ?? 'expense'

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          {isEdit ? 'Edit Transaction' : 'New Transaction'}
        </h2>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {(['expense', 'income'] as const).map((t) => (
                <label
                  key={t}
                  className="flex-1 text-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    defaultChecked={defaultType === t}
                    className="sr-only peer"
                  />
                  <span className="block px-4 py-2.5 text-sm font-medium text-slate-600 peer-checked:bg-blue-600 peer-checked:text-white transition-colors capitalize">
                    {t === 'expense' ? 'Expense' : 'Income'}
                  </span>
                </label>
              ))}
            </div>
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
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={defaultDate}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="account_id" className="block text-sm font-medium text-slate-700 mb-1">
              Account
            </label>
            <select
              id="account_id"
              name="account_id"
              required
              defaultValue={transaction?.account_id ?? ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" disabled>
                Select account
              </option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-slate-700 mb-1">
              Category <span className="text-slate-400">(optional)</span>
            </label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={transaction?.category_id ?? ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
              Notes <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={transaction?.notes ?? ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add a note..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {isEdit ? 'Save Changes' : 'Add Transaction'}
            </button>
            <Link
              href="/transactions"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
