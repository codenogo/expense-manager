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

export async function getDebts(): Promise<Tables<'debts'>[]> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('household_id', householdId)
    .order('type')
    .order('name')

  if (error) throw new Error(error.message)

  return data ?? []
}

export async function getDebt(id: string): Promise<Tables<'debts'>> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('id', id)
    .eq('household_id', householdId)
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Debt not found')

  return data
}

export async function createDebt(formData: FormData): Promise<void> {
  const name = formData.get('name') as string
  const type = formData.get('type') as Tables<'debts'>['type']
  const balanceKES = parseFloat(formData.get('balance') as string) || 0
  const balanceCents = Math.round(balanceKES * 100)
  const interestRate = parseFloat(formData.get('interest_rate') as string) || null
  const minPaymentKES = parseFloat(formData.get('min_payment') as string) || null
  const minPaymentCents = minPaymentKES !== null ? Math.round(minPaymentKES * 100) : null
  const owedTo = (formData.get('owed_to') as string) || null

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase.from('debts').insert({
    household_id: householdId,
    name,
    type,
    balance: balanceCents,
    interest_rate: interestRate,
    min_payment: minPaymentCents,
    owed_to: owedTo,
  })

  if (error) throw new Error(error.message)

  redirect('/debts')
}

export async function updateDebt(id: string, formData: FormData): Promise<void> {
  const name = formData.get('name') as string
  const type = formData.get('type') as Tables<'debts'>['type']
  const balanceKES = parseFloat(formData.get('balance') as string) || 0
  const balanceCents = Math.round(balanceKES * 100)
  const interestRate = parseFloat(formData.get('interest_rate') as string) || null
  const minPaymentKES = parseFloat(formData.get('min_payment') as string) || null
  const minPaymentCents = minPaymentKES !== null ? Math.round(minPaymentKES * 100) : null
  const owedTo = (formData.get('owed_to') as string) || null

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase
    .from('debts')
    .update({
      name,
      type,
      balance: balanceCents,
      interest_rate: interestRate,
      min_payment: minPaymentCents,
      owed_to: owedTo,
    })
    .eq('id', id)
    .eq('household_id', householdId)

  if (error) throw new Error(error.message)

  redirect('/debts')
}

export async function deleteDebt(id: string): Promise<void> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId)

  if (error) throw new Error(error.message)

  redirect('/debts')
}

export async function recordPayment(id: string, formData: FormData): Promise<void> {
  const amountKES = parseFloat(formData.get('amount') as string) || 0
  const amountCents = Math.round(amountKES * 100)
  const accountId = (formData.get('account_id') as string) || null

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: debt, error: debtError } = await supabase
    .from('debts')
    .select('balance')
    .eq('id', id)
    .eq('household_id', householdId)
    .single()

  if (debtError || !debt) throw new Error(debtError?.message ?? 'Debt not found')

  const newBalance = debt.balance - amountCents

  const { error: updateError } = await supabase
    .from('debts')
    .update({ balance: newBalance })
    .eq('id', id)
    .eq('household_id', householdId)

  if (updateError) throw new Error(updateError.message)

  if (accountId) {
    const today = new Date().toISOString().split('T')[0]

    const { error: txError } = await supabase.from('transactions').insert({
      household_id: householdId,
      account_id: accountId,
      amount: amountCents,
      type: 'expense',
      date: today,
      notes: `Debt payment`,
      created_by: user.id,
    })

    if (txError) throw new Error(txError.message)

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .eq('household_id', householdId)
      .single()

    if (accountError || !account) throw new Error(accountError?.message ?? 'Account not found')

    const { error: balanceError } = await supabase
      .from('accounts')
      .update({ balance: account.balance - amountCents })
      .eq('id', accountId)
      .eq('household_id', householdId)

    if (balanceError) throw new Error(balanceError.message)
  }

  revalidatePath('/debts')
}
