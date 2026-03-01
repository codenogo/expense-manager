# Plan 04: Implement amortization schedule calculator for individual debts

## Goal
Implement amortization schedule calculator for individual debts

## Tasks

### Task 1: Implement calculateAmortization function
**Files:** `src/lib/debt-calculator.ts`
**Action:**
Add to src/lib/debt-calculator.ts:

1. New types:
```typescript
export interface AmortizationEntry {
  month: number
  payment: number      // cents
  principal: number    // cents
  interest: number     // cents
  remainingBalance: number // cents
}

export interface AmortizationResult {
  entries: AmortizationEntry[]
  totalInterest: number  // cents
  totalPaid: number      // cents
  monthsToPayoff: number
}
```

2. Function:
```typescript
export function calculateAmortization(
  balance: number,      // cents
  interestRate: number, // annual percentage (e.g., 15 for 15%)
  monthlyPayment: number // cents
): AmortizationResult
```

Algorithm:
- If balance <= 0, return empty result
- If interestRate is 0: straight division (balance / monthlyPayment months, no interest)
- Monthly simulation (cap 1200 months):
  - Calculate monthly interest: balance * (interestRate / 12 / 100)
  - Principal = min(monthlyPayment - interest, balance + interest) — if payment > balance+interest, pay only what's needed
  - New balance = balance + interest - payment
  - If balance <= 0, mark paid off
  - Push entry to array
- Return entries + totals

**Micro-steps:**
- Define AmortizationEntry interface (month, payment, principal, interest, remainingBalance)
- Define AmortizationResult interface (entries[], totalInterest, totalPaid, monthsToPayoff)
- Implement calculateAmortization(balance, interestRate, minPayment) function
- Handle edge case: zero interest rate (informal loans) — straight division
- Handle edge case: payment less than monthly interest (will never pay off — cap at max months)
- Handle edge case: zero balance — return empty schedule

**TDD:**
- required: `true`
- failingVerify:
  - `npm test -- --run src/lib/debt-calculator.test.ts`
- passingVerify:
  - `npm test -- --run src/lib/debt-calculator.test.ts`

**Verify:**
```bash
npm test -- --run src/lib/debt-calculator.test.ts
```

**Done when:** [Observable outcome]

### Task 2: Write tests for amortization calculator
**Files:** `src/lib/debt-calculator.test.ts`
**Action:**
Add amortization tests to src/lib/debt-calculator.test.ts:

New describe block 'calculateAmortization' with tests for:
1. Zero balance → empty entries, all totals zero
2. Zero interest → months = ceil(balance/payment), no interest in entries
3. Standard case: 100,000 KES (10,000,000 cents) at 15% with 5,000 KES/month payment → verify month count is reasonable (~24 months), total interest > 0
4. Payment < monthly interest → caps at 1200 months (never pays off)
5. Single large payment → 1 entry, pays off immediately
6. Each entry: principal + interest should equal payment (except possibly the last entry)
7. Last entry remainingBalance should be 0 for payable debts

Write tests FIRST (TDD red phase), then implement the function.

**Micro-steps:**
- Add test: zero balance returns empty result
- Add test: zero interest rate produces straight payoff schedule
- Add test: standard amortization with 15% interest produces correct month count
- Add test: payment less than monthly interest caps at max months
- Add test: large payment pays off in 1 month
- Add test: entries sum of principal + interest equals payment for each row
- Add test: final entry has remainingBalance of 0

**TDD:**
- required: `true`
- failingVerify:
  - `npm test -- --run src/lib/debt-calculator.test.ts`
- passingVerify:
  - `npm test -- --run src/lib/debt-calculator.test.ts`

**Verify:**
```bash
npm test -- --run src/lib/debt-calculator.test.ts
```

**Done when:** [Observable outcome]

## Verification

After all tasks:
```bash
npm test -- --run src/lib/debt-calculator.test.ts
```

## Commit Message
```
feat(debts): add amortization schedule calculator with tests
```
