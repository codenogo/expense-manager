import Link from 'next/link'
import { getAccounts } from '@/lib/actions/accounts'
import { getCategories } from '@/lib/actions/categories'
import { BillForm } from '@/components/bills/bill-form'

export default async function NewBillPage() {
  const [accounts, categories] = await Promise.all([getAccounts(), getCategories()])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/bills"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Bills
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-lg font-semibold text-slate-900">New Bill</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <BillForm accounts={accounts} categories={categories} />
      </main>
    </div>
  )
}
