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

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  categoryId?: string
  accountId?: string
  type?: 'income' | 'expense'
}

export async function getTransactions(
  filters?: TransactionFilters
): Promise<Tables<'transactions'>[]> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('household_id', householdId)

  if (filters?.startDate) {
    query = query.gte('date', filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte('date', filters.endDate)
  }
  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }
  if (filters?.accountId) {
    query = query.eq('account_id', filters.accountId)
  }
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  const { data, error } = await query.order('date', { ascending: false }).order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data ?? []
}

export async function getTransaction(id: string): Promise<Tables<'transactions'>> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('household_id', householdId)
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Transaction not found')

  return data
}

export async function createTransaction(formData: FormData): Promise<void> {
  const amountKES = parseFloat(formData.get('amount') as string) || 0
  const amountCents = Math.round(amountKES * 100)
  const date = formData.get('date') as string
  const type = formData.get('type') as 'income' | 'expense'
  const accountId = formData.get('account_id') as string
  const categoryId = (formData.get('category_id') as string) || null
  const notes = (formData.get('notes') as string) || null

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { error: insertError } = await supabase.from('transactions').insert({
    household_id: householdId,
    account_id: accountId,
    category_id: categoryId,
    amount: amountCents,
    type,
    date,
    notes,
    created_by: user.id,
  })

  if (insertError) throw new Error(insertError.message)

  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', accountId)
    .eq('household_id', householdId)
    .single()

  if (accountError || !account) throw new Error(accountError?.message ?? 'Account not found')

  const newBalance =
    type === 'expense' ? account.balance - amountCents : account.balance + amountCents

  const { error: balanceError } = await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('id', accountId)
    .eq('household_id', householdId)

  if (balanceError) throw new Error(balanceError.message)

  revalidatePath('/transactions')
  redirect('/transactions')
}

export async function updateTransaction(id: string, formData: FormData): Promise<void> {
  const amountKES = parseFloat(formData.get('amount') as string) || 0
  const newAmountCents = Math.round(amountKES * 100)
  const date = formData.get('date') as string
  const type = formData.get('type') as 'income' | 'expense'
  const accountId = formData.get('account_id') as string
  const categoryId = (formData.get('category_id') as string) || null
  const notes = (formData.get('notes') as string) || null

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { data: oldTx, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('household_id', householdId)
    .single()

  if (fetchError || !oldTx) throw new Error(fetchError?.message ?? 'Transaction not found')

  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', oldTx.account_id)
    .eq('household_id', householdId)
    .single()

  if (accountError || !account) throw new Error(accountError?.message ?? 'Account not found')

  // Reverse old transaction effect
  let balance = account.balance
  if (oldTx.type === 'expense') {
    balance += oldTx.amount
  } else {
    balance -= oldTx.amount
  }

  // Apply new transaction effect
  if (type === 'expense') {
    balance -= newAmountCents
  } else {
    balance += newAmountCents
  }

  const { error: updateError } = await supabase
    .from('transactions')
    .update({
      account_id: accountId,
      category_id: categoryId,
      amount: newAmountCents,
      type,
      date,
      notes,
    })
    .eq('id', id)
    .eq('household_id', householdId)

  if (updateError) throw new Error(updateError.message)

  const { error: balanceError } = await supabase
    .from('accounts')
    .update({ balance })
    .eq('id', oldTx.account_id)
    .eq('household_id', householdId)

  if (balanceError) throw new Error(balanceError.message)

  revalidatePath('/transactions')
  redirect('/transactions')
}

export async function deleteTransaction(id: string): Promise<void> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { data: tx, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('household_id', householdId)
    .single()

  if (fetchError || !tx) throw new Error(fetchError?.message ?? 'Transaction not found')

  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', tx.account_id)
    .eq('household_id', householdId)
    .single()

  if (accountError || !account) throw new Error(accountError?.message ?? 'Account not found')

  const newBalance =
    tx.type === 'expense' ? account.balance + tx.amount : account.balance - tx.amount

  const { error: deleteError } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId)

  if (deleteError) throw new Error(deleteError.message)

  const { error: balanceError } = await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('id', tx.account_id)
    .eq('household_id', householdId)

  if (balanceError) throw new Error(balanceError.message)

  revalidatePath('/transactions')
  redirect('/transactions')
}
