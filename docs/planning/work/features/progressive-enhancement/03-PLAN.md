# Plan 03: Install Recharts, replace all hand-rolled chart components, and add report pages

## Goal
Install Recharts, replace all hand-rolled chart components, and add report pages

## Tasks

### Task 1: Install Recharts and create chart wrapper components
**Files:** `package.json`, `src/components/charts/bar-chart.tsx`, `src/components/charts/line-chart.tsx`, `src/components/charts/pie-chart.tsx`
**Action:**
Install recharts. Create three thin 'use client' chart wrapper components in src/components/charts/. Each wraps the corresponding Recharts component with ResponsiveContainer, Tooltip, and consistent color tokens. Props are typed for the data shapes used by dashboard (spending trends, income vs expenses, category breakdown).

**Micro-steps:**
- Install recharts: npm install recharts
- Create src/components/charts/ directory
- Create bar-chart.tsx — 'use client' wrapper around Recharts BarChart with ResponsiveContainer
- Create line-chart.tsx — 'use client' wrapper around Recharts LineChart
- Create pie-chart.tsx — 'use client' wrapper around Recharts PieChart
- Each wrapper accepts typed data props and renders with Tailwind-consistent colors

**TDD:**
- required: `false`
- reason: UI components — visual verification. Type checked via build.

**Verify:**
```bash
npx tsc --noEmit 2>&1 | grep -v 'household.ts' | head -20
```

**Done when:** [Observable outcome]

### Task 2: Replace hand-rolled dashboard charts with Recharts components
**Files:** `src/components/dashboard/spending-trends.tsx`, `src/components/dashboard/income-vs-expenses.tsx`, `src/components/dashboard/category-breakdown.tsx`
**Action:**
Rewrite the three dashboard chart components to use the Recharts wrappers from Task 1. Keep the same prop interfaces so dashboard/page.tsx doesn't need changes. The chart components become 'use client' (they import Recharts which requires client rendering).

**Micro-steps:**
- Replace spending-trends.tsx CSS bars with BarChart from src/components/charts/bar-chart
- Replace income-vs-expenses.tsx grouped bars with grouped BarChart
- Replace category-breakdown.tsx progress bars with PieChart from src/components/charts/pie-chart
- Keep same data shapes and props — server components pass data, chart wrappers render
- Mark chart-using components as 'use client' if they weren't already

**TDD:**
- required: `false`
- reason: Visual replacement — same data, different rendering. Verified via build.

**Verify:**
```bash
npx tsc --noEmit 2>&1 | grep -v 'household.ts' | head -20
npm run build 2>&1 | tail -20
```

**Done when:** [Observable outcome]

### Task 3: Add reports page with monthly trends, income vs expenses, and category breakdown
**Files:** `src/app/(app)/reports/page.tsx`, `src/app/(app)/reports/loading.tsx`, `src/lib/actions/reports.ts`, `src/components/sidebar.tsx`
**Action:**
Create a reports page that uses Recharts components to show: (1) monthly spending trend as LineChart (last 6 months), (2) income vs expenses as stacked BarChart, (3) category spending as PieChart. Data comes from server actions. Add to sidebar nav.

**Micro-steps:**
- Enhance getMonthlyReport() in reports.ts to return data shaped for LineChart and PieChart
- Create src/app/(app)/reports/page.tsx with monthly spending LineChart, income vs expenses BarChart, and category PieChart
- Create reports/loading.tsx skeleton
- Add Reports link to sidebar navigation

**TDD:**
- required: `false`
- reason: New page with visual output — verified via build + manual inspection.

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
feat(charts): replace hand-rolled charts with Recharts, add reports page
```
