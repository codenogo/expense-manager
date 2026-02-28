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

export interface ImportRow {
  date: string
  amount: number // already in cents
  type: 'income' | 'expense'
  accountId: string
  categoryId: string | null
  notes: string | null
}

export async function bulkCreateTransactions(
  accountId: string,
  rows: ImportRow[]
): Promise<{ imported: number; error?: string }> {
  if (!rows.length) return { imported: 0 }

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  // Validate all rows have required fields
  for (const row of rows) {
    if (!row.date || !row.amount || !row.type || !row.accountId) {
      return { imported: 0, error: 'Invalid row: missing required fields' }
    }
  }

  const inserts = rows.map((row) => ({
    household_id: householdId,
    account_id: row.accountId,
    category_id: row.categoryId ?? null,
    amount: Math.abs(row.amount),
    type: row.type,
    date: row.date,
    notes: row.notes ?? null,
    created_by: user.id,
  }))

  const { error: insertError } = await supabase.from('transactions').insert(inserts)
  if (insertError) return { imported: 0, error: insertError.message }

  // Calculate net balance change
  const balanceDelta = rows.reduce((sum, row) => {
    const cents = Math.abs(row.amount)
    return row.type === 'income' ? sum + cents : sum - cents
  }, 0)

  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', accountId)
    .eq('household_id', householdId)
    .single()

  if (accountError || !account) return { imported: 0, error: accountError?.message ?? 'Account not found' }

  const { error: balanceError } = await supabase
    .from('accounts')
    .update({ balance: account.balance + balanceDelta })
    .eq('id', accountId)
    .eq('household_id', householdId)

  if (balanceError) return { imported: 0, error: balanceError.message }

  revalidatePath('/transactions')

  return { imported: rows.length }
}
