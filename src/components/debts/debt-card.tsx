import Link from 'next/link'
import { Currency } from '@/components/ui/currency'
import type { Tables } from '@/types/database'

const TYPE_BADGE_CLASSES: Record<Tables<'debts'>['type'], string> = {
  bank_loan: 'bg-primary/10 text-primary',
  sacco_loan: 'bg-purple-100 text-purple-700',
  credit_card: 'bg-amber-100 text-amber-700',
  informal: 'bg-muted text-muted-foreground',
}

const TYPE_LABELS: Record<Tables<'debts'>['type'], string> = {
  bank_loan: 'Bank Loan',
  sacco_loan: 'SACCO Loan',
  credit_card: 'Credit Card',
  informal: 'Informal',
}

interface DebtCardProps {
  debt: Tables<'debts'>
}

export function DebtCard({ debt }: DebtCardProps) {
  return (
    <Link href={`/debts/${debt.id}`} className="block group">
      <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {debt.name}
            </h3>
            <span
              className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE_CLASSES[debt.type]}`}
            >
              {TYPE_LABELS[debt.type]}
            </span>
            {debt.type === 'informal' && debt.owed_to && (
              <p className="text-xs text-muted-foreground mt-1">Owed to: {debt.owed_to}</p>
            )}
          </div>
          <div className="text-right ml-4">
            <p className="text-sm font-semibold text-foreground">
              <Currency amount={debt.balance} />
            </p>
            {debt.interest_rate !== null && (
              <p className="text-xs text-muted-foreground mt-0.5">{debt.interest_rate}% p.a.</p>
            )}
          </div>
        </div>
        {debt.min_payment !== null && (
          <p className="text-xs text-muted-foreground/70 mt-2">
            Min payment: <Currency amount={debt.min_payment} />
          </p>
        )}
      </div>
    </Link>
  )
}
