import Link from 'next/link'
import type { Tables } from '@/types/database'
import { formatKES } from '@/components/ui/currency'

interface GoalCardProps {
  goal: Tables<'savings_goals'>
}

function getSavingsProgressColor(percentage: number): string {
  // Inverted for savings: high % is good (green), low % is concerning (red)
  if (percentage >= 75) return 'bg-emerald-500'
  if (percentage >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

export function GoalCard({ goal }: GoalCardProps) {
  const percentage =
    goal.target_amount > 0
      ? Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100)
      : 0

  const fillColor = getSavingsProgressColor(percentage)

  let daysRemaining: number | null = null
  let monthsRemaining: number | null = null
  let monthlyNeeded: number | null = null

  if (goal.deadline) {
    const today = new Date()
    const deadline = new Date(goal.deadline)
    const msPerDay = 1000 * 60 * 60 * 24
    daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / msPerDay)
    monthsRemaining =
      (deadline.getFullYear() - today.getFullYear()) * 12 +
      (deadline.getMonth() - today.getMonth())
    if (monthsRemaining > 0 && goal.current_amount < goal.target_amount) {
      monthlyNeeded = Math.ceil((goal.target_amount - goal.current_amount) / monthsRemaining)
    }
  }

  const isReached = goal.current_amount >= goal.target_amount

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">{goal.name}</h3>
        <span className="text-sm font-semibold text-foreground">{percentage}%</span>
      </div>

      {/* Inline progress bar with inverted savings colors */}
      <div className="bg-muted rounded-full h-2 mb-3">
        <div
          className={`${fillColor} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>{formatKES(goal.current_amount)}</span>
        <span>{formatKES(goal.target_amount)}</span>
      </div>

      {goal.deadline && (
        <div className="text-xs text-muted-foreground mb-3 space-y-0.5">
          {daysRemaining !== null && (
            <p>
              {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Deadline passed'}
            </p>
          )}
          {isReached ? (
            <p className="text-emerald-600 font-medium">Target reached!</p>
          ) : monthlyNeeded !== null ? (
            <p>{formatKES(monthlyNeeded)}/month needed</p>
          ) : null}
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <Link
          href={`/savings/${goal.id}/contribute`}
          className="flex-1 text-center bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          Contribute
        </Link>
        <Link
          href={`/savings/${goal.id}`}
          className="flex-1 text-center rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          Details
        </Link>
      </div>
    </div>
  )
}
