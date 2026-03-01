import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAccounts } from '@/lib/actions/accounts'
import { getCategories } from '@/lib/actions/categories'
import { getRecurringItems } from '@/lib/actions/recurring'
import { BillForm } from '@/components/bills/bill-form'

interface EditBillPageProps {
  params: Promise<{ id: string }>
}

export default async function EditBillPage({ params }: EditBillPageProps) {
  const { id } = await params
  const [items, accounts, categories] = await Promise.all([
    getRecurringItems(),
    getAccounts(),
    getCategories(),
  ])

  const item = items.find((i) => i.id === id)
  if (!item) notFound()

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/bills"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Bills
          </Link>
          <span className="text-border">/</span>
          <h1 className="text-lg font-semibold text-foreground">Edit Bill</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <BillForm accounts={accounts} categories={categories} item={item} />
      </main>
    </div>
  )
}
