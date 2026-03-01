'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getHouseholdId, getAuthContext } from '@/lib/auth'
import type { Tables } from '@/types/database'

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

  const { user } = await getAuthContext()

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

  if (insertError) {
    redirect('/transactions?error=Failed+to+create+transaction')
  }

  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', accountId)
    .eq('household_id', householdId)
    .single()

  if (accountError || !account) {
    redirect('/transactions?error=Account+not+found')
  }

  const newBalance =
    type === 'expense' ? account.balance - amountCents : account.balance + amountCents

  const { error: balanceError } = await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('id', accountId)
    .eq('household_id', householdId)

  if (balanceError) {
    redirect('/transactions?error=Failed+to+update+account+balance')
  }

  updateTag(`dashboard-${householdId}`)
  updateTag(`accounts-${householdId}`)
  updateTag(`reports-${householdId}`)
  redirect('/transactions?toast=Transaction+created')
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

  if (updateError) {
    redirect('/transactions?error=Failed+to+update+transaction')
  }

  const { error: balanceError } = await supabase
    .from('accounts')
    .update({ balance })
    .eq('id', oldTx.account_id)
    .eq('household_id', householdId)

  if (balanceError) {
    redirect('/transactions?error=Failed+to+update+account+balance')
  }

  updateTag(`dashboard-${householdId}`)
  updateTag(`accounts-${householdId}`)
  updateTag(`reports-${householdId}`)
  redirect('/transactions?toast=Transaction+updated')
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

  if (deleteError) {
    redirect('/transactions?error=Failed+to+delete+transaction')
  }

  const { error: balanceError } = await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('id', tx.account_id)
    .eq('household_id', householdId)

  if (balanceError) {
    redirect('/transactions?error=Failed+to+update+account+balance')
  }

  updateTag(`dashboard-${householdId}`)
  updateTag(`accounts-${householdId}`)
  updateTag(`reports-${householdId}`)
  redirect('/transactions?toast=Transaction+deleted')
}

export async function quickCreateTransaction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const amountKES = parseFloat(formData.get('amount') as string) || 0
  const amountCents = Math.round(amountKES * 100)
  const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0]
  const type = formData.get('type') as 'income' | 'expense'
  const accountId = formData.get('account_id') as string
  const categoryId = (formData.get('category_id') as string) || null
  const notes = (formData.get('notes') as string) || null

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { user } = await getAuthContext()

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

  if (insertError) return { success: false, error: insertError.message }

  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', accountId)
    .eq('household_id', householdId)
    .single()

  if (accountError || !account) return { success: false, error: 'Account not found' }

  const newBalance =
    type === 'expense' ? account.balance - amountCents : account.balance + amountCents

  const { error: balanceError } = await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('id', accountId)
    .eq('household_id', householdId)

  if (balanceError) return { success: false, error: balanceError.message }

  updateTag(`dashboard-${householdId}`)
  updateTag(`accounts-${householdId}`)
  updateTag(`reports-${householdId}`)
  return { success: true }
}

export async function searchTransactions(query: string): Promise<Tables<'transactions'>[]> {
  if (!query.trim()) return []

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('household_id', householdId)
    .ilike('notes', `%${query}%`)
    .order('date', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}
