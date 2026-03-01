'use client'

import Link from 'next/link'
import { createRecurring, updateRecurring } from '@/lib/actions/recurring'
import type { Tables } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Combobox } from '@/components/ui/combobox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))
  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }))

  return (
    <div className="max-w-lg">
      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          {isEdit ? 'Edit Bill' : 'New Bill'}
        </h2>

        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-1">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={item?.name ?? ''}
              placeholder="e.g. Netflix, Rent, Electricity"
            />
          </div>

          <div>
            <Label htmlFor="amount" className="mb-1">Amount (KES)</Label>
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
            <Label className="mb-1">Frequency</Label>
            <Select name="frequency" defaultValue={item?.frequency ?? 'monthly'}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1">Next Due Date</Label>
            <DatePicker
              name="next_due_date"
              required
              defaultValue={item?.next_due_date ?? ''}
            />
          </div>

          <div>
            <Label className="mb-1">
              Category <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Combobox
              name="category_id"
              options={categoryOptions}
              defaultValue={item?.category_id ?? ''}
              placeholder="None"
              searchPlaceholder="Search categories..."
              emptyMessage="No categories found."
            />
          </div>

          <div>
            <Label className="mb-1">
              Account <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Combobox
              name="account_id"
              options={accountOptions}
              defaultValue={item?.account_id ?? ''}
              placeholder="None"
              searchPlaceholder="Search accounts..."
              emptyMessage="No accounts found."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Set an account to auto-create transactions when marking paid.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit">
              {isEdit ? 'Save Changes' : 'Create Bill'}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bills">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
