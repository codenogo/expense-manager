'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getHouseholdId } from '@/lib/auth'
import type { Tables } from '@/types/database'

export async function getCategories(): Promise<Tables<'categories'>[]> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('household_id', householdId)
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
  const householdId = await getHouseholdId()

  const { error } = await supabase
    .from('categories')
    .update({
      name: name.trim(),
      parent_id: parentId,
      icon,
      color,
    })
    .eq('id', id)
    .eq('household_id', householdId)

  if (error) return { error: error.message }

  revalidatePath('/categories')
}

export async function deleteCategory(id: string): Promise<{ error?: string } | void> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { count, error: countError } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)
    .eq('household_id', householdId)

  if (countError) return { error: countError.message }

  if (count && count > 0) {
    return { error: `Category has ${count} transaction${count === 1 ? '' : 's'}. Reassign them first.` }
  }

  const { error } = await supabase.from('categories').delete().eq('id', id).eq('household_id', householdId)

  if (error) return { error: error.message }

  revalidatePath('/categories')
}
