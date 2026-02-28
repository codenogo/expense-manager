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
import { MemberContributions } from '@/components/dashboard/member-contributions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const now = new Date()
  const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [{ household, members }, dashboardData, recurringItems, categories, trends] =
    await Promise.all([
      getHousehold(),
      getDashboardData(),
      getRecurringItems(),
      getCategories(),
      getMonthlyTrends(),
    ])

  if (!household) redirect('/onboarding')

  const { data: memberTxsRaw } = await supabase
    .from('transactions')
    .select('created_by, type, amount')
    .eq('household_id', household.id)
    .gte('date', startDate)
    .lte('date', endDate)

  const memberTxs = (memberTxsRaw ?? []).map((tx) => ({
    created_by: tx.created_by ?? '',
    type: tx.type,
    amount: tx.amount,
  }))

  const memberList = members.map((m) => ({
    id: m.id,
    full_name: m.full_name,
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">{household.name} Dashboard</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>

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

      <MemberContributions members={memberList} transactions={memberTxs} />

      <RecentTransactions transactions={dashboardData.recentTransactions} />
    </div>
  )
}
