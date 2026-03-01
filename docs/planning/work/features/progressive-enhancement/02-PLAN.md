# Plan 02: Add cacheTag/cacheLife to read actions, replace revalidatePath with revalidateTag, add Supabase Realtime for cache invalidation

## Goal
Add cacheTag/cacheLife to read actions, replace revalidatePath with revalidateTag, add Supabase Realtime for cache invalidation

## Tasks

### Task 1: Add cacheTag to read actions
**Files:** `src/lib/actions/dashboard.ts`, `src/lib/actions/budgets.ts`, `src/lib/actions/categories.ts`, `src/lib/actions/accounts.ts`, `src/lib/actions/reports.ts`, `src/lib/actions/recurring.ts`
**Action:**
Add Next.js caching to all read-only server actions. Use cacheTag() with household-scoped tags (e.g., 'dashboard-{householdId}') so invalidation is precise. Use cacheLife() to set TTLs. The exact API depends on Next.js 16 — check if 'use cache' directive is stable or if unstable_cache wrapper is needed.

**Micro-steps:**
- Import cacheTag and cacheLife from 'next/cache' in each read action file
- Wrap read functions (getDashboardData, getBudgets, getCategories, getAccounts, getReports, getRecurringItems) with 'use cache' directive or unstable_cache
- Define tag naming convention: 'dashboard-{householdId}', 'budgets-{householdId}', etc.
- Set appropriate cacheLife (e.g., 5 minutes for dashboard, 15 minutes for categories)

**TDD:**
- required: `false`
- reason: Caching layer is transparent to callers — same return types. Verified via type check + manual testing.

**Verify:**
```bash
npx tsc --noEmit 2>&1 | grep -v 'household.ts' | head -20
```

**Done when:** [Observable outcome]

### Task 2: Replace revalidatePath with revalidateTag in mutations
**Files:** `src/lib/actions/budgets.ts`, `src/lib/actions/categories.ts`, `src/lib/actions/transactions.ts`, `src/lib/actions/recurring.ts`, `src/lib/actions/debts.ts`, `src/lib/actions/savings.ts`, `src/lib/actions/rules.ts`, `src/lib/actions/import.ts`
**Action:**
Replace all 15 revalidatePath() calls with revalidateTag() using the tag naming convention from Task 1. Mutations that affect dashboard data should also invalidate the dashboard tag. Import revalidateTag from 'next/cache'.

**Micro-steps:**
- In each mutation function, replace revalidatePath('/path') with revalidateTag('tag-{householdId}')
- Budget mutations: revalidateTag('budgets-{householdId}') + revalidateTag('dashboard-{householdId}')
- Transaction mutations: revalidateTag('transactions-{householdId}') + revalidateTag('dashboard-{householdId}')
- Category mutations: revalidateTag('categories-{householdId}')
- Import: revalidateTag('transactions-{householdId}')
- Cross-invalidate dashboard tag when transactions/budgets change

**TDD:**
- required: `false`
- reason: Invalidation strategy change — same UX behavior. Verified via build + manual testing.

**Verify:**
```bash
npx tsc --noEmit 2>&1 | grep -v 'household.ts' | head -20
```

**Done when:** [Observable outcome]

### Task 3: Add Supabase Realtime listener for cross-member cache invalidation
**Files:** `src/components/realtime/realtime-listener.tsx`, `src/app/(app)/layout.tsx`
**Action:**
Create a thin 'use client' component that subscribes to Supabase Realtime postgres_changes for the household's transactions, budgets, and recurring_items tables. On any INSERT/UPDATE/DELETE, call a revalidation server action. Mount in app layout.

**Micro-steps:**
- Create src/components/realtime/realtime-listener.tsx as a 'use client' component
- Subscribe to Supabase Realtime channel for household-scoped changes on transactions, budgets, bills tables
- On change event, call a server action that runs revalidateTag() for the affected tags
- Add RealtimeListener to the app layout, passing householdId as prop
- Handle cleanup (unsubscribe) in useEffect return

**TDD:**
- required: `false`
- reason: Realtime subscription requires live Supabase connection — integration test. Verified via build + manual testing.

**Verify:**
```bash
npx tsc --noEmit 2>&1 | grep -v 'household.ts' | head -20
npm run build 2>&1 | tail -20
```

**Done when:** [Observable outcome]

## Verification

After all tasks:
```bash
npx tsc --noEmit 2>&1 | grep -v 'household.ts' | head -20
npm run build 2>&1 | tail -20
```

## Commit Message
```
feat(cache): add cacheTag to read actions, revalidateTag to mutations, Realtime invalidation
```
