'use client'

import { useState } from 'react'
import type { Tables } from '@/types/database'
import { calculatePayoff, type DebtInput } from '@/lib/debt-calculator'
import { formatKES } from '@/components/ui/currency'

interface PayoffStrategyProps {
  debts: Tables<'debts'>[]
}

export function PayoffStrategy({ debts }: PayoffStrategyProps) {
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball'>('avalanche')
  const [extraMonthly, setExtraMonthly] = useState<number>(0)

  const debtInputs: DebtInput[] = debts.map((d) => ({
    name: d.name,
    balance: d.balance,
    interestRate: d.interest_rate ?? 0,
    minPayment: d.min_payment ?? 0,
  }))

  const results = calculatePayoff(debtInputs, strategy, Math.round(extraMonthly * 100))

  const activeButtonClass = 'bg-primary text-primary-foreground border border-primary'
  const inactiveButtonClass = 'bg-card border border-border text-foreground hover:bg-muted/50'

  return (
    <section className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-base font-semibold text-foreground mb-4">Payoff Strategy</h2>

      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${strategy === 'avalanche' ? activeButtonClass : inactiveButtonClass}`}
          onClick={() => setStrategy('avalanche')}
        >
          Avalanche (Highest Interest First)
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${strategy === 'snowball' ? activeButtonClass : inactiveButtonClass}`}
          onClick={() => setStrategy('snowball')}
        >
          Snowball (Lowest Balance First)
        </button>
      </div>

      <div className="mb-6">
        <label htmlFor="extra-payment" className="block text-sm text-muted-foreground mb-1">
          Extra monthly payment (KES)
        </label>
        <input
          id="extra-payment"
          type="number"
          min="0"
          step="100"
          value={extraMonthly || ''}
          onChange={(e) => setExtraMonthly(parseFloat(e.target.value) || 0)}
          placeholder="0"
          className="w-40 rounded-lg border border-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">
                Order
              </th>
              <th className="pb-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Name
              </th>
              <th className="pb-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Balance
              </th>
              <th className="pb-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                Months
              </th>
              <th className="pb-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Interest
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.name} className="border-b border-border last:border-0">
                <td className="py-3 text-muted-foreground font-medium">{r.order}</td>
                <td className="py-3 text-foreground font-medium">{r.name}</td>
                <td className="py-3 text-right text-foreground">
                  {formatKES(debtInputs.find((d) => d.name === r.name)?.balance ?? 0)}
                </td>
                <td className="py-3 text-right text-foreground">
                  {r.months === 0 ? (
                    <span className="text-emerald-600 font-medium">Paid off</span>
                  ) : (
                    r.months
                  )}
                </td>
                <td className="py-3 text-right text-foreground">{formatKES(r.totalInterest)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {results.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No debts to display.</p>
      )}
    </section>
  )
}
