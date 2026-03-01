'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Tables } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          {debt ? 'Edit Debt' : 'New Debt'}
        </h2>

        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-1">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={debt?.name ?? ''}
              placeholder="e.g. KCB Bank Loan"
            />
          </div>

          <div>
            <Label className="mb-1">Type</Label>
            <Select
              name="type"
              defaultValue={debt?.type ?? 'bank_loan'}
              onValueChange={(value) => setType(value as Tables<'debts'>['type'])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DEBT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="balance" className="mb-1">Balance (KES)</Label>
            <Input
              id="balance"
              name="balance"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={defaultBalance}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="interest_rate" className="mb-1">
              Interest Rate (%) <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="interest_rate"
              name="interest_rate"
              type="number"
              step="0.01"
              min="0"
              defaultValue={debt?.interest_rate ?? ''}
              placeholder="e.g. 15"
            />
          </div>

          <div>
            <Label htmlFor="min_payment" className="mb-1">
              Minimum Payment (KES) <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="min_payment"
              name="min_payment"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaultMinPayment}
              placeholder="0.00"
            />
          </div>

          {type === 'informal' && (
            <div>
              <Label htmlFor="owed_to" className="mb-1">Owed To</Label>
              <Input
                id="owed_to"
                name="owed_to"
                type="text"
                defaultValue={debt?.owed_to ?? ''}
                placeholder="e.g. John Doe"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit">
              {debt ? 'Save Changes' : 'Create Debt'}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/debts">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
