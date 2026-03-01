# Plan 01: Extract shared getAuthContext() with React.cache() and replace all 11 duplicate getHouseholdId() implementations

## Goal
Extract shared getAuthContext() with React.cache() and replace all 11 duplicate getHouseholdId() implementations

## Tasks

### Task 1: Create shared auth context module
**Files:** `src/lib/auth.ts`
**Action:**
Create new file src/lib/auth.ts. Define getAuthContext() wrapped in React.cache() that creates a Supabase client, calls auth.getUser(), fetches profile.household_id, and returns { user, householdId, supabase }. Export a getHouseholdId() convenience function. Redirect to /sign-in if no user, /onboarding if no household_id.

**Micro-steps:**
- Create src/lib/auth.ts with getAuthContext() using React.cache()
- Function returns { user, householdId, supabase } tuple
- Export getHouseholdId() convenience wrapper that calls getAuthContext()
- Handle redirect('/sign-in') and redirect('/onboarding') in shared function

**TDD:**
- required: `false`
- reason: Auth module depends on Supabase server client and Next.js cookies() — requires integration test setup not yet in place. Verified via type check + build.

**Verify:**
```bash
npx tsc --noEmit 2>&1 | head -20
```

**Done when:** [Observable outcome]

### Task 2: Replace duplicate getHouseholdId() in all 11 action files
**Files:** `src/lib/actions/accounts.ts`, `src/lib/actions/budgets.ts`, `src/lib/actions/categories.ts`, `src/lib/actions/dashboard.ts`, `src/lib/actions/debts.ts`, `src/lib/actions/import.ts`, `src/lib/actions/recurring.ts`, `src/lib/actions/reports.ts`, `src/lib/actions/rules.ts`, `src/lib/actions/savings.ts`, `src/lib/actions/transactions.ts`
**Action:**
For each of the 11 action files: delete the local getHouseholdId() function, import from '@/lib/auth' instead. In files that need user.id (debts, savings, transactions, import), use getAuthContext() to get both user and householdId. Clean up now-unused imports of createClient and redirect where they were only used by the local getHouseholdId.

**Micro-steps:**
- In each of the 11 action files: remove local getHouseholdId() definition
- Add import { getHouseholdId } from '@/lib/auth'
- Remove unused imports (redirect, createClient) where getHouseholdId was the only consumer
- For functions that also need user.id (debts.recordPayment, savings.addContribution, transactions), import getAuthContext instead
- Verify each file compiles

**TDD:**
- required: `false`
- reason: Pure refactor — same behavior, same return values. Verified via type check + build.

**Verify:**
```bash
npx tsc --noEmit 2>&1 | grep -v 'household.ts' | head -20
```

**Done when:** [Observable outcome]

### Task 3: Update app layout to use shared auth context
**Files:** `src/app/(app)/layout.tsx`
**Action:**
In src/app/(app)/layout.tsx, replace the manual auth check (createClient + getUser + redirect) with a call to getAuthContext() from '@/lib/auth'. The layout still needs getHousehold() for household name/members, but the auth check is now deduplicated via React.cache().

**Micro-steps:**
- Import getAuthContext from '@/lib/auth'
- Replace direct supabase.auth.getUser() + profile query with getAuthContext()
- Remove duplicate createClient() call since getAuthContext() handles it
- Keep getHousehold() call for household metadata (name, members)

**TDD:**
- required: `false`
- reason: Layout refactor — same auth flow, deduplicated. Verified via type check + build.

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
feat(auth): extract shared getAuthContext() with React.cache(), replace 11 duplicate getHouseholdId()
```
