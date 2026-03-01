'use client'

import Link from 'next/link'
import { createAccount, updateAccount } from '@/lib/actions/accounts'
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
      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          {isEdit ? 'Edit Account' : 'New Account'}
        </h2>

        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-1">
              Account Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={account?.name ?? ''}
              placeholder="e.g. KCB Savings"
            />
          </div>

          <div>
            <Label className="mb-1">Account Type</Label>
            <Select name="type" defaultValue={account?.type ?? 'checking'}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="balance" className="mb-1">
              Balance (KES)
            </Label>
            <Input
              id="balance"
              name="balance"
              type="number"
              step="0.01"
              required
              defaultValue={defaultBalance}
              placeholder="0.00"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit">
              {isEdit ? 'Save Changes' : 'Create Account'}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/accounts">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
