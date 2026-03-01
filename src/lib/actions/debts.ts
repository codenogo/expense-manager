'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getHouseholdId, getAuthContext } from '@/lib/auth'
import { syncLoanAccountBalance } from '@/lib/actions/loan-account'
import type { Tables } from '@/types/database'

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

  if (error) {
    redirect('/debts?error=Failed+to+create+debt')
  }

  await syncLoanAccountBalance(householdId)
  redirect('/debts?toast=Debt+created')
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

  if (error) {
    redirect('/debts?error=Failed+to+update+debt')
  }

  await syncLoanAccountBalance(householdId)
  redirect('/debts?toast=Debt+updated')
}

export async function deleteDebt(id: string): Promise<void> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId)

  if (error) {
    redirect('/debts?error=Failed+to+delete+debt')
  }

  await syncLoanAccountBalance(householdId)
  redirect('/debts?toast=Debt+deleted')
}

export async function recordPayment(id: string, formData: FormData): Promise<void> {
  const amountKES = parseFloat(formData.get('amount') as string) || 0
  const amountCents = Math.round(amountKES * 100)
  const accountId = formData.get('account_id') as string
  const notes = (formData.get('notes') as string) || 'Debt payment'

  if (!accountId) throw new Error('Account is required for debt payments')

  const supabase = await createClient()
  const householdId = await getHouseholdId()
  const { user } = await getAuthContext()

  // 1. Fetch current debt balance
  const { data: debt, error: debtError } = await supabase
    .from('debts')
    .select('balance')
    .eq('id', id)
    .eq('household_id', householdId)
    .single()

  if (debtError || !debt) throw new Error(debtError?.message ?? 'Debt not found')

  const newBalance = debt.balance - amountCents
  const today = new Date().toISOString().split('T')[0]

  // 2. Create expense transaction on source account
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
      household_id: householdId,
      account_id: accountId,
      amount: amountCents,
      type: 'expense',
      date: today,
      notes,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (txError || !tx) throw new Error(txError?.message ?? 'Failed to create transaction')

  // 3. Create debt_payments record
  const { error: paymentError } = await supabase.from('debt_payments').insert({
    household_id: householdId,
    debt_id: id,
    account_id: accountId,
    transaction_id: tx.id,
    amount: amountCents,
    date: today,
    notes,
  })

  if (paymentError) throw new Error(paymentError.message)

  // 4. Update debt balance
  const { error: updateError } = await supabase
    .from('debts')
    .update({ balance: newBalance })
    .eq('id', id)
    .eq('household_id', householdId)

  if (updateError) throw new Error(updateError.message)

  // 5. Update source account balance
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

  // 6. Sync loan account balance
  await syncLoanAccountBalance(householdId)

  // 7. Invalidate caches
  updateTag(`dashboard-${householdId}`)
  updateTag(`accounts-${householdId}`)
}

export async function getDebtPayments(debtId: string): Promise<Tables<'debt_payments'>[]> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { data, error } = await supabase
    .from('debt_payments')
    .select('*')
    .eq('debt_id', debtId)
    .eq('household_id', householdId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data ?? []
}
