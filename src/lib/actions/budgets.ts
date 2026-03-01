'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function getHouseholdId(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')
  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()
  if (!profile?.household_id) redirect('/onboarding')
  return profile.household_id
}

export interface BudgetWithSpent {
  id: string
  category_id: string
  category_name: string
  month: string
  amount: number
  spent: number
}

export async function getBudgets(month: string): Promise<BudgetWithSpent[]> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  // month column is type date — always store as first day of month
  const monthDate = month.length === 7 ? `${month}-01` : month

  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select('*')
    .eq('household_id', householdId)
    .eq('month', monthDate)

  if (budgetsError) throw new Error(budgetsError.message)
  if (!budgets || budgets.length === 0) return []

  // Fetch categories for name lookup
  const categoryIds = budgets.map((b) => b.category_id)
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name')
    .in('id', categoryIds)

  if (categoriesError) throw new Error(categoriesError.message)
  const categoryMap = new Map((categoriesData ?? []).map((c) => [c.id, c.name]))

  // Build date range for the month
  const [year, monthNum] = month.split('-').map(Number)
  const startDate = `${month}-01`
  const nextMonthStr =
    monthNum === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(monthNum + 1).padStart(2, '0')}-01`

  // Single query for ALL expense transactions in the month for these categories
  const { data: allTxs, error: txError } = await supabase
    .from('transactions')
    .select('category_id, amount')
    .eq('household_id', householdId)
    .eq('type', 'expense')
    .in('category_id', categoryIds)
    .gte('date', startDate)
    .lt('date', nextMonthStr)

  if (txError) throw new Error(txError.message)

  // Aggregate in-memory
  const spentByCategory = new Map<string, number>()
  for (const tx of allTxs ?? []) {
    if (tx.category_id) {
      spentByCategory.set(tx.category_id, (spentByCategory.get(tx.category_id) ?? 0) + tx.amount)
    }
  }

  const result: BudgetWithSpent[] = budgets.map((budget) => ({
    id: budget.id,
    category_id: budget.category_id,
    category_name: categoryMap.get(budget.category_id) ?? 'Unknown',
    month: budget.month,
    amount: budget.amount,
    spent: spentByCategory.get(budget.category_id) ?? 0,
  }))

  return result
}

export async function setBudget(formData: FormData): Promise<{ error?: string } | void> {
  const category_id = formData.get('category_id') as string
  const month = formData.get('month') as string
  const amountKES = parseFloat(formData.get('amount') as string)

  if (!category_id?.trim()) return { error: 'Category is required' }
  if (!month?.trim()) return { error: 'Month is required' }
  if (isNaN(amountKES) || amountKES <= 0) return { error: 'Amount must be a positive number' }

  const amount = Math.round(amountKES * 100)
  const monthDate = month.length === 7 ? `${month}-01` : month

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  // Check if a budget already exists for this category+month
  const { data: existing } = await supabase
    .from('budgets')
    .select('id')
    .eq('household_id', householdId)
    .eq('category_id', category_id)
    .eq('month', monthDate)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('budgets')
      .update({ amount })
      .eq('id', existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('budgets').insert({
      household_id: householdId,
      category_id,
      month: monthDate,
      amount,
    })
    if (error) return { error: error.message }
  }

  revalidatePath('/budget')
}

export async function deleteBudget(id: string): Promise<{ error?: string } | void> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase.from('budgets').delete().eq('id', id).eq('household_id', householdId)

  if (error) return { error: error.message }

  revalidatePath('/budget')
}
