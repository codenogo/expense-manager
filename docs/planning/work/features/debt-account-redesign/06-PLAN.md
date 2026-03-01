# Plan 06: Update account list and detail pages to handle system-managed loan accounts appropriately

## Goal
Update account list and detail pages to handle system-managed loan accounts appropriately

## Tasks

### Task 1: Mark system-managed loan account in account list page
**Files:** `src/app/(app)/accounts/page.tsx`, `src/components/accounts/account-card.tsx`
**Action:**
1. Update src/components/accounts/account-card.tsx:
   - Add conditional rendering: if account.is_system_managed, show a small badge/tag 'Auto-managed' next to the type badge
   - The card should still be clickable (links to detail page) but with a subtle visual distinction (e.g., dashed border or muted styling)

2. Update src/app/(app)/accounts/page.tsx:
   - In the Loan section header, add a subtitle: 'Automatically tracks total debt balance'
   - No other changes needed — the existing grouping and ordering already places loans at the bottom

**Micro-steps:**
- In accounts page: add visual indicator for system-managed accounts in the loan section header
- In AccountCard: show 'System Managed' badge when account.is_system_managed is true
- In AccountCard: optionally make the card non-clickable or show a lock icon for system-managed accounts
- Ensure the 'Add Account' button does not offer loan as a type (handled in Plan 02 account-form changes)

**TDD:**
- required: `false`
- reason: UI styling changes — verified by build

**Verify:**
```bash
npx tsc --noEmit
```

**Done when:** [Observable outcome]

### Task 2: Make loan account detail page read-only
**Files:** `src/app/(app)/accounts/[id]/page.tsx`
**Action:**
Update src/app/(app)/accounts/[id]/page.tsx:

1. After fetching the account, check `account.is_system_managed`

2. If system-managed, render alternative layout:
   ```
   <div className="max-w-lg">
     <div className="bg-card rounded-xl shadow-sm p-6">
       <div className="flex items-center gap-2 mb-4">
         <h2 className="text-lg font-semibold">Total Loans</h2>
         <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Auto-managed</span>
       </div>
       <p className="text-sm text-muted-foreground mb-4">
         This account automatically tracks the total balance of all your debts.
         It updates when you add, remove, or make payments on debts.
       </p>
       <div className="space-y-3">
         <div>
           <p className="text-sm text-muted-foreground">Current Balance</p>
           <p className="text-2xl font-semibold"><Currency amount={account.balance} /></p>
         </div>
         <div>
           <p className="text-sm text-muted-foreground">Type</p>
           <p className="text-sm font-medium">Loan</p>
         </div>
       </div>
       <Link href="/debts" className="... mt-4 inline-block">
         View Debts →
       </Link>
     </div>
   </div>
   ```
   - NO delete button
   - NO edit form

3. If not system-managed, keep existing behavior (AccountForm + DeleteAccountButton)

**Micro-steps:**
- Check if account.is_system_managed in the page
- If system-managed: show read-only view instead of AccountForm (display name, type, balance as static text)
- If system-managed: hide the delete button / danger zone section
- Add info message explaining the loan account is automatically managed based on debts
- If not system-managed: keep existing behavior (edit form + delete)

**TDD:**
- required: `false`
- reason: UI conditional rendering — verified by build

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
feat(accounts): show system-managed loan account with read-only view and auto-managed badge
```
