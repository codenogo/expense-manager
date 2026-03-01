# Plan 04: Refactor import, settings, and auth forms to complete the UI component uplift across all 13+ forms

## Goal
Refactor import, settings, and auth forms to complete the UI component uplift across all 13+ forms

## Tasks

### Task 1: Refactor rule-form.tsx
**Files:** `src/components/settings/rule-form.tsx`
**Action:**
Refactor rule-form (4 controls: pattern input, match_type select, category_id select, priority input). Uses useTransition for manual form handling (not useActionState). Replace match_type → Select, category_id → Combobox, inputs → Input, labels → Label, buttons → Button. Preserve the grid layout and error state display.

**Micro-steps:**
- Replace match_type <select> with Select component
- Replace category_id <select> with Combobox (type-to-filter categories)
- Replace pattern/priority <input> with Input component
- Replace <label> with Label, submit/cancel <button> with Button
- Preserve useTransition manual submission pattern
- Preserve grid layout (1 col mobile, 2 col sm) and error display
- Run type check and build

**TDD:**
- required: `false`
- reason: UI component swap — verified via type check, build, and manual testing

**Verify:**
```bash
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

### Task 2: Refactor column-mapper.tsx and import-preview.tsx
**Files:** `src/components/import/column-mapper.tsx`, `src/components/import/import-preview.tsx`
**Action:**
Refactor column-mapper (3x selects + confirm button, client-side only) and import-preview (2x selects + import button, uses useTransition + server action). column-mapper: 3x <select> → Select, button → Button, preserve onConfirm callback and CSV preview table. import-preview: account/category <select> → Combobox (accounts and categories can grow), button → Button with loading state, preserve transaction summary badges and scrollable table.

**Micro-steps:**
- column-mapper: Replace 3x column <select> with Select components (date/amount/description columns)
- column-mapper: Replace confirm <button> with Button component
- column-mapper: Preserve client-side callback pattern (onConfirm, no server action)
- column-mapper: Preserve CSV preview table rendering
- import-preview: Replace account <select> with Combobox component
- import-preview: Replace default category <select> with Combobox component
- import-preview: Replace import <button> with Button (preserve loading state)
- import-preview: Preserve useTransition and bulkCreateTransactions action
- Run type check and build

**TDD:**
- required: `false`
- reason: UI component swap — verified via type check, build, and manual testing

**Verify:**
```bash
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

### Task 3: Refactor sign-in-form.tsx and sign-up-form.tsx
**Files:** `src/components/auth/sign-in-form.tsx`, `src/components/auth/sign-up-form.tsx`
**Action:**
Refactor both auth forms. sign-in-form: 2x input → Input (email, password), labels → Label, button → Button. sign-up-form: 3x input → Input (name, email, password), labels → Label, button → Button. Both use useActionState — preserve pending state disabling and error display. These are the simplest refactors as they only use basic Input/Label/Button components.

**Micro-steps:**
- sign-in-form: Replace email <input> with Input (type='email')
- sign-in-form: Replace password <input> with Input (type='password')
- sign-in-form: Replace <label> with Label, submit <button> with Button
- sign-in-form: Preserve useActionState pending state and error display
- sign-up-form: Replace name/email/password <input> with Input components
- sign-up-form: Replace <label> with Label, submit <button> with Button
- sign-up-form: Preserve useActionState, minLength validation, and Link to sign-in
- Run type check and build

**TDD:**
- required: `false`
- reason: UI component swap — verified via type check, build, and manual testing

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
feat(ui): refactor import, settings, and auth forms to complete shadcn/ui uplift
```
