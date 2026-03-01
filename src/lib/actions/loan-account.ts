'use server'

import { updateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'

export async function ensureLoanAccount(householdId: string): Promise<string> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('accounts')
    .select('id')
    .eq('household_id', householdId)
    .eq('is_system_managed', true)
    .eq('type', 'loan')
    .single()

  if (existing) {
    return existing.id
  }

  const { data: created, error } = await supabase
    .from('accounts')
    .insert({
      household_id: householdId,
      name: 'Total Loans',
      type: 'loan',
      balance: 0,
      is_system_managed: true,
    })
    .select('id')
    .single()

  if (error || !created) {
    throw new Error(error?.message ?? 'Failed to create loan account')
  }

  return created.id
}

export async function syncLoanAccountBalance(householdId: string): Promise<void> {
  const supabase = await createClient()

  const { data: debts, error: debtsError } = await supabase
    .from('debts')
    .select('balance')
    .eq('household_id', householdId)

  if (debtsError) {
    throw new Error(debtsError.message)
  }

  const totalBalance = (debts ?? []).reduce((sum, debt) => sum + debt.balance, 0)

  const accountId = await ensureLoanAccount(householdId)

  const { error: updateError } = await supabase
    .from('accounts')
    .update({ balance: totalBalance })
    .eq('id', accountId)
    .eq('household_id', householdId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  updateTag(`accounts-${householdId}`)
  updateTag(`dashboard-${householdId}`)
}

export async function getLoanAccount(householdId: string): Promise<Tables<'accounts'> | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('accounts')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_system_managed', true)
    .eq('type', 'loan')
    .single()

  return data ?? null
}
