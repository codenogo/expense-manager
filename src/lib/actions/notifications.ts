'use server'

import { createClient } from '@/lib/supabase/server'
import { getHouseholdId } from '@/lib/auth'

export async function getNotifications() {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('notifications')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return (data ?? []) as {
    id: string
    household_id: string
    user_id: string
    type: 'bill_overdue' | 'budget_overspend' | 'low_balance'
    title: string
    body: string
    read: boolean
    created_at: string
  }[]
}

export async function getUnreadCount() {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error } = await (supabase as any)
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('household_id', householdId)
    .eq('read', false)

  if (error) throw new Error(error.message)
  return (count ?? 0) as number
}

export async function markAsRead(id: string) {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('household_id', householdId)

  if (error) throw new Error(error.message)
}

export async function markAllAsRead() {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('notifications')
    .update({ read: true })
    .eq('household_id', householdId)
    .eq('read', false)

  if (error) throw new Error(error.message)
}
