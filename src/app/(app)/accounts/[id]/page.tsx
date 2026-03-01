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
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/accounts"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Accounts
            </Link>
            <span className="text-border">/</span>
            <h1 className="text-lg font-semibold text-foreground">{account.name}</h1>
          </div>
          <p className="text-sm font-semibold text-foreground">
            <Currency amount={account.balance} />
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <AccountForm account={account} />

        <div className="max-w-lg">
          <div className="bg-card rounded-xl shadow-sm p-6 border border-destructive/20">
            <h3 className="text-sm font-semibold text-destructive mb-1">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
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
                className="rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
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
