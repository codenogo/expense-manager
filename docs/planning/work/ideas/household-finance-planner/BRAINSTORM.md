# Brainstorm: Household Finance Planner

**Date**: 2026-02-28
**Slug**: household-finance-planner

## Context

Build an end-to-end household finance planner for a single household with:
- Common pool of income from multiple earners
- Expense management with categorization and splits
- Shared budgeting, bills tracking, debt tracking, savings goals
- Manual entry + CSV import (no bank API for MVP)
- Supabase (Postgres + Auth + RLS) as backend
- Next.js 16 + React 19 + Tailwind 4 (already in place)

## Constraints

| Constraint | Detail |
|------------|--------|
| Single household | No multi-tenant, no billing, no onboarding flows |
| No bank sync MVP | Manual entry + CSV/OFX import only |
| Supabase | Postgres + Auth + RLS + Realtime |
| Existing stack | Next.js 16, React 19, Tailwind 4 |
| Security | Encrypt sensitive fields, RLS on all tables, no secrets in client |

## Candidate Directions

### Option A: "Monolith Dashboard" — Full Feature, Single App

**Summary**: Build all features (budget, expenses, bills, debt, savings) as pages
within the existing Next.js app. Supabase handles auth, database, and RLS.
Server Components for data fetching, Server Actions for mutations.

**Architecture**:
```
Next.js App Router
├── /dashboard          → monthly overview + net position
├── /transactions       → log, import CSV, categorize, split
├── /budget             → category budgets vs actuals
├── /bills              → recurring items + due dates
├── /debt               → debt accounts + payoff tracker
├── /savings            → savings goals + progress
└── /settings           → household members, categories, import config

Supabase
├── Auth (email/password, household invite links)
├── Postgres (all tables, RLS policies per household)
└── Realtime (optional: live updates when partner adds transaction)
```

**Data model (core tables)**:
- `households`, `profiles` (linked to Supabase auth.users)
- `accounts` (checking, savings, credit, loan — with type + balance)
- `transactions` (amount, date, category, account, notes, is_split)
- `transaction_splits` (transaction_id, member_id, amount)
- `categories` (hierarchical: group → category)
- `budgets` (category_id, month, amount)
- `recurring_items` (name, amount, frequency, next_due, category, account)
- `debt_accounts` (name, balance, rate, min_payment, strategy)
- `savings_goals` (name, target, current, deadline)

**Pros**:
- Simplest to build and deploy (single Vercel project)
- All features share components, types, and DB connection
- Easy to iterate — change anything without cross-service coordination
- Supabase RLS provides household isolation without custom middleware

**Cons**:
- Could become a large app over time (mitigated by feature-based folders)
- No offline capability

**Risks**:
- Scope creep — many features to build. Mitigate with phased delivery.
- CSV import complexity varies by bank. Mitigate with configurable mapper.

**MVP slice**: Dashboard + transactions + budget + one import format.

---

### Option B: "Local-First Hybrid" — SQLite + Supabase Sync

**Summary**: Use SQLite (via sql.js or wa-sqlite in browser) for instant local
reads/writes, sync to Supabase Postgres for backup and cross-device access.
Inspired by Actual Budget's architecture.

**Architecture**:
```
Browser (SQLite via wa-sqlite / OPFS)
  ↕ sync layer (CRDT or last-write-wins)
Supabase Postgres (source of truth for sync + backup)
```

**Pros**:
- Instant UI — no loading spinners, works offline
- Works if Supabase is down
- Great perceived performance for data-heavy dashboards

**Cons**:
- Significant sync complexity (conflict resolution for shared household)
- Two databases to maintain schemas for
- Harder to debug data issues
- Overkill for a single-household private tool

**Risks**:
- Sync bugs with concurrent edits from two household members
- Browser storage limits and OPFS compatibility

**MVP slice**: Same features as Option A, but with sync layer.

---

### Option C: "API-First with Mobile Future" — Separate API + Frontend

**Summary**: Build a standalone REST/tRPC API layer on top of Supabase, with
the Next.js app as one client. Designed for future mobile app consumption.

**Architecture**:
```
Next.js Frontend ──→ tRPC/REST API layer ──→ Supabase Postgres
Future Mobile App ─┘
```

**Pros**:
- Clean separation enables future React Native app
- API layer can enforce business logic centrally
- Easier to test API independently

**Cons**:
- More boilerplate upfront (API routes, client SDK, types)
- Over-engineered for a single-household web app
- Supabase already provides a REST API (PostgREST) — duplicates effort

**Risks**:
- YAGNI — mobile app may never materialize
- Slower iteration speed due to extra abstraction layer

**MVP slice**: Same features, but takes longer to reach them.

---

## Recommendation

### Primary: Option A — "Monolith Dashboard"

**Why**: For a single-household private tool, simplicity wins. Next.js Server
Components + Supabase gives you auth, RLS, realtime, and Postgres in one stack
with zero infrastructure management. Every feature is a page. No sync layer,
no API abstraction, no over-engineering. You ship faster and iterate faster.

The architecture naturally supports adding Plaid or a mobile client later
without a rewrite — Server Actions can be extracted to API routes when needed.

### Backup: Option B — "Local-First Hybrid"

Only if offline access becomes a hard requirement (e.g., you want to log
expenses on a plane). Not recommended for MVP.

## Proposed MVP Phases

### Phase 1: Foundation (auth + household + accounts + transactions)
- Supabase project setup + auth (email/password)
- Household creation + member invite
- Account CRUD (checking, savings, credit card, loan)
- Transaction CRUD with categories
- CSV import with configurable column mapping

### Phase 2: Budgeting + Bills
- Monthly budget by category with progress bars
- Recurring bills/subscriptions tracker with due date reminders
- Transaction auto-categorization rules (payee name matching)

### Phase 3: Debt + Savings
- Debt accounts with balance, rate, minimum payment
- Debt payoff strategies (avalanche vs snowball) with projections
- Savings goals with target amount, deadline, and progress

### Phase 4: Dashboard + Reporting
- Monthly overview: income, expenses, net position
- Spending trends (last 3-6 months)
- Category breakdown charts
- Household contribution summary (who earned/spent what)

## Next Step

```
/discuss "Option A: Monolith Dashboard"
```
