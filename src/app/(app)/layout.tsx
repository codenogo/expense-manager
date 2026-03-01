import { getAuthContext } from '@/lib/auth'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { RealtimeListener } from '@/components/realtime/realtime-listener'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, householdId } = await getAuthContext()

  const { data: household } = await supabase
    .from('households')
    .select('name')
    .eq('id', householdId)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar householdName={household?.name ?? 'Home'} householdId={householdId} />
      <MobileNav />
      <main className="md:ml-64 pb-16 md:pb-0">{children}</main>
      <RealtimeListener householdId={householdId} />
    </div>
  )
}
