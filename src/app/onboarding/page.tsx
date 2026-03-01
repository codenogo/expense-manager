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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card rounded-xl shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Set up your household</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Give your household a name to get started tracking finances together.
          </p>
        </div>

        <form action={createHousehold} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Household name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              className="w-full rounded-lg border border-input px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="e.g. The Mwangi Household"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
          >
            Create household
          </button>
        </form>
      </div>
    </div>
  )
}
