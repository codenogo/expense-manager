'use client'

import { useState, useEffect, useTransition } from 'react'
import { searchTransactions } from '@/lib/actions/transactions'
import { formatKES } from '@/components/ui/currency'
import type { Tables } from '@/types/database'

interface TransactionSearchProps {
  accounts: Tables<'accounts'>[]
  categories: Tables<'categories'>[]
}

export function TransactionSearch({ accounts, categories }: TransactionSearchProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<Tables<'transactions'>[]>([])
  const [isPending, startTransition] = useTransition()

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Search on debounced query change
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      startTransition(() => {
        setResults([])
      })
      return
    }
    startTransition(async () => {
      const data = await searchTransactions(debouncedQuery)
      setResults(data)
    })
  }, [debouncedQuery])

  const getAccountName = (id: string) =>
    accounts.find((a) => a.id === id)?.name ?? 'Unknown'
  const getCategoryName = (id: string | null) =>
    id ? categories.find((c) => c.id === id)?.name ?? 'Uncategorized' : 'Uncategorized'

  const isActive = query.trim().length > 0

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          placeholder="Search transactions by notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {isActive && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
          >
            Clear
          </button>
        )}
      </div>

      {isPending && (
        <p className="text-sm text-slate-400">Searching...</p>
      )}

      {isActive && !isPending && results.length === 0 && debouncedQuery && (
        <p className="text-sm text-slate-400">No transactions found for &quot;{debouncedQuery}&quot;</p>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          <div className="px-4 py-2 bg-slate-50 rounded-t-xl">
            <p className="text-xs font-medium text-slate-500">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          </div>
          {results.map((tx) => (
            <div key={tx.id} className="px-4 py-3 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-900 truncate">{tx.notes || 'No notes'}</p>
                <p className="text-xs text-slate-400">
                  {tx.date} &middot; {getAccountName(tx.account_id)} &middot; {getCategoryName(tx.category_id)}
                </p>
              </div>
              <div className="ml-4 text-right">
                <p className={`text-sm font-medium ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatKES(tx.amount)}
                </p>
                <span className={`text-xs px-1.5 py-0.5 rounded ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {tx.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
