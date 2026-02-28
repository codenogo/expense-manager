import { describe, it, expect } from 'vitest'
import { calculatePayoff, type DebtInput } from './debt-calculator'

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
