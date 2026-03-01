import Link from 'next/link'
import { getDebt, updateDebt, recordPayment } from '@/lib/actions/debts'
import { getAccounts } from '@/lib/actions/accounts'
import { DebtForm } from '@/components/debts/debt-form'
import { DeleteDebtButton } from '@/components/debts/delete-debt-button'
import { Currency } from '@/components/ui/currency'

interface DebtDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function DebtDetailPage({ params }: DebtDetailPageProps) {
  const { id } = await params
  const [debt, accounts] = await Promise.all([getDebt(id), getAccounts()])

  const updateWithId = updateDebt.bind(null, id)
  const recordPaymentWithId = recordPayment.bind(null, id)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/debts"
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Debts
            </Link>
            <span className="text-slate-300">/</span>
            <h1 className="text-lg font-semibold text-slate-900">{debt.name}</h1>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            <Currency amount={debt.balance} />
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <DebtForm debt={debt} action={updateWithId} />

        <div className="max-w-lg">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Record Payment</h3>
            <form action={recordPaymentWithId} className="space-y-4">
              <div>
                <label
                  htmlFor="payment_amount"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Amount (KES)
                </label>
                <input
                  id="payment_amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label
                  htmlFor="account_id"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Account <span className="text-slate-400">(optional)</span>
                </label>
                <select
                  id="account_id"
                  name="account_id"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">None</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Set an account to auto-create an expense transaction.
                </p>
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Record Payment
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-lg">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
            <h3 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h3>
            <p className="text-sm text-slate-500 mb-4">
              Deleting this debt is permanent and cannot be undone.
            </p>
            <DeleteDebtButton id={id} name={debt.name} />
          </div>
        </div>
      </main>
    </div>
  )
}
