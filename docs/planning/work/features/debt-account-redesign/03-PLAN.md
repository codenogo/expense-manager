# Plan 03: Refactor debt payment recording to use debt_payments table with mandatory account and full transaction tracking

## Goal
Refactor debt payment recording to use debt_payments table with mandatory account and full transaction tracking

## Tasks

### Task 1: Refactor recordPayment to use debt_payments table
**Files:** `src/lib/actions/debts.ts`, `src/lib/actions/loan-account.ts`
**Action:**
Refactor recordPayment in src/lib/actions/debts.ts:

1. Make account_id required (remove the 'else' branch that only updates debt balance):
   ```
   const accountId = formData.get('account_id') as string
   if (!accountId) throw new Error('Account is required for debt payments')
   ```

2. Restructure the flow (sequential for atomicity):
   a. Fetch debt balance (existing)
   b. Calculate newBalance = debt.balance - amountCents
   c. Create expense transaction:
      ```
      const { data: tx } = await supabase.from('transactions').insert({ ... }).select('id').single()
      ```
   d. Create debt_payments record:
      ```
      await supabase.from('debt_payments').insert({
        household_id: householdId,
        debt_id: id,
        account_id: accountId,
        transaction_id: tx.id,
        amount: amountCents,
        date: today,
        notes: formData.get('notes') as string || 'Debt payment',
      })
      ```
   e. Update debt balance
   f. Update account balance (fetch current, subtract)
   g. Call syncLoanAccountBalance(householdId)
   h. Invalidate caches: updateTag for dashboard, accounts

3. Keep all error handling (throw on failures, no silent swallowing)

**Micro-steps:**
- Make account_id mandatory in recordPayment (remove the optional branch)
- After fetching debt balance, create debt_payments record
- Create expense transaction on the source account
- Update debt_payments record with transaction_id
- Update debt balance (subtract payment)
- Update account balance (subtract payment)
- Call syncLoanAccountBalance to keep loan account in sync
- Invalidate caches (dashboard, accounts, debts)

**TDD:**
- required: `false`
- reason: Server action with Supabase dependency — verified by build and type check

**Verify:**
```bash
npx tsc --noEmit
```

**Done when:** [Observable outcome]

### Task 2: Create getDebtPayments action for payment history
**Files:** `src/lib/actions/debts.ts`
**Action:**
Add to src/lib/actions/debts.ts:

```typescript
export async function getDebtPayments(debtId: string): Promise<Tables<'debt_payments'>[]> {
  const supabase = await createClient()
  const householdId = await getHouseholdId()

  const { data, error } = await supabase
    .from('debt_payments')
    .select('*')
    .eq('debt_id', debtId)
    .eq('household_id', householdId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data ?? []
}
```

**Micro-steps:**
- Add getDebtPayments function that fetches all payments for a debt_id
- Order by date descending (most recent first)
- Return typed array of debt_payments rows

**TDD:**
- required: `false`
- reason: Simple query action — verified by type check

**Verify:**
```bash
npx tsc --noEmit
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
feat(debts): refactor payment recording with debt_payments table and mandatory account
```
