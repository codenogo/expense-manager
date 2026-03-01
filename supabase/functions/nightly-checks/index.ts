import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const today = new Date().toISOString().split('T')[0]
  const currentMonth = today.slice(0, 7) // YYYY-MM
  let created = 0

  // 1. Check overdue bills
  const { data: overdueBills } = await supabase
    .from('recurring_items')
    .select('id, name, household_id, next_due_date, amount')
    .lt('next_due_date', today)

  for (const bill of overdueBills ?? []) {
    // Get a user from this household to notify
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('household_id', bill.household_id)
      .limit(1)
      .single()

    if (profile) {
      await supabase.from('notifications').insert({
        household_id: bill.household_id,
        user_id: profile.id,
        type: 'bill_overdue',
        title: `Bill overdue: ${bill.name}`,
        body: `${bill.name} was due on ${bill.next_due_date}. Amount: KES ${(bill.amount / 100).toLocaleString()}.`,
      })
      created++
    }
  }

  // 2. Check budget overspend
  const { data: budgets } = await supabase
    .from('budgets')
    .select('id, household_id, category_id, amount, month')
    .eq('month', currentMonth)

  for (const budget of budgets ?? []) {
    const startDate = `${budget.month}-01`
    const nextMonth = new Date(startDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const endDate = nextMonth.toISOString().split('T')[0]

    const { data: txs } = await supabase
      .from('transactions')
      .select('amount')
      .eq('household_id', budget.household_id)
      .eq('category_id', budget.category_id)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lt('date', endDate)

    const spent = (txs ?? []).reduce((sum: number, t: { amount: number }) => sum + t.amount, 0)

    if (spent > budget.amount) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('household_id', budget.household_id)
        .limit(1)
        .single()

      if (profile) {
        await supabase.from('notifications').insert({
          household_id: budget.household_id,
          user_id: profile.id,
          type: 'budget_overspend',
          title: 'Budget exceeded',
          body: `You've spent KES ${(spent / 100).toLocaleString()} of your KES ${(budget.amount / 100).toLocaleString()} budget.`,
        })
        created++
      }
    }
  }

  // 3. Check low balance (below KES 1,000 = 100000 cents)
  const { data: lowAccounts } = await supabase
    .from('accounts')
    .select('id, name, household_id, balance')
    .lt('balance', 100000)

  for (const account of lowAccounts ?? []) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('household_id', account.household_id)
      .limit(1)
      .single()

    if (profile) {
      await supabase.from('notifications').insert({
        household_id: account.household_id,
        user_id: profile.id,
        type: 'low_balance',
        title: `Low balance: ${account.name}`,
        body: `${account.name} balance is KES ${(account.balance / 100).toLocaleString()}.`,
      })
      created++
    }
  }

  return new Response(JSON.stringify({ ok: true, notifications_created: created }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
