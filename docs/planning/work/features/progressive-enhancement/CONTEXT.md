# Context: Progressive Enhancement

**Feature**: progressive-enhancement
**Date**: 2026-03-01
**Branch**: `feature/progressive-enhancement`
**Origin**: Brainstorm Option C — `docs/planning/work/ideas/platform-upgrade/BRAINSTORM.md`

## Summary

Upgrade limohome from a working but unoptimized household finance app to a performant,
feature-complete platform. Use Supabase built-ins (pg_trgm, pg_cron, Edge Functions,
Realtime) instead of adding Docker/Redis/workers. Stay on Vercel + Supabase.

## Key Decisions

### Caching (Phase 1)
- **Shared auth**: Extract `getAuthContext()` with `React.cache()` — one auth call per
  request instead of 11 duplicated `getHouseholdId()` implementations
- **Read caching**: Wrap read actions with `cacheTag()`/`cacheLife()` for cross-request caching
- **Invalidation**: Replace all `revalidatePath()` with `revalidateTag()` for surgical cache busting
- **Realtime**: Supabase Realtime subscription in layout for cross-member invalidation

### Charts & Reports (Phase 2)
- **Library**: Recharts (user preference)
- **Replace**: All 4 hand-rolled CSS chart components (spending-trends, income-vs-expenses,
  category-breakdown, summary-cards charts)
- **New pages**: Monthly trends (LineChart), income vs expenses (BarChart),
  category breakdown (PieChart)
- **Pattern**: Server components fetch data → thin `'use client'` wrappers render Recharts

### Search (Phase 3)
- **Engine**: `pg_trgm` extension (Supabase built-in)
- **Index**: GIN index on `transactions.notes`
- **UI**: Inline search bar on transactions page
- **API**: Server action using `similarity()` or `ILIKE` with trigram index

### Notifications (Phase 4)
- **Storage**: `notifications` table (id, household_id, user_id, type, title, body, read, created_at)
- **Trigger**: pg_cron nightly job → Supabase Edge Function
- **Checks**: Overdue bills, budget overspend, low account balance
- **Delivery**: Email via Resend + in-app notification
- **UI**: Notification bell in sidebar with unread count, Realtime updates

### Forecasting (Phase 5)
- **Approach**: Pure server-side computation (no background worker)
- **Projected balance**: Sum scheduled income − scheduled expenses over N months
- **Budget runway**: Remaining budget ÷ daily spend rate
- **Bill calendar**: Query recurring items, project next 30/60/90 days

## Constraints

- Performance first — caching is Phase 1
- No new infrastructure beyond Supabase
- Stack: Next.js 16, React 19, Supabase, Tailwind 4, Recharts
- Supabase free-tier Edge Function limits → batch notifications nightly
- Must not break existing features during migration

## Open Questions

1. Which Supabase tables should trigger Realtime subscriptions? (start with transactions, budgets, bills)
2. Should search extend beyond `transactions.notes` to include category names and account names?
3. Email notification opt-in/opt-out — per-user setting or household-level?
4. Forecasting time horizon — default 3 months or configurable?

## Related Code

| Area | Files |
|------|-------|
| Server actions (11 files with dup auth) | `src/lib/actions/*.ts` |
| Supabase client | `src/lib/supabase/server.ts` |
| App layout (double auth fetch) | `src/app/(app)/layout.tsx` |
| Dashboard page | `src/app/(app)/dashboard/page.tsx` |
| Hand-rolled charts (4) | `src/components/dashboard/spending-trends.tsx`, `income-vs-expenses.tsx`, `category-breakdown.tsx`, `summary-cards.tsx` |
| Next.js config | `next.config.ts` |

## Next Step

```
/plan progressive-enhancement
```
