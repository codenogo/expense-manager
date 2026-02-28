import Link from 'next/link'
import { getRecurringItems } from '@/lib/actions/recurring'
import { getAccounts } from '@/lib/actions/accounts'
import { getCategories } from '@/lib/actions/categories'
import { BillList } from '@/components/bills/bill-list'

export default async function BillsPage() {
  const [items, accounts, categories] = await Promise.all([
    getRecurringItems(),
    getAccounts(),
    getCategories(),
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Bills &amp; Subscriptions</h1>
            <p className="text-xs text-slate-500">Track recurring payments</p>
          </div>
          <Link
            href="/bills/new"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Add Bill
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <BillList items={items} accounts={accounts} categories={categories} />
      </main>
    </div>
  )
}
