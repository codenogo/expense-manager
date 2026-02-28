'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'

async function getHouseholdId(): Promise<string> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/sign-in')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.household_id) {
    redirect('/onboarding')
  }

  return profile.household_id
}

export async function getAccounts(): Promise<Tables<'accounts'>[]> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

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
}

export async function getAccount(id: string): Promise<Tables<'accounts'>> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

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
}

export async function createAccount(formData: FormData): Promise<void> {
  const name = formData.get('name') as string
  const type = formData.get('type') as Tables<'accounts'>['type']
  const balanceKES = parseFloat(formData.get('balance') as string) || 0
  const balanceCents = Math.round(balanceKES * 100)

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase.from('accounts').insert({
    household_id: householdId,
    name,
    type,
    balance: balanceCents,
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/accounts')
}

export async function updateAccount(id: string, formData: FormData): Promise<void> {
  const name = formData.get('name') as string
  const type = formData.get('type') as Tables<'accounts'>['type']
  const balanceKES = parseFloat(formData.get('balance') as string) || 0
  const balanceCents = Math.round(balanceKES * 100)

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase
    .from('accounts')
    .update({ name, type, balance: balanceCents })
    .eq('id', id)
    .eq('household_id', householdId)

  if (error) {
    throw new Error(error.message)
  }

  redirect('/accounts')
}

export async function deleteAccount(id: string): Promise<void> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId)

  if (error) {
    throw new Error(error.message)
  }

  redirect('/accounts')
}
