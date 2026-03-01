import Link from 'next/link'
import { getAccount } from '@/lib/actions/accounts'
import { AccountForm } from '@/components/accounts/account-form'
import { DeleteAccountButton } from '@/components/accounts/delete-account-button'
import { Currency } from '@/components/ui/currency'

interface AccountDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const { id } = await params
  const account = await getAccount(id)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/accounts"
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Accounts
            </Link>
            <span className="text-slate-300">/</span>
            <h1 className="text-lg font-semibold text-slate-900">{account.name}</h1>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            <Currency amount={account.balance} />
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {account.is_system_managed ? (
          <div className="max-w-lg">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Total Loans</h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Auto-managed</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                This account automatically tracks the total balance of all your debts.
                It updates when you add, remove, or make payments on debts.
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Current Balance</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    <Currency amount={account.balance} />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Type</p>
                  <p className="text-sm font-medium text-slate-900">Loan</p>
                </div>
              </div>
              <Link
                href="/debts"
                className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                View Debts →
              </Link>
            </div>
          </div>
        ) : (
          <>
            <AccountForm account={account} />
            <div className="max-w-lg">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
                <h3 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Deleting this account is permanent and cannot be undone.
                </p>
                <DeleteAccountButton id={id} name={account.name} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
