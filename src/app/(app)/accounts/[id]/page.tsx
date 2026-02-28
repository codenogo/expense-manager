import Link from 'next/link'
import { getAccount, deleteAccount } from '@/lib/actions/accounts'
import { AccountForm } from '@/components/accounts/account-form'
import { Currency } from '@/components/ui/currency'

interface AccountDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const { id } = await params
  const account = await getAccount(id)

  const deleteWithId = deleteAccount.bind(null, id)

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
        <AccountForm account={account} />

        <div className="max-w-lg">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
            <h3 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h3>
            <p className="text-sm text-slate-500 mb-4">
              Deleting this account is permanent and cannot be undone.
            </p>
            <form
              action={deleteWithId}
              onSubmit={(e) => {
                if (!confirm(`Delete "${account.name}"? This cannot be undone.`)) {
                  e.preventDefault()
                }
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete Account
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
