'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { Tables } from '@/types/database'

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

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-1.5">
        <label htmlFor="filter-start" className="text-xs text-slate-500 whitespace-nowrap">
          From
        </label>
        <input
          id="filter-start"
          type="date"
          defaultValue={searchParams.get('startDate') ?? ''}
          onChange={(e) => updateFilter('startDate', e.target.value)}
          className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <label htmlFor="filter-end" className="text-xs text-slate-500 whitespace-nowrap">
          To
        </label>
        <input
          id="filter-end"
          type="date"
          defaultValue={searchParams.get('endDate') ?? ''}
          onChange={(e) => updateFilter('endDate', e.target.value)}
          className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <select
        defaultValue={searchParams.get('type') ?? ''}
        onChange={(e) => updateFilter('type', e.target.value)}
        className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <select
        defaultValue={searchParams.get('accountId') ?? ''}
        onChange={(e) => updateFilter('accountId', e.target.value)}
        className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Accounts</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get('categoryId') ?? ''}
        onChange={(e) => updateFilter('categoryId', e.target.value)}
        className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  )
}
