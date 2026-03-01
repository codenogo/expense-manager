'use server'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const getAuthContext = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  if (!profile?.household_id) redirect('/onboarding')

  return { user, householdId: profile.household_id, supabase }
})

export async function getHouseholdId(): Promise<string> {
  const { householdId } = await getAuthContext()
  return householdId
}

export async function getAuthUser() {
  const { user } = await getAuthContext()
  return user
}
