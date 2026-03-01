import Link from 'next/link'
import { Currency } from '@/components/ui/currency'
import type { Tables } from '@/types/database'

const TYPE_BADGE_CLASSES: Record<Tables<'accounts'>['type'], string> = {
  checking: 'bg-blue-100 text-blue-700',
  savings: 'bg-green-100 text-green-700',
  credit_card: 'bg-orange-100 text-orange-700',
  loan: 'bg-red-100 text-red-700',
  cash: 'bg-gray-100 text-gray-700',
  mpesa: 'bg-emerald-100 text-emerald-700',
}

const TYPE_LABELS: Record<Tables<'accounts'>['type'], string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  loan: 'Loan',
  cash: 'Cash',
  mpesa: 'M-Pesa',
}

interface AccountCardProps {
  account: Tables<'accounts'>
}

export function AccountCard({ account }: AccountCardProps) {
  return (
    <Link href={`/accounts/${account.id}`} className="block group">
      <div className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow ${account.is_system_managed ? 'border-2 border-dashed border-slate-200' : 'border border-slate-100'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
              {account.name}
            </h3>
            <span
              className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE_CLASSES[account.type]}`}
            >
              {TYPE_LABELS[account.type]}
            </span>
            {account.is_system_managed && (
              <span className="inline-block mt-1 ml-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Auto-managed
              </span>
            )}
          </div>
          <div className="text-right ml-4">
            <p className="text-sm font-semibold text-slate-900">
              <Currency amount={account.balance} />
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
