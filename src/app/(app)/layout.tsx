import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getHousehold } from '@/lib/actions/household'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { household } = await getHousehold()
  if (!household) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar householdName={household.name} />
      <MobileNav />
      <main className="md:ml-64 pb-16 md:pb-0">{children}</main>
    </div>
  )
}
