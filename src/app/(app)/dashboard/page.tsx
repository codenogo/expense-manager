import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getHousehold } from '@/lib/actions/household'
import { signOut } from '@/lib/actions/auth'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const { household, members } = await getHousehold()

  if (!household) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{household.name}</h1>
            <p className="text-xs text-slate-500">Household Finance Planner</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">
            Welcome to {household.name}
          </h2>
          <p className="text-sm text-slate-500">
            Your household finances are ready to be tracked. Add accounts, record transactions, and
            set budgets to get started.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Household members</h3>
          <ul className="divide-y divide-slate-100">
            {members.map((member) => (
              <li key={member.id} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-slate-900">{member.full_name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                  {member.role}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}
