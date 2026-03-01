'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'

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

export async function getGoals(): Promise<Tables<'savings_goals'>[]> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('household_id', householdId)
    .order('deadline', { ascending: true, nullsFirst: false })
    .order('name')

  if (error) throw new Error(error.message)

  return data ?? []
}

export async function getGoal(id: string): Promise<Tables<'savings_goals'>> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('id', id)
    .eq('household_id', householdId)
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Goal not found')

  return data
}

export async function createGoal(formData: FormData): Promise<void> {
  const name = formData.get('name') as string
  const targetKES = parseFloat(formData.get('target_amount') as string) || 0
  const targetCents = Math.round(targetKES * 100)
  const deadlineRaw = (formData.get('deadline') as string) || null
  const deadline = deadlineRaw && deadlineRaw.trim() !== '' ? deadlineRaw : null
  const accountIdRaw = (formData.get('account_id') as string) || null
  const accountId = accountIdRaw && accountIdRaw.trim() !== '' ? accountIdRaw : null

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase.from('savings_goals').insert({
    household_id: householdId,
    name,
    target_amount: targetCents,
    current_amount: 0,
    deadline,
    account_id: accountId,
  })

  if (error) throw new Error(error.message)

  redirect('/savings')
}

export async function updateGoal(id: string, formData: FormData): Promise<void> {
  const name = formData.get('name') as string
  const targetKES = parseFloat(formData.get('target_amount') as string) || 0
  const targetCents = Math.round(targetKES * 100)
  const deadlineRaw = (formData.get('deadline') as string) || null
  const deadline = deadlineRaw && deadlineRaw.trim() !== '' ? deadlineRaw : null
  const accountIdRaw = (formData.get('account_id') as string) || null
  const accountId = accountIdRaw && accountIdRaw.trim() !== '' ? accountIdRaw : null

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase
    .from('savings_goals')
    .update({ name, target_amount: targetCents, deadline, account_id: accountId })
    .eq('id', id)
    .eq('household_id', householdId)

  if (error) throw new Error(error.message)

  redirect('/savings')
}

export async function deleteGoal(id: string): Promise<void> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId)

  if (error) throw new Error(error.message)

  redirect('/savings')
}

export async function addContribution(id: string, formData: FormData): Promise<void> {
  const amountKES = parseFloat(formData.get('amount') as string) || 0
  const amountCents = Math.round(amountKES * 100)

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: goal, error: goalError } = await supabase
    .from('savings_goals')
    .select('current_amount, account_id')
    .eq('id', id)
    .eq('household_id', householdId)
    .single()

  if (goalError || !goal) throw new Error(goalError?.message ?? 'Goal not found')

  const newAmount = goal.current_amount + amountCents

  if (goal.account_id) {
    const today = new Date().toISOString().split('T')[0]

    // Run goal update and transaction insert in parallel
    const [{ error: updateError }, { error: txError }] = await Promise.all([
      supabase
        .from('savings_goals')
        .update({ current_amount: newAmount })
        .eq('id', id)
        .eq('household_id', householdId),
      supabase.from('transactions').insert({
        household_id: householdId,
        account_id: goal.account_id,
        amount: amountCents,
        type: 'income',
        date: today,
        notes: 'Savings contribution',
        created_by: user.id,
      }),
    ])

    if (updateError) throw new Error(updateError.message)
    if (txError) throw new Error(txError.message)

    // Then update account balance
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', goal.account_id)
      .eq('household_id', householdId)
      .single()

    if (accountError || !account) throw new Error(accountError?.message ?? 'Account not found')

    const { error: balanceError } = await supabase
      .from('accounts')
      .update({ balance: account.balance + amountCents })
      .eq('id', goal.account_id)
      .eq('household_id', householdId)

    if (balanceError) throw new Error(balanceError.message)
  } else {
    const { error: updateError } = await supabase
      .from('savings_goals')
      .update({ current_amount: newAmount })
      .eq('id', id)
      .eq('household_id', householdId)

    if (updateError) throw new Error(updateError.message)
  }

  revalidatePath('/savings')
}
