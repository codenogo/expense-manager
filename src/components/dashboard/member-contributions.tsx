import { formatKES } from '@/components/ui/currency'

interface MemberContributionsProps {
  members: { id: string; full_name: string }[]
  transactions: { created_by: string; type: string; amount: number }[]
}

export function MemberContributions({ members, transactions }: MemberContributionsProps) {
  const memberStats = members
    .map((member) => {
      const memberTxs = transactions.filter((tx) => tx.created_by === member.id)
      const income = memberTxs
        .filter((tx) => tx.type === 'income')
        .reduce((s, tx) => s + tx.amount, 0)
      const expenses = memberTxs
        .filter((tx) => tx.type === 'expense')
        .reduce((s, tx) => s + tx.amount, 0)
      const net = income - expenses
      return { ...member, income, expenses, net }
    })
    .sort((a, b) => b.net - a.net)

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-sm font-semibold text-foreground mb-4">Member Contributions</h2>
      {memberStats.length === 0 ? (
        <p className="text-sm text-muted-foreground">No members found.</p>
      ) : (
        <div className="space-y-3">
          {memberStats.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {m.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">{m.full_name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-emerald-600">{formatKES(m.income)}</span>
                <span className="text-red-600">{formatKES(m.expenses)}</span>
                <span
                  className={`font-semibold ${m.net >= 0 ? 'text-emerald-700' : 'text-red-700'}`}
                >
                  {formatKES(m.net)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
