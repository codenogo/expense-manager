import Link from 'next/link'
import { createGoal } from '@/lib/actions/savings'
import { getAccounts } from '@/lib/actions/accounts'
import { GoalForm } from '@/components/savings/goal-form'

export default async function NewSavingsGoalPage() {
  const accounts = await getAccounts()

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/savings"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Savings Goals
          </Link>
          <span className="text-border">/</span>
          <h1 className="text-lg font-semibold text-foreground">New Goal</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <GoalForm accounts={accounts} action={createGoal} />
      </main>
    </div>
  )
}
