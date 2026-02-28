import Link from 'next/link'
import { createDebt } from '@/lib/actions/debts'
import { DebtForm } from '@/components/debts/debt-form'

export default function NewDebtPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/debts"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Debts
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-lg font-semibold text-slate-900">New Debt</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <DebtForm action={createDebt} />
      </main>
    </div>
  )
}
