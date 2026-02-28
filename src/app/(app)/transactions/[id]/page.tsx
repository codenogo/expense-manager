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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/transactions"
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Transactions
            </Link>
            <span className="text-slate-300">/</span>
            <h1 className="text-lg font-semibold text-slate-900">Edit Transaction</h1>
          </div>
          <span
            className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
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
          <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
            <h3 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h3>
            <p className="text-sm text-slate-500 mb-4">
              Deleting this transaction will reverse its effect on the account balance.
            </p>
            <form action={deleteWithId}>
              <button
                type="submit"
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
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
