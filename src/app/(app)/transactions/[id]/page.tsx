import Link from 'next/link'
import { getTransaction, deleteTransaction } from '@/lib/actions/transactions'
import { getAccounts } from '@/lib/actions/accounts'
import { getCategories } from '@/lib/actions/categories'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { Currency } from '@/components/ui/currency'

interface TransactionDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  const { id } = await params
  const [transaction, accounts, categories] = await Promise.all([
    getTransaction(id),
    getAccounts(),
    getCategories(),
  ])

  const deleteWithId = deleteTransaction.bind(null, id)

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/transactions"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Transactions
            </Link>
            <span className="text-border">/</span>
            <h1 className="text-lg font-semibold text-foreground">Edit Transaction</h1>
          </div>
          <span
            className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}
          >
            {transaction.type === 'income' ? '+' : '-'}
            <Currency amount={transaction.amount} />
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <TransactionForm
          accounts={accounts}
          categories={categories}
          transaction={transaction}
        />

        <div className="max-w-lg">
          <div className="bg-card rounded-xl shadow-sm p-6 border border-destructive/20">
            <h3 className="text-sm font-semibold text-destructive mb-1">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Deleting this transaction will reverse its effect on the account balance.
            </p>
            <form action={deleteWithId}>
              <button
                type="submit"
                className="rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                Delete Transaction
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
