# Plan 06: Add forecasting features: projected balances, budget runway, and bill calendar view

## Goal
Add forecasting features: projected balances, budget runway, and bill calendar view

## Tasks

### Task 1: Create forecasting server actions
**Files:** `src/lib/actions/forecasting.ts`
**Action:**
Create forecasting server actions. Write tests first for the pure computation functions (projectBalance, calculateRunway, projectBillDates) — these are testable without Supabase. Then implement the server actions that call these functions with real data.

**Micro-steps:**
- Create src/lib/actions/forecasting.ts with 'use server' directive
- Implement getProjectedBalance(months: number) — sum account balances + projected income - projected expenses over N months using recurring items
- Implement getBudgetRunway() — for each active budget: (amount - spent) / daily_spend_rate = days remaining
- Implement getBillCalendar(days: number) — query recurring items, project next occurrences for 30/60/90 days
- Use shared getHouseholdId() for auth

**TDD:**
- required: `true`
- failingVerify:
  - `npm test -- --run src/lib/actions/__tests__/forecasting.test.ts 2>&1 | tail -10`
- passingVerify:
  - `npm test -- --run src/lib/actions/__tests__/forecasting.test.ts 2>&1 | tail -10`

**Verify:**
```bash
npx tsc --noEmit 2>&1 | grep -v 'household.ts' | head -20
npm test -- --run src/lib/actions/__tests__/forecasting.test.ts 2>&1 | tail -10
```

**Done when:** [Observable outcome]

### Task 2: Create forecasting page with projected balance and budget runway
**Files:** `src/app/(app)/forecasting/page.tsx`, `src/app/(app)/forecasting/loading.tsx`, `src/components/sidebar.tsx`
**Action:**
Create the forecasting page with projected balance LineChart (using Recharts from Plan 03) and budget runway display. Server component fetches data from forecasting actions, passes to chart wrappers.

**Micro-steps:**
- Create forecasting/page.tsx as server component
- Show projected balance chart (LineChart — balance over next 3 months)
- Show budget runway cards (days remaining per budget category)
- Create forecasting/loading.tsx skeleton
- Add Forecasting link to sidebar

**TDD:**
- required: `false`
- reason: UI page — verified via build + manual inspection.

**Verify:**
```bash
npx tsc --noEmit 2>&1 | grep -v 'household.ts' | head -20
npm run build 2>&1 | tail -20
```

**Done when:** [Observable outcome]

### Task 3: Add bill calendar view
**Files:** `src/components/forecasting/bill-calendar.tsx`, `src/app/(app)/forecasting/page.tsx`
**Action:**
Create a bill calendar component showing upcoming bills over the next 30/60/90 days. Uses getBillCalendar() server action. Timeline view grouped by week with color-coded status indicators.

**Micro-steps:**
- Create bill-calendar.tsx — displays upcoming bills in a timeline/list view
- Group by week or month, show amount and due date
- Color-code: overdue (red), due soon (amber), upcoming (green)
- Add to forecasting page below the projected balance section
- Allow toggling between 30/60/90 day views

**TDD:**
- required: `false`
- reason: UI component — verified via build + manual inspection.

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
feat(forecasting): add projected balances, budget runway, and bill calendar
```
