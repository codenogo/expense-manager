'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'

export async function createHousehold(formData: FormData): Promise<void> {
  const name = formData.get('name') as string

  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/sign-in')
  }

  const { data: household, error: householdError } = await supabase
    .from('households')
    .insert({ name })
    .select('id')
    .single()

  if (householdError || !household) {
    throw new Error(householdError?.message ?? 'Failed to create household')
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ household_id: household.id, role: 'admin' })
    .eq('id', user.id)

  if (profileError) {
    throw new Error(profileError.message)
  }

  redirect('/dashboard')
}

export async function getHousehold(): Promise<{
  household: Tables<'households'> | null
  members: Tables<'profiles'>[]
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { household: null, members: [] }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  if (!profile?.household_id) {
    return { household: null, members: [] }
  }

  const { data: household } = await supabase
    .from('households')
    .select('*')
    .eq('id', profile.household_id)
    .single()

  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .eq('household_id', profile.household_id)

  return {
    household: household ?? null,
    members: members ?? [],
  }
}
