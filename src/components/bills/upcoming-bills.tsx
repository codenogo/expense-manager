import { formatKES } from '@/components/ui/currency'
import type { Tables } from '@/types/database'

interface UpcomingBillsProps {
  items: Tables<'recurring_items'>[]
  categories: Tables<'categories'>[]
}

function getDaysUntilDue(nextDueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(nextDueDate)
  due.setHours(0, 0, 0, 0)
  const diffMs = due.getTime() - today.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function formatDueDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
  })
}

export function UpcomingBills({ items, categories }: UpcomingBillsProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingItems = items
    .filter((item) => {
      const daysUntil = getDaysUntilDue(item.next_due_date)
      return daysUntil <= 7
    })
    .sort((a, b) => a.next_due_date.localeCompare(b.next_due_date))

  if (upcomingItems.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Upcoming Bills</h2>
        <p className="text-sm text-slate-400">No bills due in the next 7 days.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Upcoming Bills</h2>
      <div className="space-y-3">
        {upcomingItems.map((item) => {
          const daysUntil = getDaysUntilDue(item.next_due_date)
          const category = categories.find((c) => c.id === item.category_id)
          const isOverdue = daysUntil < 0

          return (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500">{formatDueDate(item.next_due_date)}</span>
                  {category && (
                    <span className="text-xs text-slate-400">{category.name}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold text-slate-800">{formatKES(item.amount)}</span>
                {isOverdue ? (
                  <span className="bg-red-50 text-red-700 rounded-full px-2 py-0.5 text-xs font-medium">
                    Overdue
                  </span>
                ) : daysUntil === 0 ? (
                  <span className="bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 text-xs font-medium">
                    Today
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 text-xs font-medium">
                    {daysUntil}d
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
