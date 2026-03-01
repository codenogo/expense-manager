'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { Tables } from '@/types/database'
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

interface TransactionFiltersProps {
  accounts: Tables<'accounts'>[]
  categories: Tables<'categories'>[]
}

export function TransactionFilters({ accounts, categories }: TransactionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/transactions?${params.toString()}`)
    },
    [router, searchParams]
  )

  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }))
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1">
        <Label className="text-xs">From</Label>
        <DatePicker
          defaultValue={searchParams.get('startDate') ?? ''}
          onChange={(value) => updateFilter('startDate', value)}
          className="h-8 text-xs"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">To</Label>
        <DatePicker
          defaultValue={searchParams.get('endDate') ?? ''}
          onChange={(value) => updateFilter('endDate', value)}
          className="h-8 text-xs"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">Type</Label>
        <Select
          defaultValue={searchParams.get('type') ?? ''}
          onValueChange={(value) => updateFilter('type', value === 'all' ? '' : value)}
        >
          <SelectTrigger size="sm" className="text-xs">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">Account</Label>
        <Combobox
          options={accountOptions}
          defaultValue={searchParams.get('accountId') ?? ''}
          placeholder="All Accounts"
          searchPlaceholder="Search accounts..."
          emptyMessage="No accounts found."
          onChange={(value) => updateFilter('accountId', value)}
          className="h-8 text-xs"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">Category</Label>
        <Combobox
          options={categoryOptions}
          defaultValue={searchParams.get('categoryId') ?? ''}
          placeholder="All Categories"
          searchPlaceholder="Search categories..."
          emptyMessage="No categories found."
          onChange={(value) => updateFilter('categoryId', value)}
          className="h-8 text-xs"
        />
      </div>
    </div>
  )
}
