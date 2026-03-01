# Plan 04: Add transaction search with pg_trgm extension, GIN index, server action, and search UI

## Goal
Add transaction search with pg_trgm extension, GIN index, server action, and search UI

## Tasks

### Task 1: Create pg_trgm migration with GIN index
**Files:** `supabase/migrations/00006_add_pg_trgm_search.sql`
**Action:**
Create a Supabase migration that enables the pg_trgm extension and adds a GIN index on transactions.notes for fast fuzzy text search. Use CREATE EXTENSION IF NOT EXISTS and CREATE INDEX IF NOT EXISTS for idempotency.

**Micro-steps:**
- Create migration file that enables pg_trgm extension
- Add GIN index on transactions.notes using gin_trgm_ops
- Add GIN index on transactions.description if column exists
- Test migration applies cleanly

**TDD:**
- required: `false`
- reason: SQL migration — verified via supabase db push or manual apply.

**Verify:**
```bash
cat supabase/migrations/00006_add_pg_trgm_search.sql
```

**Done when:** [Observable outcome]

### Task 2: Add searchTransactions server action
**Files:** `src/lib/actions/transactions.ts`
**Action:**
Add a new exported async function searchTransactions(query: string) to transactions.ts. Uses getHouseholdId() from shared auth, queries transactions with .ilike('notes', `%${query}%`) scoped to household, returns up to 50 results ordered by date descending.

**Micro-steps:**
- Add searchTransactions(query: string) function to transactions.ts
- Use Supabase .ilike() or .textSearch() with pg_trgm for fuzzy matching on notes
- Scope by household_id via getHouseholdId()
- Return results ordered by similarity score then date
- Limit to 50 results

**TDD:**
- required: `false`
- reason: Requires live Supabase with pg_trgm extension — integration test. Verified via type check.

**Verify:**
```bash
npx tsc --noEmit 2>&1 | grep -v 'household.ts' | head -20
```

**Done when:** [Observable outcome]

### Task 3: Add search UI to transactions page
**Files:** `src/components/transactions/transaction-search.tsx`, `src/app/(app)/transactions/page.tsx`
**Action:**
Create a search bar component for the transactions page. 'use client' component with debounced input that calls searchTransactions(). Displays results inline. Add to transactions/page.tsx above the existing transaction list.

**Micro-steps:**
- Create transaction-search.tsx as 'use client' component with search input
- Debounce input (300ms), call searchTransactions server action on change
- Display search results inline, replacing the main transaction list when query is active
- Add clear button to reset search
- Integrate search component into transactions/page.tsx above the transaction list

**TDD:**
- required: `false`
- reason: UI component — verified via build + manual testing.

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
feat(search): add pg_trgm transaction search with GIN index and search UI
```
