# Plan 01: Set up Supabase infrastructure, auth flow, database schema with RLS, and household onboarding

## Goal
Set up Supabase infrastructure, auth flow, database schema with RLS, and household onboarding

## Tasks

### Task 1: Supabase client setup and environment config
**Files:** `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`, `src/middleware.ts`, `.env.local.example`, `src/types/database.ts`
**Action:**
Install Supabase SDK, create client helpers for browser/server/middleware, set up Next.js middleware for auth session refresh, define database types, create env example file.

**Micro-steps:**
- Install @supabase/supabase-js and @supabase/ssr
- Create browser client helper (src/lib/supabase/client.ts)
- Create server client helper (src/lib/supabase/server.ts)
- Create middleware client helper and Next.js middleware for session refresh
- Create .env.local.example with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Define TypeScript types for database schema (src/types/database.ts)
- Verify build passes with new dependencies

**TDD:**
- required: `false`
- reason: Infrastructure wiring — verified by build compilation and runtime smoke test

**Verify:**
```bash
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

### Task 2: Database schema migrations with RLS policies
**Files:** `supabase/migrations/00001_initial_schema.sql`
**Action:**
Write the full initial SQL migration covering all 9 core tables, foreign keys, indexes, RLS policies (household-scoped), and auto-profile trigger. All amounts stored as integer (cents/smallest unit) to avoid floating point.

**Micro-steps:**
- Create supabase/migrations directory
- Write CREATE TABLE for: households, profiles, accounts, categories, transactions, budgets, recurring_items, debts, savings_goals
- Add foreign key constraints and indexes
- Write RLS policies: enable RLS on all tables, policy per table restricting access to household members
- Add trigger: auto-create profile row on auth.users insert
- Add trigger: update updated_at timestamp columns
- Test migration runs cleanly against local Supabase (supabase db reset)

**TDD:**
- required: `false`
- reason: SQL migration — verified by supabase db reset succeeding without errors

**Verify:**
```bash
npx supabase db reset
```

**Done when:** [Observable outcome]

### Task 3: Auth pages and household onboarding flow
**Files:** `src/app/(auth)/sign-in/page.tsx`, `src/app/(auth)/sign-up/page.tsx`, `src/app/(auth)/layout.tsx`, `src/app/(app)/layout.tsx`, `src/app/(app)/onboarding/page.tsx`, `src/app/(app)/dashboard/page.tsx`, `src/lib/actions/auth.ts`, `src/lib/actions/household.ts`, `src/components/auth/sign-in-form.tsx`, `src/components/auth/sign-up-form.tsx`
**Action:**
Build auth route group (sign-in, sign-up), app route group (protected), onboarding page for household creation, and Server Actions for auth and household management. Redirect unauthenticated users to sign-in, redirect users without a household to onboarding.

**Micro-steps:**
- Create (auth) route group with centered layout for sign-in/sign-up
- Build sign-up form: email + password + name, Server Action calls supabase.auth.signUp
- Build sign-in form: email + password, Server Action calls supabase.auth.signInWithPassword
- Create (app) route group with authenticated layout (redirect to sign-in if no session)
- Build onboarding page: create household name, shown if user has no household
- Create household Server Action: insert household + profile row
- Add placeholder dashboard page that shows household name and member list
- Verify full flow: sign up → onboarding → dashboard

**TDD:**
- required: `false`
- reason: UI pages — verified by manual flow test (sign up → onboard → dashboard)

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
feat(auth): add Supabase setup, database schema, auth pages, and household onboarding
```
