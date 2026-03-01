'use server'

import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getHouseholdId } from '@/lib/auth'

export interface MonthlyTrend {
  month: string  // YYYY-MM
  label: string  // e.g. "Feb"
  income: number   // cents
  expenses: number // cents
  net: number      // cents
}

export async function getMonthlyTrends(monthCount: number = 6): Promise<MonthlyTrend[]> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  return unstable_cache(
    async () => {
      // Calculate date range: last N months
      const now = new Date()
      const months: string[] = []
      for (let i = monthCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
      }

      const startDate = months[0] + '-01'

      const { data: transactions } = await supabase
        .from('transactions')
        .select('date, amount, type')
        .eq('household_id', householdId)
        .gte('date', startDate)
        .order('date')

      const txs = transactions ?? []

      // Aggregate by month
      const monthMap = new Map<string, { income: number; expenses: number }>()
      for (const m of months) {
        monthMap.set(m, { income: 0, expenses: 0 })
      }

      for (const tx of txs) {
        const txMonth = tx.date.substring(0, 7) // YYYY-MM
        const entry = monthMap.get(txMonth)
        if (entry) {
          if (tx.type === 'income') {
            entry.income += tx.amount
          } else {
            entry.expenses += tx.amount
          }
        }
      }

      return months.map(m => {
        const entry = monthMap.get(m)!
        const [year, mon] = m.split('-')
        const date = new Date(parseInt(year), parseInt(mon) - 1)
        return {
          month: m,
          label: date.toLocaleDateString('en-KE', { month: 'short' }),
          income: entry.income,
          expenses: entry.expenses,
          net: entry.income - entry.expenses,
        }
      })
    },
    ['reports', householdId, String(monthCount)],
    { tags: [`reports-${householdId}`], revalidate: 1800 }
  )()
}

export interface CategoryReport {
  categoryName: string
  amount: number
  percentage: number
}

export async function getCategoryReport(): Promise<CategoryReport[]> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  return unstable_cache(
    async () => {
      const now = new Date()
      const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

      const { data: transactions } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('household_id', householdId)
        .eq('type', 'expense')
        .gte('date', startDate)

      const txs = transactions ?? []

      // Aggregate by category
      const categoryMap = new Map<string, number>()
      for (const tx of txs) {
        const catId = tx.category_id ?? 'uncategorized'
        categoryMap.set(catId, (categoryMap.get(catId) ?? 0) + tx.amount)
      }

      if (categoryMap.size === 0) return []

      // Fetch category names
      const categoryIds = [...categoryMap.keys()].filter(id => id !== 'uncategorized')
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .in('id', categoryIds.length > 0 ? categoryIds : ['_'])

      const catNames = new Map<string, string>()
      for (const c of categories ?? []) {
        catNames.set(c.id, c.name)
      }

      const total = [...categoryMap.values()].reduce((a, b) => a + b, 0)

      const result: CategoryReport[] = [...categoryMap.entries()]
        .map(([catId, amount]) => ({
          categoryName: catId === 'uncategorized' ? 'Uncategorized' : (catNames.get(catId) ?? 'Unknown'),
          amount,
          percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount)

      return result
    },
    ['category-report', householdId],
    { tags: [`reports-${householdId}`], revalidate: 1800 }
  )()
}
