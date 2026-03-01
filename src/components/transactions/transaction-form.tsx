'use client'

import * as React from 'react'
import Link from 'next/link'
import { createTransaction, updateTransaction } from '@/lib/actions/transactions'
import type { Tables } from '@/types/database'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { Combobox } from '@/components/ui/combobox'

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

  const [type, setType] = React.useState(defaultType)

  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }))
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  return (
    <div className="max-w-lg">
      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          {isEdit ? 'Edit Transaction' : 'New Transaction'}
        </h2>

        <form action={action} className="space-y-4">
          <div>
            <Label className="mb-2">Type</Label>
            <div className="flex rounded-lg overflow-hidden">
              {(['expense', 'income'] as const).map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={type === t ? 'default' : 'outline'}
                  className={cn(
                    'flex-1 rounded-none capitalize',
                    t === 'expense' && 'rounded-l-lg',
                    t === 'income' && 'rounded-r-lg'
                  )}
                  onClick={() => setType(t)}
                >
                  {t === 'expense' ? 'Expense' : 'Income'}
                </Button>
              ))}
            </div>
            <input type="hidden" name="type" value={type} />
          </div>

          <div>
            <Label htmlFor="amount" className="mb-1">
              Amount (KES)
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={defaultAmount}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label className="mb-1">Date</Label>
            <DatePicker
              name="date"
              required
              defaultValue={defaultDate}
            />
          </div>

          <div>
            <Label className="mb-1">Account</Label>
            <Combobox
              name="account_id"
              options={accountOptions}
              defaultValue={transaction?.account_id ?? ''}
              placeholder="Select account"
              searchPlaceholder="Search accounts..."
              emptyMessage="No accounts found."
              required
            />
          </div>

          <div>
            <Label className="mb-1">
              Category <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Combobox
              name="category_id"
              options={categoryOptions}
              defaultValue={transaction?.category_id ?? ''}
              placeholder="Uncategorized"
              searchPlaceholder="Search categories..."
              emptyMessage="No categories found."
            />
          </div>

          <div>
            <Label htmlFor="notes" className="mb-1">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={transaction?.notes ?? ''}
              placeholder="Add a note..."
              className="resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit">
              {isEdit ? 'Save Changes' : 'Add Transaction'}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/transactions">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
