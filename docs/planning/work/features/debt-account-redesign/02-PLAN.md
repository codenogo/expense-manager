# Plan 02: Auto-create and sync a system-managed loan account when debts are created, updated, or deleted

## Goal
Auto-create and sync a system-managed loan account when debts are created, updated, or deleted

## Tasks

### Task 1: Create loan account helper functions
**Files:** `src/lib/actions/loan-account.ts`
**Action:**
Create src/lib/actions/loan-account.ts with 'use server' directive:

1. ensureLoanAccount(householdId: string): Promise<string>
   - Query accounts where household_id = householdId AND is_system_managed = true AND type = 'loan'
   - If found, return the account id
   - If not found, insert new account: { household_id, name: 'Total Loans', type: 'loan', balance: 0, is_system_managed: true }
   - Return the new account id

2. syncLoanAccountBalance(householdId: string): Promise<void>
   - Query sum of all debt balances for the household: SELECT COALESCE(SUM(balance), 0) FROM debts WHERE household_id = ?
   - Get or create loan account via ensureLoanAccount
   - Update loan account balance to the sum
   - Call updateTag for accounts and dashboard cache invalidation

3. getLoanAccount(householdId: string): Promise<Tables<'accounts'> | null>
   - Query accounts where household_id AND is_system_managed = true AND type = 'loan'
   - Return data or null

Use createClient() from @/lib/supabase/server. Follow patterns from existing action files.

**Micro-steps:**
- Create new server action file src/lib/actions/loan-account.ts
- Implement ensureLoanAccount(householdId): finds or creates system-managed loan account, returns account id
- Implement syncLoanAccountBalance(householdId): queries sum of all debt balances, updates loan account balance to match
- Implement getLoanAccount(householdId): returns the system-managed loan account or null

**TDD:**
- required: `false`
- reason: Server actions with Supabase dependency — no unit test infrastructure for DB-dependent actions in this project

**Verify:**
```bash
npx tsc --noEmit
```

**Done when:** [Observable outcome]

### Task 2: Wire debt CRUD actions to auto-manage loan account
**Files:** `src/lib/actions/debts.ts`
**Action:**
Update src/lib/actions/debts.ts:

1. Import { syncLoanAccountBalance } from '@/lib/actions/loan-account'

2. In createDebt(): after the successful insert (before redirect), call:
   await syncLoanAccountBalance(householdId)

3. In updateDebt(): after the successful update (before redirect), call:
   await syncLoanAccountBalance(householdId)

4. In deleteDebt(): after the successful delete (before redirect), call:
   await syncLoanAccountBalance(householdId)

Keep existing error handling and redirect behavior intact.

**Micro-steps:**
- Import syncLoanAccountBalance from loan-account.ts
- In createDebt: after successful insert, call syncLoanAccountBalance(householdId)
- In updateDebt: after successful update, call syncLoanAccountBalance(householdId)
- In deleteDebt: after successful delete, call syncLoanAccountBalance(householdId)
- Verify all redirect paths still work correctly

**TDD:**
- required: `false`
- reason: Server action integration — verified by build and type check

**Verify:**
```bash
npx tsc --noEmit
```

**Done when:** [Observable outcome]

### Task 3: Protect system-managed loan accounts from user mutation
**Files:** `src/lib/actions/accounts.ts`, `src/components/accounts/account-form.tsx`
**Action:**
1. Update src/lib/actions/accounts.ts:

   In updateAccount(): before the update query, fetch the account and check is_system_managed:
   ```
   const { data: existing } = await supabase.from('accounts').select('is_system_managed').eq('id', id).eq('household_id', householdId).single()
   if (existing?.is_system_managed) {
     redirect('/accounts?error=Cannot+edit+system-managed+account')
   }
   ```

   In deleteAccount(): same guard:
   ```
   const { data: existing } = await supabase.from('accounts').select('is_system_managed').eq('id', id).eq('household_id', householdId).single()
   if (existing?.is_system_managed) {
     redirect('/accounts?error=Cannot+delete+system-managed+account')
   }
   ```

   In createAccount(): add guard to prevent creating loan type:
   ```
   if (type === 'loan') {
     redirect('/accounts?error=Loan+accounts+are+automatically+managed')
   }
   ```

2. Update src/components/accounts/account-form.tsx:
   - Filter 'loan' out of ACCOUNT_TYPE_LABELS when rendering type options (only in create mode)
   - If account?.is_system_managed is true, show all fields as disabled/read-only with an info message

**Micro-steps:**
- In updateAccount: add guard — if account is_system_managed, redirect with error
- In deleteAccount: add guard — if account is_system_managed, redirect with error
- In AccountForm: filter out 'loan' from type options when creating new account
- In AccountForm: if editing a system-managed account, make fields read-only

**TDD:**
- required: `false`
- reason: Server action guard + UI restriction — verified by build

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
feat(debts): auto-manage loan account on debt CRUD and protect from user mutation
```
