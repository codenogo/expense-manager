import Link from 'next/link'
import { Suspense } from 'react'
import { getTransactions } from '@/lib/actions/transactions'
import { getAccounts } from '@/lib/actions/accounts'
import { getCategories } from '@/lib/actions/categories'
import { TransactionList } from '@/components/transactions/transaction-list'
import { TransactionFilters } from '@/components/transactions/transaction-filters'
import { TransactionSearch } from '@/components/transactions/transaction-search'

interface TransactionsPageProps {
  searchParams: Promise<{
    startDate?: string
    endDate?: string
    categoryId?: string
    accountId?: string
    type?: string
  }>
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const params = await searchParams
  const filters = {
    startDate: params.startDate,
    endDate: params.endDate,
    categoryId: params.categoryId,
    accountId: params.accountId,
    type: params.type as 'income' | 'expense' | undefined,
  }

  const [transactions, accounts, categories] = await Promise.all([
    getTransactions(filters),
    getAccounts(),
    getCategories(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Transactions</h1>
            <p className="text-xs text-muted-foreground">Track income and expenses</p>
          </div>
          <Link
            href="/transactions/new"
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Add Transaction
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <TransactionSearch accounts={accounts} categories={categories} />

        <Suspense>
          <TransactionFilters accounts={accounts} categories={categories} />
        </Suspense>

        <TransactionList
          transactions={transactions}
          accounts={accounts}
          categories={categories}
        />
      </main>
    </div>
  )
}
