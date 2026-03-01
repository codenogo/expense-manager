import Link from 'next/link'
import { Currency } from '@/components/ui/currency'
import type { Tables } from '@/types/database'

interface TransactionListProps {
  transactions: Tables<'transactions'>[]
  accounts: Tables<'accounts'>[]
  categories: Tables<'categories'>[]
}

function formatGroupDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, yesterday)) return 'Yesterday'

  return date.toLocaleDateString('en-KE', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

export function TransactionList({ transactions, accounts, categories }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-10 text-center">
        <p className="text-muted-foreground text-sm">
          No transactions yet. Add your first transaction to start tracking.
        </p>
      </div>
    )
  }

  const accountMap = new Map(accounts.map((a) => [a.id, a.name]))
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

  // Group by date
  const groups = new Map<string, Tables<'transactions'>[]>()
  for (const tx of transactions) {
    const existing = groups.get(tx.date) ?? []
    existing.push(tx)
    groups.set(tx.date, existing)
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {Array.from(groups.entries()).map(([date, txs]) => (
        <div key={date}>
          <div className="px-4 py-2 bg-muted/50 border-b border-border sticky top-0">
            <span className="text-sm text-muted-foreground font-medium">{formatGroupDate(date)}</span>
          </div>
          {txs.map((tx) => {
            const categoryName = tx.category_id ? (categoryMap.get(tx.category_id) ?? 'Uncategorized') : 'Uncategorized'
            const accountName = accountMap.get(tx.account_id) ?? 'Unknown'

            return (
              <Link
                key={tx.id}
                href={`/transactions/${tx.id}`}
                className="flex items-center justify-between px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{categoryName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {accountName}
                    {tx.notes ? <span className="ml-2 text-muted-foreground/70">{tx.notes.length > 40 ? tx.notes.slice(0, 40) + '...' : tx.notes}</span> : null}
                  </p>
                </div>
                <div className="ml-4 text-right flex-shrink-0">
                  <span
                    className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    <Currency amount={tx.amount} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ))}
    </div>
  )
}
