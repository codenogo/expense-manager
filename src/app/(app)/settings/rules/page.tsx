import Link from 'next/link'
import { getRules } from '@/lib/actions/rules'
import { getCategories } from '@/lib/actions/categories'
import { RuleList } from '@/components/settings/rule-list'
import { RuleForm } from '@/components/settings/rule-form'

export default async function CategorizationRulesPage() {
  const [rules, categories] = await Promise.all([getRules(), getCategories()])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/settings" className="hover:text-slate-700 transition-colors">
              Settings
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Categorization Rules</span>
          </div>
          <h1 className="text-lg font-semibold text-slate-900 mt-1">Categorization Rules</h1>
          <p className="text-xs text-slate-500">
            Auto-assign categories to transactions based on description patterns
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Rules ({rules.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Higher priority rules are evaluated first. Matching is case-insensitive.
            </p>
          </div>
          <RuleList rules={rules} categories={categories} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Add New Rule</h2>
          <RuleForm categories={categories} />
        </div>
      </main>
    </div>
  )
}
