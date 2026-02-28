import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getHousehold } from '@/lib/actions/household'
import { getDashboardData } from '@/lib/actions/dashboard'
import { getRecurringItems } from '@/lib/actions/recurring'
import { getCategories } from '@/lib/actions/categories'
import { getMonthlyTrends } from '@/lib/actions/reports'
import { signOut } from '@/lib/actions/auth'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { UpcomingBills } from '@/components/bills/upcoming-bills'
import { SpendingTrends } from '@/components/dashboard/spending-trends'
import { IncomeVsExpenses } from '@/components/dashboard/income-vs-expenses'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [{ household, members: _members }, dashboardData, recurringItems, categories, trends] =
    await Promise.all([getHousehold(), getDashboardData(), getRecurringItems(), getCategories(), getMonthlyTrends()])

  if (!household) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{household.name}</h1>
            <p className="text-xs text-slate-500">Household Finance Planner</p>
          </div>
          <form action={signOut}>
            <button type="submit" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <SummaryCards
          totalIncome={dashboardData.totalIncome}
          totalExpenses={dashboardData.totalExpenses}
          net={dashboardData.net}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingTrends data={trends} />
          <IncomeVsExpenses data={trends} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdown breakdown={dashboardData.categoryBreakdown} />
          <UpcomingBills items={recurringItems} categories={categories} />
        </div>

        <RecentTransactions transactions={dashboardData.recentTransactions} />
      </main>
    </div>
  )
}
