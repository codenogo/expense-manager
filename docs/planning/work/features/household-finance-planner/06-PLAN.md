# Plan 06: Build the main dashboard with monthly overview, spending trends, and household summary

## Goal
Build the main dashboard with monthly overview, spending trends, and household summary

## Tasks

### Task 1: Monthly overview dashboard
**Files:** `src/app/(app)/dashboard/page.tsx`, `src/lib/actions/dashboard.ts`, `src/components/dashboard/summary-cards.tsx`, `src/components/dashboard/category-breakdown.tsx`, `src/components/dashboard/recent-transactions.tsx`
**Action:**
Build the main dashboard page. Summary cards (income, expenses, net), category breakdown, recent transactions, upcoming bills. All data from Server Actions querying current month. Clean minimal layout with responsive grid.

**Micro-steps:**
- Write Server Action: getDashboardData (income, expenses, net for current month, by-category breakdown)
- Build summary cards: total income, total expenses, net surplus/deficit — each in a clean card
- Build category breakdown: horizontal bar chart or sorted list showing spend per category
- Build recent transactions widget: last 10 transactions with amount, category, date
- Integrate upcoming bills widget (from Plan 04) into dashboard
- Build dashboard page composing all widgets with responsive grid
- Verify dashboard loads with correct aggregations

**TDD:**
- required: `false`
- reason: Aggregation UI — verified by build + manual data verification

**Verify:**
```bash
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

### Task 2: Spending trends and charts
**Files:** `src/lib/actions/reports.ts`, `src/components/dashboard/spending-trends.tsx`, `src/components/dashboard/income-vs-expenses.tsx`
**Action:**
Add spending trends (6-month expense history) and income vs expenses comparison charts to dashboard. Use CSS-based bars for zero-dependency or recharts if richer interactivity needed. Server Action aggregates monthly totals.

**Micro-steps:**
- Write Server Action: getMonthlyTrends (last 6 months of income, expenses, net)
- Build spending trends chart: line or bar chart showing monthly expenses over 6 months
- Build income vs expenses chart: side-by-side bars per month
- Use lightweight charting (CSS-only bars or a small library like recharts)
- Integrate charts into dashboard page
- Verify charts render correctly with varying data

**TDD:**
- required: `false`
- reason: Visualization — verified by build + visual inspection

**Verify:**
```bash
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

### Task 3: Household contribution summary and app navigation
**Files:** `src/components/dashboard/member-contributions.tsx`, `src/components/layout/sidebar.tsx`, `src/components/layout/mobile-nav.tsx`, `src/app/(app)/layout.tsx`
**Action:**
Build household member contribution summary (who earned/spent what). Build responsive app navigation: sidebar on desktop, bottom nav on mobile. Links to all feature pages. Household name in sidebar header.

**Micro-steps:**
- Write member contributions component: per-member income, per-member expense, net contribution
- Build sidebar navigation: Dashboard, Transactions, Budget, Bills, Debts, Savings, Categories, Import, Settings
- Build mobile bottom nav with key pages
- Update (app) layout to include sidebar on desktop and bottom nav on mobile
- Add household name and member avatar/initials in sidebar header
- Verify navigation works across all pages
- Final build verification

**TDD:**
- required: `false`
- reason: Layout/navigation — verified by build + navigation test

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
feat(dashboard): add monthly overview, spending trends, and app navigation
```
