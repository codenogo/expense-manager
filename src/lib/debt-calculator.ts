export interface DebtInput {
  name: string
  balance: number      // cents
  interestRate: number // annual percentage (e.g., 15 for 15%)
  minPayment: number   // cents
}

export interface PayoffResult {
  name: string
  months: number
  totalPaid: number      // cents
  totalInterest: number  // cents
  order: number
}

export interface AmortizationEntry {
  month: number
  payment: number          // cents
  principal: number        // cents
  interest: number         // cents
  remainingBalance: number // cents
}

export interface AmortizationResult {
  entries: AmortizationEntry[]
  totalInterest: number  // cents
  totalPaid: number      // cents
  monthsToPayoff: number
}

export function calculateAmortization(
  balance: number,        // cents
  interestRate: number,   // annual percentage (e.g., 15 for 15%)
  monthlyPayment: number  // cents
): AmortizationResult {
  if (balance <= 0) {
    return { entries: [], totalInterest: 0, totalPaid: 0, monthsToPayoff: 0 }
  }

  const MAX_MONTHS = 1200
  const entries: AmortizationEntry[] = []
  let remaining = balance

  if (interestRate === 0) {
    let month = 1
    while (remaining > 0 && month <= MAX_MONTHS) {
      const payment = Math.min(monthlyPayment, remaining)
      remaining -= payment
      entries.push({
        month,
        payment,
        principal: payment,
        interest: 0,
        remainingBalance: Math.max(0, remaining),
      })
      month++
    }
  } else {
    const monthlyRate = interestRate / 12 / 100
    for (let month = 1; month <= MAX_MONTHS; month++) {
      const monthInterest = Math.round(remaining * monthlyRate)
      const actualPayment = Math.min(monthlyPayment, remaining + monthInterest)
      const principal = actualPayment - monthInterest
      remaining = Math.max(0, remaining + monthInterest - actualPayment)
      entries.push({
        month,
        payment: actualPayment,
        principal,
        interest: monthInterest,
        remainingBalance: remaining,
      })
      if (remaining <= 0) break
    }
  }

  const totalInterest = entries.reduce((sum, e) => sum + e.interest, 0)
  const totalPaid = entries.reduce((sum, e) => sum + e.payment, 0)

  return {
    entries,
    totalInterest,
    totalPaid,
    monthsToPayoff: entries.length,
  }
}

export function calculatePayoff(
  debts: DebtInput[],
  strategy: 'avalanche' | 'snowball',
  extraMonthly: number = 0
): PayoffResult[] {
  // Sort by strategy: avalanche = highest interest first, snowball = lowest balance first
  const sorted = [...debts].sort((a, b) => {
    if (strategy === 'avalanche') {
      return b.interestRate - a.interestRate
    }
    return a.balance - b.balance
  })

  // Track mutable state per debt
  const state = sorted.map((d) => ({
    name: d.name,
    balance: d.balance,
    interestRate: d.interestRate,
    minPayment: d.minPayment,
    paidOff: d.balance <= 0,
    monthsPaidOff: d.balance <= 0 ? 0 : -1,
    totalPaid: 0,
    totalInterest: 0,
  }))

  // Simulate month by month (cap at 1200 months = 100 years to prevent infinite loops)
  const MAX_MONTHS = 1200
  let month = 0

  while (month < MAX_MONTHS) {
    // Check if all debts are paid off
    if (state.every((s) => s.paidOff)) break

    month++

    // 1. Accrue monthly interest on remaining balances
    for (const s of state) {
      if (s.paidOff) continue
      const monthlyInterest = Math.round(s.balance * (s.interestRate / 12 / 100))
      s.balance += monthlyInterest
      s.totalInterest += monthlyInterest
    }

    // 2. Pay minimums on all debts
    for (const s of state) {
      if (s.paidOff) continue
      const payment = Math.min(s.minPayment, s.balance)
      s.balance -= payment
      s.totalPaid += payment
      if (s.balance <= 0) {
        s.balance = 0
        s.paidOff = true
        s.monthsPaidOff = month
      }
    }

    // Freed minimums from this month's payoffs shouldn't double-count — reset to just extra
    // The freed minimums computed above include the ones from already-paid debts (accumulated)
    // We need to apply extra + freed (from this month's new payoffs) to the priority debt
    // But the freed minimums variable above accumulates ALL freed minimums including from
    // previous months. We only want to apply extra to the first unpaid debt.
    // Rebuild: extra + this month's freed minimums (from debts that just got paid off this month)
    const availableExtra = extraMonthly

    // 3. Apply extra payment + freed minimums from prior months to priority debt
    // The freed minimums from debts paid off earlier effectively "stack" onto the priority debt.
    // We track this by re-computing total freed min capacity each month.
    const totalFreedMins = state
      .filter((s) => s.paidOff && s.monthsPaidOff < month)
      .reduce((sum, s) => sum + s.minPayment, 0)

    const bonusPayment = availableExtra + totalFreedMins

    if (bonusPayment > 0) {
      const priorityDebt = state.find((s) => !s.paidOff)
      if (priorityDebt) {
        const payment = Math.min(bonusPayment, priorityDebt.balance)
        priorityDebt.balance -= payment
        priorityDebt.totalPaid += payment
        if (priorityDebt.balance <= 0) {
          priorityDebt.balance = 0
          priorityDebt.paidOff = true
          priorityDebt.monthsPaidOff = month
        }
      }
    }
  }

  // Build results in sorted (priority) order
  return state.map((s, i) => ({
    name: s.name,
    months: s.monthsPaidOff >= 0 ? s.monthsPaidOff : month,
    totalPaid: s.totalPaid,
    totalInterest: s.totalInterest,
    order: i + 1,
  }))
}
