'use server'

import { createClient } from '@/lib/supabase/server'
import { getHouseholdId } from '@/lib/auth'
import type { Tables } from '@/types/database'

export async function getNotifications(): Promise<Tables<'notifications'>[]> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('household_id', householdId)
    .eq('read', false)

  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function markAsRead(id: string) {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('household_id', householdId)

  if (error) throw new Error(error.message)
}

export async function markAllAsRead() {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('household_id', householdId)
    .eq('read', false)

  if (error) throw new Error(error.message)
}
