import { getCategories } from '@/lib/actions/categories'
import { CategoriesManager } from '@/components/categories/categories-manager'

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-lg font-semibold text-foreground">Categories</h1>
          <p className="text-xs text-muted-foreground">Organise your transactions into categories</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <CategoriesManager initialCategories={categories} />
      </main>
    </div>
  )
}
