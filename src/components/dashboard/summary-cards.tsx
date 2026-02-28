import { formatKES } from '@/components/ui/currency'

interface SummaryCardsProps {
  totalIncome: number
  totalExpenses: number
  net: number
}

export function SummaryCards({ totalIncome, totalExpenses, net }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-sm text-slate-500">Income</p>
        <p className="text-2xl font-semibold text-emerald-600 mt-1">{formatKES(totalIncome)}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-sm text-slate-500">Expenses</p>
        <p className="text-2xl font-semibold text-red-600 mt-1">{formatKES(totalExpenses)}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-sm text-slate-500">Net</p>
        <p className={`text-2xl font-semibold mt-1 ${net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {formatKES(net)}
        </p>
      </div>
    </div>
  )
}
