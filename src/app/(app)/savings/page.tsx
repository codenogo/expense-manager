import Link from 'next/link'
import { getGoals } from '@/lib/actions/savings'
import { GoalCard } from '@/components/savings/goal-card'

export default async function SavingsPage() {
  const goals = await getGoals()

  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0)
  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0)
  const overallPercentage =
    totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  function formatKES(cents: number): string {
    return (cents / 100).toLocaleString('en-KE', { style: 'currency', currency: 'KES' })
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Savings Goals</h1>
            <p className="text-xs text-slate-500">Track progress toward your financial goals</p>
          </div>
          <Link
            href="/savings/new"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Add Goal
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {goals.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-500">Total Target</p>
                <p className="text-sm font-semibold text-slate-900">{formatKES(totalTarget)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Saved</p>
                <p className="text-sm font-semibold text-emerald-600">{formatKES(totalSaved)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Overall Progress</p>
                <p className="text-sm font-semibold text-slate-900">{overallPercentage}%</p>
              </div>
            </div>
          </div>
        )}

        {goals.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <p className="text-slate-500 text-sm mb-4">
              No savings goals yet. Add your first goal to start tracking.
            </p>
            <Link
              href="/savings/new"
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Add Goal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
