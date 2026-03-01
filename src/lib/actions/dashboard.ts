'use server'

import { createClient } from '@/lib/supabase/server'
import { getHouseholdId } from '@/lib/auth'

export interface CategoryBreakdown {
  categoryId: string | null
  categoryName: string
  amount: number  // cents
  percentage: number
}

export interface RecentTransaction {
  id: string
  date: string
  amount: number
  type: 'income' | 'expense'
  categoryName: string
  accountName: string
  notes: string | null
}

export interface DashboardData {
  totalIncome: number
  totalExpenses: number
  net: number
  categoryBreakdown: CategoryBreakdown[]
  recentTransactions: RecentTransaction[]
}

export async function getDashboardData(month?: string): Promise<DashboardData> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  // Default to current month
  const now = new Date()
  const targetMonth = month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [year, mon] = targetMonth.split('-').map(Number)
  const startDate = `${year}-${String(mon).padStart(2, '0')}-01`
  const endDate = new Date(year, mon, 0).toISOString().split('T')[0] // last day of month

  // Fetch transactions, categories, and accounts in parallel
  const [{ data: transactions }, { data: categories }, { data: accounts }] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .eq('household_id', householdId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false }),
    supabase
      .from('categories')
      .select('id, name')
      .eq('household_id', householdId),
    supabase
      .from('accounts')
      .select('id, name')
      .eq('household_id', householdId),
  ])

  const txs = transactions ?? []

  // Calculate totals
  const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net = totalIncome - totalExpenses

  const categoryMap = new Map((categories ?? []).map(c => [c.id, c.name]))
  const accountMap = new Map((accounts ?? []).map(a => [a.id, a.name]))

  // Category breakdown (expenses only)
  const expensesByCategory = new Map<string | null, number>()
  for (const tx of txs.filter(t => t.type === 'expense')) {
    const key = tx.category_id
    expensesByCategory.set(key, (expensesByCategory.get(key) ?? 0) + tx.amount)
  }

  const categoryBreakdown: CategoryBreakdown[] = Array.from(expensesByCategory.entries())
    .map(([catId, amount]) => ({
      categoryId: catId,
      categoryName: catId ? (categoryMap.get(catId) ?? 'Uncategorized') : 'Uncategorized',
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  // Recent transactions (last 10)
  const recentTransactions: RecentTransaction[] = txs.slice(0, 10).map(tx => ({
    id: tx.id,
    date: tx.date,
    amount: tx.amount,
    type: tx.type as 'income' | 'expense',
    categoryName: tx.category_id ? (categoryMap.get(tx.category_id) ?? 'Uncategorized') : 'Uncategorized',
    accountName: accountMap.get(tx.account_id) ?? 'Unknown',
    notes: tx.notes,
  }))

  return { totalIncome, totalExpenses, net, categoryBreakdown, recentTransactions }
}

export interface MemberTransaction {
  created_by: string
  type: string
  amount: number
}

export async function getMemberTransactions(month?: string): Promise<MemberTransaction[]> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const now = new Date()
  const targetMonth = month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [year, mon] = targetMonth.split('-').map(Number)
  const startDate = `${year}-${String(mon).padStart(2, '0')}-01`
  const endDate = new Date(year, mon, 0).toISOString().split('T')[0]

  const { data } = await supabase
    .from('transactions')
    .select('created_by, type, amount')
    .eq('household_id', householdId)
    .gte('date', startDate)
    .lte('date', endDate)

  return (data ?? []).map((tx) => ({
    created_by: tx.created_by ?? '',
    type: tx.type,
    amount: tx.amount,
  }))
}
