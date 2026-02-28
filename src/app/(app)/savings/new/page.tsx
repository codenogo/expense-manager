import Link from 'next/link'
import { createGoal } from '@/lib/actions/savings'
import { getAccounts } from '@/lib/actions/accounts'
import { GoalForm } from '@/components/savings/goal-form'

export default async function NewSavingsGoalPage() {
  const accounts = await getAccounts()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/savings"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Savings Goals
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-lg font-semibold text-slate-900">New Goal</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <GoalForm accounts={accounts} action={createGoal} />
      </main>
    </div>
  )
}
