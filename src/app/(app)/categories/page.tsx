import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCategories } from '@/lib/actions/categories'
import { CategoriesManager } from '@/components/categories/categories-manager'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-lg font-semibold text-slate-900">Categories</h1>
          <p className="text-xs text-slate-500">Organise your transactions into categories</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <CategoriesManager initialCategories={categories} />
      </main>
    </div>
  )
}
