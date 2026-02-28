'use client'

import { createAccount, updateAccount } from '@/lib/actions/accounts'
import type { Tables } from '@/types/database'

const ACCOUNT_TYPE_LABELS: Record<Tables<'accounts'>['type'], string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  loan: 'Loan',
  cash: 'Cash',
  mpesa: 'M-Pesa',
}

interface AccountFormProps {
  account?: Tables<'accounts'>
}

export function AccountForm({ account }: AccountFormProps) {
  const isEdit = !!account
  const action = isEdit
    ? updateAccount.bind(null, account.id)
    : createAccount

  const defaultBalance = account ? (account.balance / 100).toFixed(2) : '0.00'

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          {isEdit ? 'Edit Account' : 'New Account'}
        </h2>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Account Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={account?.name ?? ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. KCB Savings"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">
              Account Type
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue={account?.type ?? 'checking'}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="balance" className="block text-sm font-medium text-slate-700 mb-1">
              Balance (KES)
            </label>
            <input
              id="balance"
              name="balance"
              type="number"
              step="0.01"
              required
              defaultValue={defaultBalance}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {isEdit ? 'Save Changes' : 'Create Account'}
            </button>
            <a
              href="/accounts"
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
