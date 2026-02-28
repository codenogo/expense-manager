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
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent Transactions</h2>
        <p className="text-sm text-slate-400">No transactions this month.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <h2 className="text-sm font-semibold text-slate-700">Recent Transactions</h2>
        <Link href="/transactions" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
          View all
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {transactions.map((tx) => (
          <Link
            key={tx.id}
            href={`/transactions/${tx.id}`}
            className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 truncate">{tx.categoryName}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {tx.accountName}
                {tx.notes && (
                  <span className="ml-2 text-slate-400">
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
              <p className="text-xs text-slate-400 mt-0.5">{tx.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
