import { Currency } from '@/components/ui/currency'
import type { Tables } from '@/types/database'

interface PaymentHistoryProps {
  payments: Tables<'debt_payments'>[]
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Payment History</h3>

        {payments.length === 0 ? (
          <p className="text-sm text-slate-400">No payments recorded yet</p>
        ) : (
          <>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <p className="text-sm text-slate-900">
                      {new Date(payment.date).toLocaleDateString('en-KE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-slate-400">{payment.notes}</p>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    <Currency amount={payment.amount} />
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between">
              <p className="text-sm font-medium text-slate-500">Total Paid</p>
              <p className="text-sm font-semibold text-slate-900">
                <Currency amount={payments.reduce((sum, p) => sum + p.amount, 0)} />
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
