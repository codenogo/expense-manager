import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createHousehold } from '@/lib/actions/household'

export default async function OnboardingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // If user already has a household, skip onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  if (profile?.household_id) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Set up your household</h1>
          <p className="mt-1 text-sm text-slate-500">
            Give your household a name to get started tracking finances together.
          </p>
        </div>

        <form action={createHousehold} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Household name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. The Mwangi Household"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Create household
          </button>
        </form>
      </div>
    </div>
  )
}
