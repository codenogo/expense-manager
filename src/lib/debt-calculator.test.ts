import { describe, it, expect } from 'vitest'
import { calculatePayoff, calculateAmortization, type DebtInput, type AmortizationResult } from './debt-calculator'

describe('debt-calculator', () => {
  const debts: DebtInput[] = [
    { name: 'Credit Card', balance: 50000_00, interestRate: 24, minPayment: 2500_00 },
    { name: 'Personal Loan', balance: 200000_00, interestRate: 15, minPayment: 8000_00 },
    { name: 'SACCO Loan', balance: 100000_00, interestRate: 12, minPayment: 5000_00 },
  ]

  it('avalanche orders debts by highest interest rate first', () => {
    const result = calculatePayoff(debts, 'avalanche')
    expect(result[0].name).toBe('Credit Card')      // 24%
    expect(result[1].name).toBe('Personal Loan')     // 15%
    expect(result[2].name).toBe('SACCO Loan')        // 12%
  })

  it('snowball orders debts by lowest balance first', () => {
    const result = calculatePayoff(debts, 'snowball')
    expect(result[0].name).toBe('Credit Card')       // 50,000
    expect(result[1].name).toBe('SACCO Loan')        // 100,000
    expect(result[2].name).toBe('Personal Loan')     // 200,000
  })

  it('calculates months to payoff with minimums only', () => {
    const result = calculatePayoff(debts, 'avalanche')
    // Each debt should have a positive months count
    for (const r of result) {
      expect(r.months).toBeGreaterThan(0)
      expect(r.totalPaid).toBeGreaterThan(r.months * 0) // paid something
    }
  })

  it('extra payment reduces total months', () => {
    const withoutExtra = calculatePayoff(debts, 'avalanche')
    const withExtra = calculatePayoff(debts, 'avalanche', 5000_00)

    const totalWithout = Math.max(...withoutExtra.map(r => r.months))
    const totalWith = Math.max(...withExtra.map(r => r.months))

    expect(totalWith).toBeLessThan(totalWithout)
  })

  it('handles zero-balance debts', () => {
    const withZero = [...debts, { name: 'Paid Off', balance: 0, interestRate: 10, minPayment: 0 }]
    const result = calculatePayoff(withZero, 'avalanche')
    const paidOff = result.find(r => r.name === 'Paid Off')
    expect(paidOff?.months).toBe(0)
  })

  it('handles single debt correctly', () => {
    const single: DebtInput[] = [
      { name: 'Only Debt', balance: 10000_00, interestRate: 12, minPayment: 1000_00 }
    ]
    const result = calculatePayoff(single, 'snowball')
    expect(result).toHaveLength(1)
    expect(result[0].months).toBeGreaterThan(0)
    expect(result[0].totalPaid).toBeGreaterThanOrEqual(10000_00)
  })
})

describe('calculateAmortization', () => {
  it('zero balance returns empty result with all totals zero', () => {
    const result: AmortizationResult = calculateAmortization(0, 15, 500_000)
    expect(result.entries).toHaveLength(0)
    expect(result.totalInterest).toBe(0)
    expect(result.totalPaid).toBe(0)
    expect(result.monthsToPayoff).toBe(0)
  })

  it('zero interest rate: months = ceil(balance/payment), no interest in entries', () => {
    const balance = 10_000_00   // 10,000 KES in cents
    const payment = 3_000_00    // 3,000 KES in cents
    const result: AmortizationResult = calculateAmortization(balance, 0, payment)
    const expectedMonths = Math.ceil(balance / payment) // 4 months
    expect(result.monthsToPayoff).toBe(expectedMonths)
    expect(result.totalInterest).toBe(0)
    for (const entry of result.entries) {
      expect(entry.interest).toBe(0)
      expect(entry.principal).toBeGreaterThan(0)
    }
    expect(result.entries[result.entries.length - 1].remainingBalance).toBe(0)
  })

  it('standard case: 100,000 KES at 15% with 5,000 KES monthly — reasonable months and interest > 0', () => {
    const balance = 10_000_000  // 100,000 KES in cents
    const payment = 500_000     // 5,000 KES in cents
    const result: AmortizationResult = calculateAmortization(balance, 15, payment)
    expect(result.monthsToPayoff).toBeGreaterThan(0)
    expect(result.monthsToPayoff).toBeLessThanOrEqual(30) // reasonable upper bound ~24 months
    expect(result.totalInterest).toBeGreaterThan(0)
    expect(result.totalPaid).toBeGreaterThan(balance)
  })

  it('payment less than monthly interest caps at 1200 months', () => {
    // 10,000,000 cents at 15% annual = 125,000 cents/month interest
    // payment of 100,000 < 125,000 interest → never pays off
    const balance = 10_000_000
    const payment = 100_000   // less than monthly interest
    const result: AmortizationResult = calculateAmortization(balance, 15, payment)
    expect(result.monthsToPayoff).toBe(1200)
  })

  it('single large payment pays off in 1 entry', () => {
    const balance = 5_000_00   // 5,000 KES in cents
    const payment = 100_000_00 // 100,000 KES — much larger than balance
    const result: AmortizationResult = calculateAmortization(balance, 12, payment)
    expect(result.entries).toHaveLength(1)
    expect(result.entries[0].remainingBalance).toBe(0)
  })

  it('each entry: principal + interest = payment (except possibly last entry)', () => {
    const balance = 10_000_000
    const payment = 500_000
    const result: AmortizationResult = calculateAmortization(balance, 15, payment)
    const allButLast = result.entries.slice(0, -1)
    for (const entry of allButLast) {
      expect(entry.principal + entry.interest).toBe(entry.payment)
    }
  })

  it('last entry remainingBalance is 0 for payable debts', () => {
    const balance = 5_000_000
    const payment = 300_000
    const result: AmortizationResult = calculateAmortization(balance, 12, payment)
    const last = result.entries[result.entries.length - 1]
    expect(last.remainingBalance).toBe(0)
  })
})
