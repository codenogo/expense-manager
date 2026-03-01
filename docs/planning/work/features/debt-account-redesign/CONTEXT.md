# Context: Debt Section & Account Loan Redesign

## Problem

The app has overlapping concepts between account types (loan, credit_card) and debt types (bank_loan, credit_card). There's no payment history, no interest projection, and the loan account type has no clear relationship to debts. The payment flow optionally links to an account, making financial tracking incomplete.

## Key Decisions

### 1. Accounts vs Debts — Clear Separation

**Accounts** = current state snapshot (balance at a glance).
**Debts** = full liability management (original amount, interest rate, payment schedule, payoff progress).

No functional overlap. Each serves a distinct purpose.

### 2. Auto-Managed Loan Account (Event-Driven)

A single "loan" account is auto-created when the first debt is added to a household. Its balance is always the sum of all debt balances. Users cannot manually create, edit, or delete loan accounts.

| Event | Effect on Loan Account |
|-------|----------------------|
| First debt created | Auto-create loan account, set balance |
| Additional debt created | Add to loan account balance |
| Debt payment recorded | Subtract from loan account balance |
| Debt deleted | Subtract from loan account balance |

### 3. Payment History (debt_payments table)

New table for full audit trail:

```
debt_payments:
  - id (uuid, PK)
  - debt_id (FK → debts)
  - household_id (FK → households)
  - amount (bigint, KES cents)
  - account_id (FK → accounts, required)
  - transaction_id (FK → transactions)
  - date (date)
  - notes (text, nullable)
  - created_at (timestamptz)
```

### 4. Interest — Display-Only Projection

The system calculates a full amortization table from interest rate, balance, and min payment. This is **view-only** — no auto-accrual. When a payment is due, the user confirms the projected amount or edits it for partial/extra repayments. The schedule recalculates after each payment.

### 5. Payment Flow — Always Tracked

Every debt payment **must** specify a source account. The system:
1. Creates a `debt_payments` record
2. Creates an expense transaction on the source account
3. Deducts from the source account balance
4. Deducts from the debt balance
5. Updates the loan account balance (sum of all debts)

The current optional `account_id` becomes mandatory.

### 6. Amortization Table UX

Debt detail page shows:
- Full projected amortization schedule (month, payment, principal, interest, remaining balance)
- "Record Payment" button for each upcoming payment
- After recording, the table recalculates the remaining schedule

### 7. Fix Payment Atomicity

Current `recordPayment()` has a race condition (read-then-update on account balance). Will be fixed with Supabase RPC or proper sequential operations.

## Constraints

- Loan account is system-managed only
- Loan account balance = sum of all debt balances (always)
- All payments require a source account
- Amortization is projection-only (no auto-interest)
- debt_payments references both debt_id and transaction_id
- Existing data preserved during migration
- All amounts in KES cents (bigint)

## Open Questions

1. Delete loan account when all debts removed, or keep at zero?
2. Support multiple loan accounts (per-lender grouping) in the future?
3. How to handle amortization for debts with no interest rate (informal loans)?

## Related Code

- `src/lib/actions/debts.ts` — debt CRUD + recordPayment
- `src/lib/actions/accounts.ts` — account CRUD with caching
- `src/lib/debt-calculator.ts` — payoff calculator (avalanche/snowball)
- `src/app/(app)/debts/[id]/page.tsx` — debt detail page
- `supabase/migrations/00001_initial_schema.sql` — schema
