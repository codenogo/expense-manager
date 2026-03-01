# Plan 05: Add notification system with notifications table, pg_cron nightly checks, Edge Function email delivery, and notification bell UI

## Goal
Add notification system with notifications table, pg_cron nightly checks, Edge Function email delivery, and notification bell UI

## Tasks

### Task 1: Create notifications table and server actions
**Files:** `supabase/migrations/00007_create_notifications.sql`, `src/lib/actions/notifications.ts`
**Action:**
Create the notifications table migration with proper RLS policies. Then create src/lib/actions/notifications.ts with CRUD server actions using shared getHouseholdId() auth. Notification types: 'bill_overdue', 'budget_overspend', 'low_balance'.

**Micro-steps:**
- Create migration with notifications table: id (uuid), household_id (uuid FK), user_id (uuid FK), type (text), title (text), body (text), read (boolean default false), created_at (timestamptz)
- Add RLS policy scoped to household_id
- Create server actions: getNotifications(), getUnreadCount(), markAsRead(id), markAllAsRead()

**TDD:**
- required: `false`
- reason: Migration + server actions depend on Supabase — verified via type check and migration apply.

**Verify:**
```bash
npx tsc --noEmit 2>&1 | grep -v 'household.ts' | head -20
```

**Done when:** [Observable outcome]

### Task 2: Create pg_cron job and Supabase Edge Function for nightly checks
**Files:** `supabase/migrations/00008_add_pg_cron_notifications.sql`, `supabase/functions/nightly-checks/index.ts`
**Action:**
Create a Supabase Edge Function that queries overdue bills and overspent budgets, inserts notifications, and sends emails via Resend. Create a migration that schedules this function via pg_cron to run nightly. Edge Function uses service_role key for cross-household checks.

**Micro-steps:**
- Create Edge Function at supabase/functions/nightly-checks/index.ts
- Edge Function checks: overdue bills (next_due_date < today), budget overspend (spent > amount)
- For each alert: insert row into notifications table + send email via Resend API
- Create migration that sets up pg_cron job calling the Edge Function nightly at 06:00 UTC
- Use SELECT cron.schedule() to register the job

**TDD:**
- required: `false`
- reason: Edge Function + pg_cron — requires Supabase deployment to test. Verified via Deno type check.

**Verify:**
```bash
cat supabase/functions/nightly-checks/index.ts
cat supabase/migrations/00008_add_pg_cron_notifications.sql
```

**Done when:** [Observable outcome]

### Task 3: Add notification bell UI in sidebar with Realtime subscription
**Files:** `src/components/notifications/notification-bell.tsx`, `src/components/notifications/notification-list.tsx`, `src/components/sidebar.tsx`
**Action:**
Create notification bell component for sidebar. Shows unread count badge, dropdown list on click, mark-as-read per item or all. Subscribes to Supabase Realtime for live updates when new notifications arrive.

**Micro-steps:**
- Create notification-bell.tsx — 'use client' component with bell icon and unread count badge
- On click, show dropdown with notification-list.tsx
- notification-list.tsx renders notifications with mark-as-read action
- Subscribe to Supabase Realtime on notifications table for live count updates
- Add NotificationBell to sidebar component

**TDD:**
- required: `false`
- reason: UI component with Realtime — verified via build + manual testing.

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
feat(notifications): add notification system with pg_cron, Edge Function, and bell UI
```
