import { getMonthlyTrends, getCategoryReport } from '@/lib/actions/reports'
import { SimpleBarChart } from '@/components/charts/bar-chart'
import { SimpleLineChart } from '@/components/charts/line-chart'
import { SimplePieChart } from '@/components/charts/pie-chart'

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#f87171', '#64748b', '#06b6d4', '#ec4899']

export default async function ReportsPage() {
  const [trendsRaw, categoryReport] = await Promise.all([
    getMonthlyTrends(12),
    getCategoryReport(),
  ])

  const trends = trendsRaw as unknown as Record<string, string | number>[]

  const pieData = categoryReport.map((item, i) => ({
    name: item.categoryName,
    value: item.amount,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Monthly Spending Trend</h2>
          <SimpleLineChart
            data={trends}
            xKey="label"
            lines={[{ key: 'expenses', color: '#f87171', name: 'Expenses' }]}
            height={280}
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Income vs Expenses</h2>
          <SimpleBarChart
            data={trends}
            xKey="label"
            bars={[
              { key: 'income', color: '#10b981', name: 'Income' },
              { key: 'expenses', color: '#f87171', name: 'Expenses' },
            ]}
            height={280}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Category Spending</h2>
        {pieData.length > 0 ? (
          <SimplePieChart data={pieData} height={320} />
        ) : (
          <p className="text-sm text-slate-400">No expenses this month.</p>
        )}
      </div>
    </div>
  )
}
