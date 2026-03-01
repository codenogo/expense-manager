import Link from 'next/link'
import { getDebt, updateDebt, deleteDebt, recordPayment } from '@/lib/actions/debts'
import { getAccounts } from '@/lib/actions/accounts'
import { DebtForm } from '@/components/debts/debt-form'
import { Currency } from '@/components/ui/currency'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DebtDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function DebtDetailPage({ params }: DebtDetailPageProps) {
  const { id } = await params
  const [debt, accounts] = await Promise.all([getDebt(id), getAccounts()])

  const updateWithId = updateDebt.bind(null, id)
  const deleteWithId = deleteDebt.bind(null, id)
  const recordPaymentWithId = recordPayment.bind(null, id)

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/debts"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Debts
            </Link>
            <span className="text-border">/</span>
            <h1 className="text-lg font-semibold text-foreground">{debt.name}</h1>
          </div>
          <p className="text-sm font-semibold text-foreground">
            <Currency amount={debt.balance} />
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <DebtForm debt={debt} action={updateWithId} />

        <div className="max-w-lg">
          <div className="bg-card rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Record Payment</h3>
            <form action={recordPaymentWithId} className="space-y-4">
              <div>
                <Label htmlFor="payment_amount" className="mb-1">
                  Amount (KES)
                </Label>
                <Input
                  id="payment_amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label className="mb-1">
                  Account <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Select name="account_id" defaultValue="">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Set an account to auto-create an expense transaction.
                </p>
              </div>

              <Button type="submit">Record Payment</Button>
            </form>
          </div>
        </div>

        <div className="max-w-lg">
          <div className="bg-card rounded-xl shadow-sm p-6 border border-destructive/20">
            <h3 className="text-sm font-semibold text-destructive mb-1">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Deleting this debt is permanent and cannot be undone.
            </p>
            <form action={deleteWithId}>
              <Button type="submit" variant="destructive">
                Delete Debt
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
