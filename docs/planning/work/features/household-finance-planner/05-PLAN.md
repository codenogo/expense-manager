# Plan 05: Build debt tracking with payoff strategies and savings goals with progress

## Goal
Build debt tracking with payoff strategies and savings goals with progress

## Tasks

### Task 1: Debt tracker with formal and informal debts
**Files:** `src/app/(app)/debts/page.tsx`, `src/app/(app)/debts/new/page.tsx`, `src/app/(app)/debts/[id]/page.tsx`, `src/lib/actions/debts.ts`, `src/components/debts/debt-form.tsx`, `src/components/debts/debt-card.tsx`, `src/components/debts/debt-summary.tsx`
**Action:**
Build debt management. Debt types: bank loan, SACCO loan, credit card, informal (person-to-person with owed_to field). Track balance, interest rate, minimum payment. Recording a payment reduces balance and creates a linked transaction. Summary shows total debt load.

**Micro-steps:**
- Write Server Actions: createDebt, updateDebt, deleteDebt, getDebts, recordPayment
- Build debt form: name, type (bank_loan/sacco_loan/credit_card/informal), balance, interest rate, min payment, owed_to (for informal)
- Build debt card: shows balance, rate, min payment, next due date, progress toward payoff
- Build debt summary: total owed, total minimum payments, projected payoff date
- Build debts list page grouped by type
- Build debt detail page with payment history and edit
- Implement recordPayment: reduces balance, creates a transaction

**TDD:**
- required: `false`
- reason: CRUD pages — verified by build + manual flow

**Verify:**
```bash
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

### Task 2: Debt payoff strategy calculator
**Files:** `src/lib/debt-calculator.ts`, `src/components/debts/payoff-strategy.tsx`
**Action:**
Pure function debt payoff calculator. Supports avalanche (highest rate first) and snowball (lowest balance first). Projects month-by-month payoff given current balances, rates, minimums, and optional extra payment. UI component shows strategy comparison.

**Micro-steps:**
- Write failing test: avalanche strategy orders debts by highest interest rate first
- Write failing test: snowball strategy orders debts by lowest balance first
- Write failing test: calculate months-to-payoff given extra monthly payment
- Implement debt calculator: avalanche and snowball ordering, month-by-month projection
- Run tests to verify GREEN
- Build payoff strategy component: toggle avalanche/snowball, show ordered list with projected payoff timeline
- Integrate into debts page

**TDD:**
- required: `true`
- failingVerify:
  - `npx vitest run src/lib/debt-calculator.test.ts`
- passingVerify:
  - `npx vitest run src/lib/debt-calculator.test.ts`

**Verify:**
```bash
npx vitest run src/lib/debt-calculator.test.ts
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

### Task 3: Savings goals with progress tracking
**Files:** `src/app/(app)/savings/page.tsx`, `src/app/(app)/savings/new/page.tsx`, `src/lib/actions/savings.ts`, `src/components/savings/goal-form.tsx`, `src/components/savings/goal-card.tsx`
**Action:**
Build savings goals. Each goal has name, target amount, current amount, deadline, optional linked account. Goal card shows progress bar, percentage complete, days remaining, and monthly amount needed to reach target. Contributions increase current amount.

**Micro-steps:**
- Write Server Actions: createGoal, updateGoal, deleteGoal, getGoals, addContribution
- Build goal form: name, target amount, deadline, linked account (optional)
- Build goal card: name, progress bar (current/target), percentage, days remaining, monthly needed
- Build savings page listing all goals
- Implement addContribution: increases current_amount, optionally creates transaction
- Calculate 'monthly amount needed' to hit target by deadline
- Verify goal progress updates on contribution

**TDD:**
- required: `false`
- reason: CRUD + simple math — verified by build + manual test

**Verify:**
```bash
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

## Verification

After all tasks:
```bash
npx vitest run
npx tsc --noEmit
npm run build
```

## Commit Message
```
feat(finance): add debt tracking with payoff strategies and savings goals
```
