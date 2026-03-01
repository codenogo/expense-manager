'use server'

import { unstable_cache, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getHouseholdId } from '@/lib/auth'
import type { Tables } from '@/types/database'

export async function getAccounts(): Promise<Tables<'accounts'>[]> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('household_id', householdId)
        .order('type')
        .order('name')

      if (error) {
        throw new Error(error.message)
      }

      return data ?? []
    },
    ['accounts', householdId],
    { tags: [`accounts-${householdId}`], revalidate: 300 }
  )()
}

export async function getAccount(id: string): Promise<Tables<'accounts'>> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .eq('household_id', householdId)
        .single()

      if (error || !data) {
        throw new Error(error?.message ?? 'Account not found')
      }

      return data
    },
    ['account', householdId, id],
    { tags: [`accounts-${householdId}`], revalidate: 300 }
  )()
}

export async function createAccount(formData: FormData): Promise<void> {
  const name = formData.get('name') as string
  const type = formData.get('type') as Tables<'accounts'>['type']
  const balanceKES = parseFloat(formData.get('balance') as string) || 0
  const balanceCents = Math.round(balanceKES * 100)

  if (type === 'loan') {
    redirect('/accounts?error=Loan+accounts+are+automatically+managed')
  }

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase.from('accounts').insert({
    household_id: householdId,
    name,
    type,
    balance: balanceCents,
  })

  if (error) {
    redirect('/accounts?error=Failed+to+create+account')
  }

  updateTag(`accounts-${householdId}`)
  redirect('/accounts?toast=Account+created')
}

export async function updateAccount(id: string, formData: FormData): Promise<void> {
  const name = formData.get('name') as string
  const type = formData.get('type') as Tables<'accounts'>['type']
  const balanceKES = parseFloat(formData.get('balance') as string) || 0
  const balanceCents = Math.round(balanceKES * 100)

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { data: existing } = await supabase
    .from('accounts')
    .select('is_system_managed')
    .eq('id', id)
    .eq('household_id', householdId)
    .single()

  if (existing?.is_system_managed) {
    redirect('/accounts?error=Cannot+edit+system-managed+account')
  }

  const { error } = await supabase
    .from('accounts')
    .update({ name, type, balance: balanceCents })
    .eq('id', id)
    .eq('household_id', householdId)

  if (error) {
    redirect('/accounts?error=Failed+to+update+account')
  }

  updateTag(`accounts-${householdId}`)
  redirect('/accounts?toast=Account+updated')
}

export async function deleteAccount(id: string): Promise<void> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { data: existing } = await supabase
    .from('accounts')
    .select('is_system_managed')
    .eq('id', id)
    .eq('household_id', householdId)
    .single()

  if (existing?.is_system_managed) {
    redirect('/accounts?error=Cannot+delete+system-managed+account')
  }

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId)

  if (error) {
    redirect('/accounts?error=Failed+to+delete+account')
  }

  updateTag(`accounts-${householdId}`)
  redirect('/accounts?toast=Account+deleted')
}
