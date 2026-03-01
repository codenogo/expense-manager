# Plan 05: Build amortization table and payment history components for the debt detail page

## Goal
Build amortization table and payment history components for the debt detail page

## Tasks

### Task 1: Create AmortizationTable component
**Files:** `src/components/debts/amortization-table.tsx`
**Action:**
Create src/components/debts/amortization-table.tsx as a client component:

Props:
```typescript
interface AmortizationTableProps {
  balance: number        // cents
  interestRate: number | null  // annual %
  minPayment: number | null    // cents
}
```

Behavior:
- If no interest_rate or no min_payment, show info message: 'Set interest rate and minimum payment to see amortization schedule'
- Call calculateAmortization(balance, interestRate, minPayment)
- Show summary card: X months to payoff, KES total interest, KES total paid
- Scrollable table (max-h with overflow-y-auto) with columns:
  - Month # (1, 2, 3...)
  - Payment (formatted KES)
  - Principal (formatted KES)
  - Interest (formatted KES)
  - Remaining Balance (formatted KES)
- Use existing design tokens (bg-card, text-foreground, etc.)
- Highlight current month or first unpaid month

**Micro-steps:**
- Create client component that accepts debt data (balance, interest_rate, min_payment)
- Call calculateAmortization to generate the schedule
- Render a scrollable table with columns: Month, Payment, Principal, Interest, Remaining Balance
- Show summary row at top: total months, total interest, total paid
- Format all amounts with Currency component or KES formatting
- Handle edge case: no interest rate — show simple payoff table
- Handle edge case: no min_payment — show message that payment amount is needed

**TDD:**
- required: `false`
- reason: UI component — verified by build

**Verify:**
```bash
npx tsc --noEmit
```

**Done when:** [Observable outcome]

### Task 2: Create PaymentHistory component
**Files:** `src/components/debts/payment-history.tsx`
**Action:**
Create src/components/debts/payment-history.tsx:

Props:
```typescript
interface PaymentHistoryProps {
  payments: Tables<'debt_payments'>[]
}
```

Behavior:
- If payments is empty, show: 'No payments recorded yet'
- Otherwise render a clean list/table:
  - Date (formatted)
  - Amount (KES formatted)
  - Notes (if present)
- Most recent payments first (already ordered by the action)
- Use existing card styling (bg-card rounded-xl shadow-sm p-6)
- Show total paid at the bottom (sum of all payment amounts)

**Micro-steps:**
- Create server component that accepts debt_payments array
- Render a list/table of past payments
- Show date, amount, and notes for each payment
- Show empty state when no payments exist
- Format amounts with Currency component

**TDD:**
- required: `false`
- reason: UI component — verified by build

**Verify:**
```bash
npx tsc --noEmit
```

**Done when:** [Observable outcome]

### Task 3: Update debt detail page with new components and mandatory account
**Files:** `src/app/(app)/debts/[id]/page.tsx`
**Action:**
Update src/app/(app)/debts/[id]/page.tsx:

1. Add imports:
   - AmortizationTable from '@/components/debts/amortization-table'
   - PaymentHistory from '@/components/debts/payment-history'
   - getDebtPayments from '@/lib/actions/debts'

2. Update data fetching:
   ```
   const [debt, accounts, payments] = await Promise.all([
     getDebt(id),
     getAccounts(),
     getDebtPayments(id),
   ])
   ```

3. Page layout (in order):
   - Header (existing)
   - DebtForm (existing edit form)
   - NEW: AmortizationTable section with debt.balance, debt.interest_rate, debt.min_payment
   - Record Payment form — update:
     - Remove `<option value="">None</option>` from account select
     - Add `required` to account select
     - Add notes textarea field
     - Update label to remove '(optional)' from account
   - NEW: PaymentHistory section with payments data
   - Danger zone (existing)

4. Filter accounts in the record payment select to exclude system-managed loan accounts:
   ```
   accounts.filter(a => !a.is_system_managed)
   ```

**Micro-steps:**
- Import AmortizationTable, PaymentHistory, and getDebtPayments
- Fetch debt payments in the page's data loading (add to Promise.all)
- Add AmortizationTable section between the form and record payment sections
- Add PaymentHistory section after the record payment section
- Make account_id required in the record payment form (remove 'None' option, add required attribute)
- Add notes field to the record payment form

**TDD:**
- required: `false`
- reason: Server component page assembly — verified by build

**Verify:**
```bash
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

## Verification

After all tasks:
```bash
npx tsc --noEmit
npm run build
```

## Commit Message
```
feat(debts): add amortization table, payment history, and mandatory account to debt detail page
```
