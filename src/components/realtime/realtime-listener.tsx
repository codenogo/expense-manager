'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { revalidateByTag } from '@/lib/actions/revalidate'

const TABLE_TO_TAGS: Record<string, string[]> = {
  transactions: ['dashboard', 'accounts', 'reports'],
  budgets: ['budgets', 'dashboard'],
  recurring_items: ['recurring', 'dashboard'],
  categories: ['categories'],
  accounts: ['accounts', 'dashboard'],
  savings_goals: ['dashboard', 'accounts'],
  debts: ['dashboard', 'accounts'],
}

export function RealtimeListener({ householdId }: { householdId: string }) {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`household-${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const table = payload.table
          const tags = TABLE_TO_TAGS[table] ?? []
          for (const tag of tags) {
            revalidateByTag(`${tag}-${householdId}`)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [householdId])

  return null
}
