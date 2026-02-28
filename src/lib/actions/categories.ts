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

export async function getCategories(): Promise<Tables<'categories'>[]> {
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

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('household_id', profile.household_id)
    .order('name')

  if (error) throw new Error(error.message)

  return data ?? []
}

export async function createCategory(formData: FormData): Promise<{ error?: string } | void> {
  const name = formData.get('name') as string
  const parentId = (formData.get('parent_id') as string) || null
  const icon = (formData.get('icon') as string) || null
  const color = (formData.get('color') as string) || null

  if (!name?.trim()) return { error: 'Name is required' }

  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { error } = await supabase.from('categories').insert({
    household_id: householdId,
    name: name.trim(),
    parent_id: parentId,
    icon,
    color,
  })

  if (error) return { error: error.message }

  revalidatePath('/categories')
}

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<{ error?: string } | void> {
  const name = formData.get('name') as string
  const parentId = (formData.get('parent_id') as string) || null
  const icon = (formData.get('icon') as string) || null
  const color = (formData.get('color') as string) || null

  if (!name?.trim()) return { error: 'Name is required' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .update({
      name: name.trim(),
      parent_id: parentId,
      icon,
      color,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/categories')
}

export async function deleteCategory(id: string): Promise<{ error?: string } | void> {
  const supabase = await createClient()

  const { count, error: countError } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)

  if (countError) return { error: countError.message }

  if (count && count > 0) {
    return { error: `Category has ${count} transaction${count === 1 ? '' : 's'}. Reassign them first.` }
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/categories')
}
