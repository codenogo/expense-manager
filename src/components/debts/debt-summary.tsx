import type { Tables } from '@/types/database'
import { formatKES } from '@/components/ui/currency'

interface DebtSummaryProps {
  debts: Tables<'debts'>[]
}

const TYPE_LABELS: Record<Tables<'debts'>['type'], string> = {
  bank_loan: 'Bank Loan',
  sacco_loan: 'SACCO Loan',
  credit_card: 'Credit Card',
  informal: 'Informal',
}

export function DebtSummary({ debts }: DebtSummaryProps) {
  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0)
  const totalMinPayment = debts.reduce((sum, d) => sum + (d.min_payment ?? 0), 0)

  const countByType = debts.reduce<Partial<Record<Tables<'debts'>['type'], number>>>(
    (acc, debt) => {
      acc[debt.type] = (acc[debt.type] ?? 0) + 1
      return acc
    },
    {}
  )

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        <div>
          <p className="text-sm text-slate-500 mb-1">Total Debt</p>
          <p className="text-2xl font-semibold text-slate-900">{formatKES(totalBalance)}</p>
          <p className="text-xs text-slate-400 mt-1">
            {debts.length} debt{debts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500 mb-1">Total Min. Payments</p>
          <p className="text-2xl font-semibold text-slate-900">{formatKES(totalMinPayment)}</p>
          <p className="text-xs text-slate-400 mt-1">per month</p>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <p className="text-sm text-slate-500 mb-2">By Type</p>
          <div className="space-y-1">
            {(Object.entries(countByType) as [Tables<'debts'>['type'], number][]).map(
              ([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">{TYPE_LABELS[type]}</span>
                  <span className="text-xs font-medium text-slate-900">{count}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
