import Link from 'next/link'
import { createDebt } from '@/lib/actions/debts'
import { DebtForm } from '@/components/debts/debt-form'

export default function NewDebtPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/debts"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Debts
          </Link>
          <span className="text-border">/</span>
          <h1 className="text-lg font-semibold text-foreground">New Debt</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <DebtForm action={createDebt} />
      </main>
    </div>
  )
}
