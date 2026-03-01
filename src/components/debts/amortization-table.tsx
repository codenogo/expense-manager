'use client'

import { calculateAmortization } from '@/lib/debt-calculator'
import { Currency } from '@/components/ui/currency'

interface AmortizationTableProps {
  balance: number
  interestRate: number | null
  minPayment: number | null
}

export function AmortizationTable({ balance, interestRate, minPayment }: AmortizationTableProps) {
  if (!interestRate || !minPayment) {
    return (
      <div className="max-w-lg">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Amortization Schedule</h3>
          <p className="text-sm text-slate-400">
            Set interest rate and minimum payment to see amortization schedule
          </p>
        </div>
      </div>
    )
  }

  const result = calculateAmortization(balance, interestRate, minPayment)

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Amortization Schedule</h3>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500">Months to Payoff</p>
            <p className="text-sm font-semibold text-slate-900">{result.monthsToPayoff}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Interest</p>
            <p className="text-sm font-semibold text-slate-900">
              <Currency amount={result.totalInterest} />
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Paid</p>
            <p className="text-sm font-semibold text-slate-900">
              <Currency amount={result.totalPaid} />
            </p>
          </div>
        </div>

        {result.entries.length === 1200 && (
          <p className="text-sm text-amber-600 mb-3">
            Payment is too low to pay off this debt
          </p>
        )}

        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
                <th className="pb-2 pr-2">#</th>
                <th className="pb-2 pr-2">Payment</th>
                <th className="pb-2 pr-2">Principal</th>
                <th className="pb-2 pr-2">Interest</th>
                <th className="pb-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {result.entries.map((entry) => (
                <tr key={entry.month} className="border-b border-slate-100">
                  <td className="py-1.5 pr-2 text-slate-500">{entry.month}</td>
                  <td className="py-1.5 pr-2">
                    <Currency amount={entry.payment} />
                  </td>
                  <td className="py-1.5 pr-2">
                    <Currency amount={entry.principal} />
                  </td>
                  <td className="py-1.5 pr-2">
                    <Currency amount={entry.interest} />
                  </td>
                  <td className="py-1.5 text-right">
                    <Currency amount={entry.remainingBalance} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
