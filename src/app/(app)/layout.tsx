import { Suspense } from 'react'
import { getAuthContext } from '@/lib/auth'
import { getAccounts } from '@/lib/actions/accounts'
import { getCategories } from '@/lib/actions/categories'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { RealtimeListener } from '@/components/realtime/realtime-listener'
import { ToastHandler } from '@/components/ui/toast-handler'
import { QuickEntryFab } from '@/components/transactions/quick-entry-fab'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, householdId } = await getAuthContext()

  const [{ data: household }, accounts, categories] = await Promise.all([
    supabase.from('households').select('name').eq('id', householdId).single(),
    getAccounts(),
    getCategories(),
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar householdName={household?.name ?? 'Home'} householdId={householdId} />
      <MobileNav />
      <main className="md:ml-64 pb-16 md:pb-0">{children}</main>
      <RealtimeListener householdId={householdId} />
      <Suspense>
        <ToastHandler />
      </Suspense>
      <QuickEntryFab accounts={accounts} categories={categories} />
    </div>
  )
}
