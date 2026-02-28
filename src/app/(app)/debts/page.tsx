import Link from 'next/link'
import { getDebts } from '@/lib/actions/debts'
import { DebtSummary } from '@/components/debts/debt-summary'
import { DebtCard } from '@/components/debts/debt-card'

export default async function DebtsPage() {
  const debts = await getDebts()

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Debts</h1>
            <p className="text-xs text-slate-500">Track and manage your debts</p>
          </div>
          <Link
            href="/debts/new"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Add Debt
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {debts.length > 0 && <DebtSummary debts={debts} />}

        {debts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <p className="text-slate-500 text-sm mb-4">
              No debts recorded. Add your first debt to start tracking.
            </p>
            <Link
              href="/debts/new"
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Add Debt
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {debts.map((debt) => (
              <DebtCard key={debt.id} debt={debt} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
