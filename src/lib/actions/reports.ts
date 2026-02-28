'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function getHouseholdId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')
  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()
  if (!profile?.household_id) redirect('/onboarding')
  return profile.household_id
}

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
}
