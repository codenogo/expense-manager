'use client'

import Link from 'next/link'
import type { Tables } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Combobox } from '@/components/ui/combobox'

interface GoalFormProps {
  goal?: Tables<'savings_goals'>
  accounts: Tables<'accounts'>[]
  action: (formData: FormData) => Promise<void>
}

export function GoalForm({ goal, accounts, action }: GoalFormProps) {
  const defaultTarget = goal ? (goal.target_amount / 100).toFixed(2) : ''

  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }))

  return (
    <div className="max-w-lg">
      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          {goal ? 'Edit Goal' : 'New Savings Goal'}
        </h2>

        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-1">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={goal?.name ?? ''}
              placeholder="e.g. Emergency Fund"
            />
          </div>

          <div>
            <Label htmlFor="target_amount" className="mb-1">Target Amount (KES)</Label>
            <Input
              id="target_amount"
              name="target_amount"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={defaultTarget}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label className="mb-1">
              Deadline <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <DatePicker
              name="deadline"
              defaultValue={goal?.deadline ?? ''}
            />
          </div>

          <div>
            <Label className="mb-1">
              Linked Account <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Combobox
              name="account_id"
              options={accountOptions}
              defaultValue={goal?.account_id ?? ''}
              placeholder="None"
              searchPlaceholder="Search accounts..."
              emptyMessage="No accounts found."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit">
              {goal ? 'Save Changes' : 'Create Goal'}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/savings">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
