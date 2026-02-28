'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Tables } from '@/types/database'

interface DebtFormProps {
  debt?: Tables<'debts'>
  action: (formData: FormData) => Promise<void>
}

const DEBT_TYPE_LABELS: Record<Tables<'debts'>['type'], string> = {
  bank_loan: 'Bank Loan',
  sacco_loan: 'SACCO Loan',
  credit_card: 'Credit Card',
  informal: 'Informal',
}

export function DebtForm({ debt, action }: DebtFormProps) {
  const [type, setType] = useState<Tables<'debts'>['type']>(debt?.type ?? 'bank_loan')

  const defaultBalance = debt ? (debt.balance / 100).toFixed(2) : ''
  const defaultMinPayment = debt?.min_payment ? (debt.min_payment / 100).toFixed(2) : ''

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          {debt ? 'Edit Debt' : 'New Debt'}
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
              defaultValue={debt?.name ?? ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. KCB Bank Loan"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">
              Type
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue={debt?.type ?? 'bank_loan'}
              onChange={(e) => setType(e.target.value as Tables<'debts'>['type'])}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(DEBT_TYPE_LABELS).map(([value, label]) => (
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
              min="0"
              required
              defaultValue={defaultBalance}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label
              htmlFor="interest_rate"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Interest Rate (%) <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="interest_rate"
              name="interest_rate"
              type="number"
              step="0.01"
              min="0"
              defaultValue={debt?.interest_rate ?? ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. 15"
            />
          </div>

          <div>
            <label htmlFor="min_payment" className="block text-sm font-medium text-slate-700 mb-1">
              Minimum Payment (KES) <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="min_payment"
              name="min_payment"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaultMinPayment}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {type === 'informal' && (
            <div>
              <label
                htmlFor="owed_to"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Owed To
              </label>
              <input
                id="owed_to"
                name="owed_to"
                type="text"
                defaultValue={debt?.owed_to ?? ''}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. John Doe"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {debt ? 'Save Changes' : 'Create Debt'}
            </button>
            <Link
              href="/debts"
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
