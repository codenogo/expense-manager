'use client'

import { useState, useTransition } from 'react'
import { bulkCreateTransactions, type ImportRow } from '@/lib/actions/import'
import { categorize, type CategorizationRule } from '@/lib/categorizer'
import type { Tables } from '@/types/database'
import { formatKES } from '@/components/ui/currency'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'

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

  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }))
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

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
        <h2 className="text-base font-semibold text-foreground">Preview Import</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review {transactions.length} transactions before importing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="mb-1">
            Target account <span className="text-destructive">*</span>
          </Label>
          <Combobox
            options={accountOptions}
            defaultValue={accountId}
            onChange={(val) => setAccountId(val)}
            placeholder="Select account"
            searchPlaceholder="Search accounts..."
            emptyMessage="No accounts found."
          />
        </div>

        <div>
          <Label className="mb-1">Default category (optional)</Label>
          <Combobox
            options={categoryOptions}
            defaultValue={defaultCategoryId}
            onChange={(val) => setDefaultCategoryId(val)}
            placeholder="None"
            searchPlaceholder="Search categories..."
            emptyMessage="No categories found."
          />
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <span className="text-emerald-600 font-medium">Income: {formatKES(totalIncome)}</span>
        <span className="text-red-600 font-medium">Expenses: {formatKES(totalExpenses)}</span>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {transactions.map((tx, i) => (
                <tr key={`${tx.date}-${tx.type}-${tx.amount}-${i}`}>
                  <td className="px-3 py-2 text-foreground whitespace-nowrap">{tx.date}</td>
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
                  <td className="px-3 py-2 text-muted-foreground max-w-xs truncate">{tx.notes ?? '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button onClick={handleImport} disabled={isPending || !accountId}>
          {isPending ? 'Importing...' : `Import ${transactions.length} Transactions`}
        </Button>
      </div>
    </div>
  )
}
