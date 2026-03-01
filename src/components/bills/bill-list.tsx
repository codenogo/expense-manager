'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { markPaid, deleteRecurring } from '@/lib/actions/recurring'
import { formatKES } from '@/components/ui/currency'
import type { Tables } from '@/types/database'

interface BillListProps {
  items: Tables<'recurring_items'>[]
  accounts: Tables<'accounts'>[]
  categories: Tables<'categories'>[]
}

const FREQUENCY_LABELS: Record<Tables<'recurring_items'>['frequency'], string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

function getStatus(nextDueDate: string): 'overdue' | 'due-soon' | 'upcoming' {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(nextDueDate)
  due.setHours(0, 0, 0, 0)
  const diffMs = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays <= 7) return 'due-soon'
  return 'upcoming'
}

function formatDueDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface BillItemProps {
  item: Tables<'recurring_items'>
  accounts: Tables<'accounts'>[]
  categories: Tables<'categories'>[]
  status: 'overdue' | 'due-soon' | 'upcoming'
}

function BillItem({ item, accounts, categories, status }: BillItemProps) {
  const account = accounts.find((a) => a.id === item.account_id)
  const category = categories.find((c) => c.id === item.category_id)

  const statusStyles = {
    overdue: 'bg-red-50 border-red-100',
    'due-soon': 'bg-amber-50 border-amber-100',
    upcoming: 'bg-card border-border',
  }

  const statusBadgeStyles = {
    overdue: 'bg-red-100 text-red-700',
    'due-soon': 'bg-amber-100 text-amber-700',
    upcoming: 'bg-muted text-muted-foreground',
  }

  const statusLabels = {
    overdue: 'Overdue',
    'due-soon': 'Due Soon',
    upcoming: 'Upcoming',
  }

  const markPaidAction = markPaid.bind(null, item.id)
  const deleteAction = deleteRecurring.bind(null, item.id)

  return (
    <div className={`rounded-xl border p-4 ${statusStyles[status]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeStyles[status]}`}>
              {statusLabels[status]}
            </span>
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
              {FREQUENCY_LABELS[item.frequency]}
            </span>
          </div>
          <p className="text-base font-semibold text-foreground mt-1">{formatKES(item.amount)}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground">Due: {formatDueDate(item.next_due_date)}</span>
            {category && (
              <span className="text-xs text-muted-foreground">{category.name}</span>
            )}
            {account && (
              <span className="text-xs text-muted-foreground">{account.name}</span>
            )}
          </div>
          {!item.account_id && (
            <p className="text-xs text-muted-foreground/70 mt-1">
              Set an account to auto-create transactions when marking paid.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <form action={markPaidAction}>
            <button
              type="submit"
              className="bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-emerald-700 transition-colors"
            >
              Mark Paid
            </button>
          </form>
          <Link
            href={`/bills/${item.id}`}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Edit
          </Link>
          <form action={deleteAction}>
            <button
              type="submit"
              className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export function BillList({ items, accounts, categories }: BillListProps) {
  const { overdue, dueSoon, upcoming } = useMemo(() => {
    const overdue = items
      .filter((i) => getStatus(i.next_due_date) === 'overdue')
      .sort((a, b) => a.next_due_date.localeCompare(b.next_due_date))

    const dueSoon = items
      .filter((i) => getStatus(i.next_due_date) === 'due-soon')
      .sort((a, b) => a.next_due_date.localeCompare(b.next_due_date))

    const upcoming = items
      .filter((i) => getStatus(i.next_due_date) === 'upcoming')
      .sort((a, b) => a.next_due_date.localeCompare(b.next_due_date))

    return { overdue, dueSoon, upcoming }
  }, [items])

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-10 text-center">
        <p className="text-muted-foreground text-sm mb-4">No bills yet. Add your first bill to get started.</p>
        <Link
          href="/bills/new"
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Add Bill
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {overdue.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-3">
            Overdue ({overdue.length})
          </h2>
          <div className="space-y-3">
            {overdue.map((item) => (
              <BillItem
                key={item.id}
                item={item}
                accounts={accounts}
                categories={categories}
                status="overdue"
              />
            ))}
          </div>
        </section>
      )}

      {dueSoon.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-3">
            Due Soon ({dueSoon.length})
          </h2>
          <div className="space-y-3">
            {dueSoon.map((item) => (
              <BillItem
                key={item.id}
                item={item}
                accounts={accounts}
                categories={categories}
                status="due-soon"
              />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Upcoming ({upcoming.length})
          </h2>
          <div className="space-y-3">
            {upcoming.map((item) => (
              <BillItem
                key={item.id}
                item={item}
                accounts={accounts}
                categories={categories}
                status="upcoming"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
