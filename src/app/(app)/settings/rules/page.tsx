import Link from 'next/link'
import { getRules } from '@/lib/actions/rules'
import { getCategories } from '@/lib/actions/categories'
import { RuleList } from '@/components/settings/rule-list'
import { RuleForm } from '@/components/settings/rule-form'

export default async function CategorizationRulesPage() {
  const [rules, categories] = await Promise.all([getRules(), getCategories()])

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/settings" className="hover:text-foreground transition-colors">
              Settings
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Categorization Rules</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground mt-1">Categorization Rules</h1>
          <p className="text-xs text-muted-foreground">
            Auto-assign categories to transactions based on description patterns
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="bg-card rounded-xl border border-border">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Rules ({rules.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Higher priority rules are evaluated first. Matching is case-insensitive.
            </p>
          </div>
          <RuleList rules={rules} categories={categories} />
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Add New Rule</h2>
          <RuleForm categories={categories} />
        </div>
      </main>
    </div>
  )
}
