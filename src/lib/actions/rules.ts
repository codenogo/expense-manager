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

export async function getRules(): Promise<Tables<'categorization_rules'>[]> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { data, error } = await supabase
    .from('categorization_rules')
    .select('*')
    .eq('household_id', householdId)
    .order('priority', { ascending: false })
    .order('match_pattern')

  if (error) throw new Error(error.message)

  return data ?? []
}

export async function createRule(formData: FormData): Promise<{ error?: string } | void> {
  const match_pattern = formData.get('match_pattern') as string
  const match_type = formData.get('match_type') as 'contains' | 'exact' | 'starts_with'
  const category_id = formData.get('category_id') as string
  const priority = parseInt((formData.get('priority') as string) ?? '0', 10)

  if (!match_pattern?.trim()) return { error: 'Pattern is required' }
  if (!match_type) return { error: 'Match type is required' }
  if (!category_id) return { error: 'Category is required' }
  if (!['contains', 'exact', 'starts_with'].includes(match_type)) {
    return { error: 'Invalid match type' }
  }

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase.from('categorization_rules').insert({
    household_id: householdId,
    match_pattern: match_pattern.trim(),
    match_type,
    category_id,
    priority: isNaN(priority) ? 0 : priority,
  })

  if (error) return { error: error.message }

  revalidatePath('/settings/rules')
}

export async function updateRule(
  id: string,
  formData: FormData
): Promise<{ error?: string } | void> {
  const match_pattern = formData.get('match_pattern') as string
  const match_type = formData.get('match_type') as 'contains' | 'exact' | 'starts_with'
  const category_id = formData.get('category_id') as string
  const priority = parseInt((formData.get('priority') as string) ?? '0', 10)

  if (!match_pattern?.trim()) return { error: 'Pattern is required' }
  if (!match_type) return { error: 'Match type is required' }
  if (!category_id) return { error: 'Category is required' }
  if (!['contains', 'exact', 'starts_with'].includes(match_type)) {
    return { error: 'Invalid match type' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('categorization_rules')
    .update({
      match_pattern: match_pattern.trim(),
      match_type,
      category_id,
      priority: isNaN(priority) ? 0 : priority,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/settings/rules')
}

export async function deleteRule(id: string): Promise<{ error?: string } | void> {
  const supabase = await createClient()

  const { error } = await supabase.from('categorization_rules').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/settings/rules')
}
