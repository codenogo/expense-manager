'use server'

import { unstable_cache, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getHouseholdId, getAuthContext } from '@/lib/auth'
import type { Tables } from '@/types/database'

export async function getRecurringItems(): Promise<Tables<'recurring_items'>[]> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('recurring_items')
        .select('*')
        .eq('household_id', householdId)
        .order('next_due_date', { ascending: true })

      if (error) throw new Error(error.message)

      return data ?? []
    },
    ['recurring', householdId],
    { tags: [`recurring-${householdId}`], revalidate: 900 }
  )()
}

export async function createRecurring(formData: FormData): Promise<void> {
  const name = formData.get('name') as string
  const amountKES = parseFloat(formData.get('amount') as string) || 0
  const amountCents = Math.round(amountKES * 100)
  const frequency = formData.get('frequency') as Tables<'recurring_items'>['frequency']
  const nextDueDate = formData.get('next_due_date') as string
  const categoryId = (formData.get('category_id') as string) || null
  const accountId = (formData.get('account_id') as string) || null

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase.from('recurring_items').insert({
    household_id: householdId,
    name,
    amount: amountCents,
    frequency,
    next_due_date: nextDueDate,
    category_id: categoryId,
    account_id: accountId,
  })

  if (error) {
    redirect('/bills?error=Failed+to+create+bill')
  }

  updateTag(`recurring-${householdId}`)
  redirect('/bills?toast=Bill+created')
}

export async function updateRecurring(id: string, formData: FormData): Promise<void> {
  const name = formData.get('name') as string
  const amountKES = parseFloat(formData.get('amount') as string) || 0
  const amountCents = Math.round(amountKES * 100)
  const frequency = formData.get('frequency') as Tables<'recurring_items'>['frequency']
  const nextDueDate = formData.get('next_due_date') as string
  const categoryId = (formData.get('category_id') as string) || null
  const accountId = (formData.get('account_id') as string) || null

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase
    .from('recurring_items')
    .update({
      name,
      amount: amountCents,
      frequency,
      next_due_date: nextDueDate,
      category_id: categoryId,
      account_id: accountId,
    })
    .eq('id', id)
    .eq('household_id', householdId)

  if (error) {
    redirect('/bills?error=Failed+to+update+bill')
  }

  updateTag(`recurring-${householdId}`)
  redirect('/bills?toast=Bill+updated')
}

export async function deleteRecurring(id: string): Promise<void> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase
    .from('recurring_items')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId)

  if (error) {
    redirect('/bills?error=Failed+to+delete+bill')
  }

  updateTag(`recurring-${householdId}`)
  redirect('/bills?toast=Bill+deleted')
}

export async function markPaid(id: string): Promise<void> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { user } = await getAuthContext()

  const { data: item, error: fetchError } = await supabase
    .from('recurring_items')
    .select('*')
    .eq('id', id)
    .eq('household_id', householdId)
    .single()

  if (fetchError || !item) throw new Error(fetchError?.message ?? 'Recurring item not found')

  const today = new Date().toISOString().split('T')[0]

  // Only create a transaction if an account is linked
  if (item.account_id) {
    const { error: txError } = await supabase.from('transactions').insert({
      household_id: householdId,
      account_id: item.account_id,
      category_id: item.category_id,
      amount: item.amount,
      type: 'expense',
      date: today,
      notes: `Recurring: ${item.name}`,
      created_by: user.id,
    })

    if (txError) throw new Error(txError.message)

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', item.account_id)
      .eq('household_id', householdId)
      .single()

    if (accountError || !account) throw new Error(accountError?.message ?? 'Account not found')

    const newBalance = account.balance - item.amount

    const { error: balanceError } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', item.account_id)
      .eq('household_id', householdId)

    if (balanceError) throw new Error(balanceError.message)
  }

  // Advance next_due_date based on frequency
  const dueDate = new Date(item.next_due_date)
  if (item.frequency === 'weekly') {
    dueDate.setDate(dueDate.getDate() + 7)
  } else if (item.frequency === 'monthly') {
    dueDate.setMonth(dueDate.getMonth() + 1)
  } else if (item.frequency === 'yearly') {
    dueDate.setFullYear(dueDate.getFullYear() + 1)
  }

  const newDueDate = dueDate.toISOString().split('T')[0]

  const { error: updateError } = await supabase
    .from('recurring_items')
    .update({ next_due_date: newDueDate })
    .eq('id', id)
    .eq('household_id', householdId)

  if (updateError) throw new Error(updateError.message)

  updateTag(`recurring-${householdId}`)
  updateTag(`dashboard-${householdId}`)
  updateTag(`accounts-${householdId}`)
}
