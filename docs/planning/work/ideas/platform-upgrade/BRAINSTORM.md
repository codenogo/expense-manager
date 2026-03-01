# Brainstorm: Platform Upgrade — Caching, Performance, Mature Features

**Date**: 2026-03-01
**Slug**: platform-upgrade

## Context

limohome is a working household finance app (Next.js 16 + Supabase). All features exist
(dashboard, transactions, budget, bills, debts, savings, import, categories). Current pain:
zero caching (every page hits Supabase), duplicated auth in every server action, hand-rolled
charts, no search/notifications/forecasting. User priority: **performance first**, then
layer in reports, forecasting, notifications, and search. Self-hosting is on the table.

## Current Architecture Gaps

| Gap | Impact |
|-----|--------|
| No caching layer | Every navigation = full DB round-trip |
| `getHouseholdId()` duplicated 13x | Redundant auth call per action |
| No Supabase Realtime | Stale data when household member edits |
| Hand-rolled CSS charts | No tooltips, no line/area/pie, not interactive |
| No search | Can't find transactions by text |
| No notifications | Overdue bills go unnoticed |
| No forecasting | No projected balances or budget runway |
| 3 test files | Low coverage, risky refactors |

## Candidate Directions

### Option A: "Cache-First Architecture"

**Focus**: Make every existing page feel instant. Layer caching at three levels, then
add features on the fast foundation.

**Architecture**:
```
Request → React cache() (per-request dedup)
        → Next.js cacheTag/cacheLife (cross-request, time-based)
        → Supabase Realtime (cache invalidation on writes)
```

**Key changes**:
1. Shared `getAuthContext()` with `React.cache()` — one auth call per request
2. `unstable_cache` / `cacheTag` on read actions (dashboard, budgets, reports)
3. `revalidateTag()` on mutations instead of `revalidatePath()`
4. Supabase Realtime subscription in layout for cross-tab/member invalidation
5. Recharts for dashboard charts

**Pros**: Minimal infra change, stays on Vercel+Supabase, biggest perf win for least effort
**Cons**: No background jobs (notifications need a separate solution), limited to in-process cache
**Risks**: `unstable_cache` API churn in Next.js. Mitigate: isolate behind a wrapper.
**MVP**: Dashboard < 200ms repeat load, shared auth, Recharts charts.

---

### Option B: "Self-Hosted Platform" (Redis + Background Workers)

**Focus**: Move to Docker deployment with Redis for caching + job queues. Enables
background notifications, scheduled reports, and full-text search.

**Architecture**:
```
Docker Compose
├── Next.js (standalone output)
├── Redis (Upstash or self-hosted)
│   ├── Cache layer (TTL-based)
│   └── BullMQ job queue
├── Worker process (notifications, scheduled reports)
└── Supabase (external, unchanged)

Optional: Meilisearch container for full-text search
```

**Key changes**:
1. Everything from Option A (shared auth, tag-based caching)
2. Redis cache adapter (ioredis) for cross-instance caching
3. BullMQ worker for: bill reminders, budget alerts, low-balance warnings
4. Notification delivery: email (Resend) + in-app notification table
5. Supabase `pg_trgm` or Meilisearch for transaction search
6. Cron-triggered forecasting (projected balances, budget runway)

**Pros**: Full platform capabilities, background jobs, works offline from Vercel
**Cons**: Ops burden (Docker, Redis, worker health), more moving parts
**Risks**: Self-hosting reliability. Mitigate: health checks + systemd/docker restart policies.
**MVP**: Docker compose up, Redis cache, bill reminder emails.

---

### Option C: "Progressive Enhancement" (Pragmatic Middle)

**Focus**: Get 80% of the benefit with 20% of the infra complexity. Use Supabase
features (Edge Functions, pg_cron, pg_trgm) instead of self-hosting Redis/workers.

**Architecture**:
```
Next.js (Vercel or standalone)
├── React.cache() + cacheTag (in-process)
├── Recharts dashboard
└── API routes for search

Supabase
├── pg_trgm extension (full-text search on transactions)
├── pg_cron (bill reminders, budget alerts → Edge Functions)
├── Edge Functions (send emails via Resend)
└── Realtime (cache invalidation)
```

**Key changes**:
1. Shared auth + cacheTag caching (same as A)
2. Recharts for all charts + new report pages
3. `pg_trgm` index on `transactions.notes` for search
4. Supabase pg_cron + Edge Function for nightly bill/budget alerts
5. Forecasting as pure computation (projection functions, no worker needed)
6. In-app notification table polled via Realtime

**Pros**: No new infra to manage, leverages Supabase's built-in capabilities,
can migrate to Option B later if needed
**Cons**: pg_cron is coarser than BullMQ, Edge Functions have cold starts
**Risks**: Supabase free-tier limits on Edge Function invocations. Mitigate: batch notifications.
**MVP**: Cache + Recharts + transaction search + nightly bill alerts.

---

## Recommendation

### Primary: Option C — "Progressive Enhancement"

**Why**: Gets caching, Recharts, search, and notifications without adding Docker/Redis
ops burden. Supabase already has pg_trgm, pg_cron, Edge Functions, and Realtime — use
what's there. If scale demands it later, the caching layer and service extraction make
migrating to Option B (Redis + workers) a clean upgrade path.

### Backup: Option B — "Self-Hosted Platform"

If notification timing needs to be precise (sub-minute), or if search volume justifies
Meilisearch, or if you want to leave Vercel entirely.

## Implementation Phases

### Phase 1: Cache + Shared Auth (1-2 days)
- Extract `getAuthContext()` with `React.cache()`
- Add `cacheTag`/`cacheLife` to read actions
- Tag-based invalidation on mutations
- Supabase Realtime listener in layout

### Phase 2: Recharts + Reports (2-3 days)
- Install Recharts, replace hand-rolled charts
- Add monthly/yearly report pages with line, area, pie charts
- Exportable report view (print CSS or PDF via html2canvas)

### Phase 3: Search + Filters (1-2 days)
- Enable `pg_trgm` on Supabase, add GIN index on `transactions.notes`
- Transaction search API route + search UI component
- Saved filter presets

### Phase 4: Notifications (2-3 days)
- `notifications` table in Supabase
- pg_cron job for nightly bill/budget checks
- Edge Function to send email (Resend) + insert in-app notification
- Notification bell in sidebar with Realtime subscription

### Phase 5: Forecasting (1-2 days)
- Projected balance calculator (income - scheduled expenses over N months)
- Budget runway (days until budget exhausted at current rate)
- Bill calendar view (upcoming 30/60/90 days)

## Next Step

```
/discuss "Option C: Progressive Enhancement"
```
