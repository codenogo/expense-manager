import Link from 'next/link'
import { getAccounts } from '@/lib/actions/accounts'
import { getCategories } from '@/lib/actions/categories'
import { TransactionForm } from '@/components/transactions/transaction-form'

export default async function NewTransactionPage() {
  const [accounts, categories] = await Promise.all([getAccounts(), getCategories()])

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/transactions"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Transactions
          </Link>
          <span className="text-border">/</span>
          <h1 className="text-lg font-semibold text-foreground">New Transaction</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <TransactionForm accounts={accounts} categories={categories} />
      </main>
    </div>
  )
}
