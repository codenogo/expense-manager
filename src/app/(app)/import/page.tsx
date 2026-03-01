import Link from 'next/link'
import { getAccounts } from '@/lib/actions/accounts'
import { getCategories } from '@/lib/actions/categories'
import { getRules } from '@/lib/actions/rules'
import { ImportWizard } from '@/components/import/import-wizard'

export default async function ImportPage() {
  const [accounts, categories, rules] = await Promise.all([
    getAccounts(),
    getCategories(),
    getRules(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/transactions" className="hover:text-foreground transition-colors">
              Transactions
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Import CSV</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground mt-1">Import Transactions</h1>
          <p className="text-xs text-muted-foreground">Upload a CSV bank statement to bulk import transactions</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-card rounded-xl border border-border p-6">
          <ImportWizard accounts={accounts} categories={categories} rules={rules} />
        </div>
      </main>
    </div>
  )
}
