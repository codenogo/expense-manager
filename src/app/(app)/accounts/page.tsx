import Link from 'next/link'
import { getAccounts } from '@/lib/actions/accounts'
import { AccountCard } from '@/components/accounts/account-card'
import { Currency } from '@/components/ui/currency'
import type { Tables } from '@/types/database'

const TYPE_LABELS: Record<Tables<'accounts'>['type'], string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  loan: 'Loan',
  cash: 'Cash',
  mpesa: 'M-Pesa',
}

export default async function AccountsPage() {
  const accounts = await getAccounts()

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  const grouped = accounts.reduce<Partial<Record<Tables<'accounts'>['type'], Tables<'accounts'>[]>>>(
    (acc, account) => {
      if (!acc[account.type]) acc[account.type] = []
      acc[account.type]!.push(account)
      return acc
    },
    {}
  )

  const typeOrder: Tables<'accounts'>['type'][] = [
    'checking',
    'savings',
    'mpesa',
    'cash',
    'credit_card',
    'loan',
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Accounts</h1>
            <p className="text-xs text-slate-500">Manage your household accounts</p>
          </div>
          <Link
            href="/accounts/new"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Add Account
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500 mb-1">Total Balance</p>
          <p className="text-3xl font-semibold text-slate-900">
            <Currency amount={totalBalance} />
          </p>
          <p className="text-xs text-slate-400 mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>

        {accounts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <p className="text-slate-500 text-sm mb-4">No accounts yet. Add your first account to get started.</p>
            <Link
              href="/accounts/new"
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Add Account
            </Link>
          </div>
        ) : (
          typeOrder.map((type) => {
            const group = grouped[type]
            if (!group || group.length === 0) return null
            return (
              <section key={type}>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  {TYPE_LABELS[type]}
                </h2>
                {type === 'loan' && (
                  <p className="text-xs text-slate-400 mb-3">Automatically tracks total debt balance</p>
                )}
                {type !== 'loan' && <div className="mb-2" />}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((account) => (
                    <AccountCard key={account.id} account={account} />
                  ))}
                </div>
              </section>
            )
          })
        )}
      </main>
    </div>
  )
}
