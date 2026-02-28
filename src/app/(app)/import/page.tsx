import Link from 'next/link'
import { getAccounts } from '@/lib/actions/accounts'
import { getCategories } from '@/lib/actions/categories'
import { getRules } from '@/lib/actions/rules'
import { ImportWizard } from '@/components/import/import-wizard'

export default async function ImportPage() {
  const [accounts, categories, rules] = await Promise.all([
    getAccounts(),
    getCategories(),
    getRules(),
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/transactions" className="hover:text-slate-700 transition-colors">
              Transactions
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Import CSV</span>
          </div>
          <h1 className="text-lg font-semibold text-slate-900 mt-1">Import Transactions</h1>
          <p className="text-xs text-slate-500">Upload a CSV bank statement to bulk import transactions</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <ImportWizard accounts={accounts} categories={categories} rules={rules} />
        </div>
      </main>
    </div>
  )
}
