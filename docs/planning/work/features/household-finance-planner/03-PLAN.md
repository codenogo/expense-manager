# Plan 03: Add CSV import with column mapping and auto-categorization rules

## Goal
Add CSV import with column mapping and auto-categorization rules

## Tasks

### Task 1: CSV import engine with configurable column mapping
**Files:** `src/app/(app)/import/page.tsx`, `src/lib/actions/import.ts`, `src/lib/csv-parser.ts`, `src/components/import/csv-upload.tsx`, `src/components/import/column-mapper.tsx`, `src/components/import/import-preview.tsx`
**Action:**
Build CSV import flow: upload → map columns → preview → confirm. CSV parser handles date format variations, positive/negative amounts, and header detection. Server Action bulk-inserts validated transactions. No bank-specific presets — user maps every import.

**Micro-steps:**
- Write CSV parser utility: parse CSV string to rows, detect headers, handle common encodings
- Write failing test for CSV parser (date formats, amount parsing, negative amounts)
- Implement CSV parser to pass tests
- Build CSV upload component: file input, drag-and-drop, parse on upload
- Build column mapper: user maps CSV columns to transaction fields (date, amount, description, category)
- Build import preview: show parsed transactions before committing
- Write Server Action: bulkCreateTransactions with validation

**TDD:**
- required: `true`
- failingVerify:
  - `npx vitest run src/lib/csv-parser.test.ts`
- passingVerify:
  - `npx vitest run src/lib/csv-parser.test.ts`

**Verify:**
```bash
npx vitest run src/lib/csv-parser.test.ts
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

### Task 2: Auto-categorization rules engine
**Files:** `src/app/(app)/settings/rules/page.tsx`, `src/lib/actions/rules.ts`, `src/lib/categorizer.ts`, `src/components/settings/rule-form.tsx`, `src/components/settings/rule-list.tsx`
**Action:**
Build auto-categorization rules: user defines patterns (contains/exact/starts-with) that map to categories. Applied during CSV import and manual entry. Rules stored in DB per household. Categorizer is a pure function tested independently.

**Micro-steps:**
- Write failing test: categorizer matches transaction description against rules (exact, contains, regex)
- Implement categorizer: match payee/description against rules, return category_id or null
- Write Server Actions: createRule, updateRule, deleteRule, getRules
- Build rules list page under settings
- Build rule form: match pattern, match type (contains/exact/starts-with), target category
- Apply categorizer during CSV import and manual transaction creation
- Verify rules auto-assign categories on new transactions

**TDD:**
- required: `true`
- failingVerify:
  - `npx vitest run src/lib/categorizer.test.ts`
- passingVerify:
  - `npx vitest run src/lib/categorizer.test.ts`

**Verify:**
```bash
npx vitest run src/lib/categorizer.test.ts
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

## Verification

After all tasks:
```bash
npx vitest run
npx tsc --noEmit
npm run build
```

## Commit Message
```
feat(import): add CSV import with column mapping and auto-categorization rules
```
