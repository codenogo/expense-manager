import { redirect } from 'next/navigation'
import { getHousehold } from '@/lib/actions/household'
import { getDashboardData, getMemberTransactions } from '@/lib/actions/dashboard'
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
  const [{ household, members }, dashboardData, recurringItems, categories, trends, memberTxs] =
    await Promise.all([
      getHousehold(),
      getDashboardData(),
      getRecurringItems(),
      getCategories(),
      getMonthlyTrends(),
      getMemberTransactions(),
    ])

  if (!household) redirect('/onboarding')

  const memberList = members.map((m) => ({
    id: m.id,
    full_name: m.full_name,
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">{household.name} Dashboard</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
