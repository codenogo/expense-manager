# Plan 02: Build core data management — accounts, categories, and transactions with full CRUD

## Goal
Build core data management — accounts, categories, and transactions with full CRUD

## Tasks

### Task 1: Account management CRUD
**Files:** `src/app/(app)/accounts/page.tsx`, `src/app/(app)/accounts/new/page.tsx`, `src/app/(app)/accounts/[id]/page.tsx`, `src/lib/actions/accounts.ts`, `src/components/accounts/account-form.tsx`, `src/components/accounts/account-card.tsx`, `src/components/ui/currency.tsx`
**Action:**
Build accounts list, create, and detail pages. Server Actions for CRUD. KES currency formatter component. Account types: checking, savings, credit card, loan, cash, M-Pesa.

**Micro-steps:**
- Create KES currency formatter component (displays amounts as KES with commas)
- Create account form component: name, type (checking/savings/credit/loan/cash/mpesa), initial balance
- Write Server Actions: createAccount, updateAccount, deleteAccount, getAccounts
- Build accounts list page showing all accounts grouped by type with balances
- Build new account page with form
- Build account detail page with edit/delete
- Verify accounts CRUD works end to end

**TDD:**
- required: `false`
- reason: CRUD pages — verified by build + manual flow test

**Verify:**
```bash
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

### Task 2: Category management with hierarchy
**Files:** `src/app/(app)/categories/page.tsx`, `src/lib/actions/categories.ts`, `src/components/categories/category-form.tsx`, `src/components/categories/category-tree.tsx`
**Action:**
Build category management page with tree view. Categories are fully user-defined with optional parent for hierarchy. Server Actions for CRUD. Delete should warn if transactions reference the category.

**Micro-steps:**
- Write Server Actions: createCategory, updateCategory, deleteCategory, getCategories (tree structured)
- Build category tree component rendering parent/child hierarchy
- Build inline category form: name, parent (optional), icon/color (optional)
- Build categories page with tree view and add/edit/delete inline
- Verify category hierarchy displays correctly

**TDD:**
- required: `false`
- reason: UI + CRUD — verified by build + manual test

**Verify:**
```bash
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

### Task 3: Transaction CRUD with categorization
**Files:** `src/app/(app)/transactions/page.tsx`, `src/app/(app)/transactions/new/page.tsx`, `src/app/(app)/transactions/[id]/page.tsx`, `src/lib/actions/transactions.ts`, `src/components/transactions/transaction-form.tsx`, `src/components/transactions/transaction-list.tsx`, `src/components/transactions/transaction-filters.tsx`
**Action:**
Build transaction list, create, and detail pages. Transactions have: amount (integer, smallest unit), date, type (income/expense), account, category, notes, created_by. Filter by date range, category, account, and type. Display grouped by date with running totals.

**Micro-steps:**
- Write Server Actions: createTransaction, updateTransaction, deleteTransaction, getTransactions (with filters)
- Build transaction form: amount, date, type (income/expense), account, category, notes
- Build transaction list component with date grouping and running totals
- Build filter bar: date range, category, account, income/expense
- Build transactions list page with filters
- Build new transaction page and detail/edit page
- Verify transaction creation updates account balance display

**TDD:**
- required: `false`
- reason: CRUD pages — verified by build + manual flow

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
feat(core): add accounts, categories, and transactions CRUD
```
