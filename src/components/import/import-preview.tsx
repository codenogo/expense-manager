'use client'

import { useState, useTransition } from 'react'
import { bulkCreateTransactions, type ImportRow } from '@/lib/actions/import'
import { categorize, type CategorizationRule } from '@/lib/categorizer'
import type { Tables } from '@/types/database'
import { formatKES } from '@/components/ui/currency'

interface MappedTransaction {
  date: string
  amount: number // cents
  type: 'income' | 'expense'
  notes: string | null
}

interface ImportPreviewProps {
  transactions: MappedTransaction[]
  accounts: Tables<'accounts'>[]
  categories: Tables<'categories'>[]
  rules: CategorizationRule[]
  onBack: () => void
  onDone: (imported: number) => void
}

export function ImportPreview({
  transactions,
  accounts,
  categories,
  rules,
  onBack,
  onDone,
}: ImportPreviewProps) {
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id ?? '')
  const [defaultCategoryId, setDefaultCategoryId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleImport() {
    if (!accountId) {
      setError('Please select a target account.')
      return
    }
    setError(null)

    const rows: ImportRow[] = transactions.map((tx) => ({
      date: tx.date,
      amount: tx.amount,
      type: tx.type,
      accountId,
      categoryId: categorize(tx.notes ?? '', rules) ?? (defaultCategoryId || null),
      notes: tx.notes,
    }))

    startTransition(async () => {
      const result = await bulkCreateTransactions(accountId, rows)
      if (result.error) {
        setError(result.error)
      } else {
        onDone(result.imported)
      }
    })
  }

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Preview Import</h2>
        <p className="text-sm text-slate-500 mt-1">
          Review {transactions.length} transactions before importing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Target account <span className="text-red-500">*</span>
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select account --</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Default category (optional)</label>
          <select
            value={defaultCategoryId}
            onChange={(e) => setDefaultCategoryId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- None --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <span className="text-emerald-600 font-medium">Income: {formatKES(totalIncome)}</span>
        <span className="text-red-600 font-medium">Expenses: {formatKES(totalExpenses)}</span>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Type</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Amount</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {transactions.map((tx, i) => (
                <tr key={`${tx.date}-${tx.type}-${tx.amount}-${i}`}>
                  <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{tx.date}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-medium whitespace-nowrap ${
                      tx.type === 'income' ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {tx.type === 'expense' && '-'}{formatKES(tx.amount)}
                  </td>
                  <td className="px-3 py-2 text-slate-500 max-w-xs truncate">{tx.notes ?? '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isPending}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleImport}
          disabled={isPending || !accountId}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Importing...' : `Import ${transactions.length} Transactions`}
        </button>
      </div>
    </div>
  )
}
