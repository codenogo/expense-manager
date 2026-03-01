import Link from 'next/link'
import { formatKES } from '@/components/ui/currency'

interface RecentTransaction {
  id: string
  date: string
  amount: number
  type: 'income' | 'expense'
  categoryName: string
  accountName: string
  notes: string | null
}

interface RecentTransactionsProps {
  transactions: RecentTransaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Recent Transactions</h2>
        <p className="text-sm text-muted-foreground">No transactions this month.</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <h2 className="text-sm font-semibold text-foreground">Recent Transactions</h2>
        <Link href="/transactions" className="text-xs text-primary hover:text-primary/80 font-medium">
          View all
        </Link>
      </div>
      <div className="divide-y divide-border">
        {transactions.map((tx) => (
          <Link
            key={tx.id}
            href={`/transactions/${tx.id}`}
            className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{tx.categoryName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tx.accountName}
                {tx.notes && (
                  <span className="ml-2 text-muted-foreground/70">
                    {tx.notes.length > 30 ? tx.notes.slice(0, 30) + '...' : tx.notes}
                  </span>
                )}
              </p>
            </div>
            <div className="ml-4 text-right shrink-0">
              <span
                className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {tx.type === 'income' ? '+' : '-'}{formatKES(tx.amount)}
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">{tx.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
