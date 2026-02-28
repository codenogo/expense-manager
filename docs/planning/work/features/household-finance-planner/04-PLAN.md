# Plan 04: Build monthly budgeting with category limits and recurring bills tracker

## Goal
Build monthly budgeting with category limits and recurring bills tracker

## Tasks

### Task 1: Monthly budget management by category
**Files:** `src/app/(app)/budget/page.tsx`, `src/lib/actions/budgets.ts`, `src/components/budget/budget-row.tsx`, `src/components/budget/budget-summary.tsx`, `src/components/ui/progress-bar.tsx`
**Action:**
Build monthly budget page. Each category can have a monthly spending limit. Show spent vs limit with progress bars. Budget summary at top shows totals. Month picker to navigate. Spent amounts computed from transactions.

**Micro-steps:**
- Write Server Actions: setBudget (upsert category+month+amount), getBudgets (with spent totals), deleteBudget
- Build progress bar component (reusable, shows spent/limit with color coding)
- Build budget row: category name, limit input, spent amount, progress bar, remaining
- Build budget summary: total budgeted, total spent, total remaining
- Build budget page: month picker, list of category budgets, add new category budget
- Auto-calculate spent from transactions in that category for the selected month
- Verify budget page shows correct spent vs limit per category

**TDD:**
- required: `false`
- reason: UI-heavy — verified by build + manual test of budget calculations

**Verify:**
```bash
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

### Task 2: Recurring items (bills and subscriptions) tracker
**Files:** `src/app/(app)/bills/page.tsx`, `src/app/(app)/bills/new/page.tsx`, `src/lib/actions/recurring.ts`, `src/components/bills/bill-form.tsx`, `src/components/bills/bill-list.tsx`, `src/components/bills/upcoming-bills.tsx`
**Action:**
Build recurring items tracker. Items have name, amount, frequency, next due date, category, account. Mark as paid creates a transaction and advances the due date. List shows overdue (red), due soon (yellow), upcoming (default). Upcoming bills widget reusable for dashboard.

**Micro-steps:**
- Write Server Actions: createRecurring, updateRecurring, deleteRecurring, getRecurring, markPaid
- Build bill form: name, amount, frequency (weekly/monthly/yearly), next due date, category, account
- Build bill list: grouped by status (overdue, due soon, upcoming), sorted by next due date
- Build upcoming bills component (shows next 7 days, reusable for dashboard)
- Implement markPaid action: creates a transaction and advances next_due_date by frequency
- Build bills page with list and new bill button
- Verify marking a bill paid creates a transaction and updates next due date

**TDD:**
- required: `false`
- reason: CRUD + date logic — verified by build and manual paid-flow test

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
feat(budget): add monthly budgets with progress tracking and recurring bills
```
