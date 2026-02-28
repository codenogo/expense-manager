import Link from 'next/link'
import { getBudgets } from '@/lib/actions/budgets'
import { getCategories } from '@/lib/actions/categories'
import { BudgetSummary } from '@/components/budget/budget-summary'
import { BudgetList } from '@/components/budget/budget-list'
import { AddBudgetForm } from '@/components/budget/add-budget-form'

interface BudgetPageProps {
  searchParams: Promise<{ month?: string }>
}

function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-').map(Number)
  const date = new Date(year, monthNum - 1, 1)
  return date.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })
}

function getPrevMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number)
  if (monthNum === 1) return `${year - 1}-12`
  return `${year}-${String(monthNum - 1).padStart(2, '0')}`
}

function getNextMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number)
  if (monthNum === 12) return `${year + 1}-01`
  return `${year}-${String(monthNum + 1).padStart(2, '0')}`
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const params = await searchParams
  const month = params.month ?? getCurrentMonth()

  const [budgets, categories] = await Promise.all([getBudgets(month), getCategories()])

  const budgetedCategoryIds = budgets.map((b) => b.category_id)
  const prevMonth = getPrevMonth(month)
  const nextMonth = getNextMonth(month)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Budget</h1>
            <p className="text-xs text-slate-500">Set and track spending limits by category</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/budget?month=${prevMonth}`}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors text-sm"
              aria-label="Previous month"
            >
              &#8249;
            </Link>
            <span className="text-sm font-medium text-slate-700 min-w-[130px] text-center">
              {formatMonthLabel(month)}
            </span>
            <Link
              href={`/budget?month=${nextMonth}`}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors text-sm"
              aria-label="Next month"
            >
              &#8250;
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {budgets.length > 0 && <BudgetSummary budgets={budgets} />}

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Add Budget</h2>
          <AddBudgetForm
            categories={categories}
            budgetedCategoryIds={budgetedCategoryIds}
            month={month}
          />
        </div>

        <BudgetList budgets={budgets} />
      </main>
    </div>
  )
}
