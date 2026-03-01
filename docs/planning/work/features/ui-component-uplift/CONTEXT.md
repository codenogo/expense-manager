# UI Component Uplift — Context

## Summary

Replace all native HTML form controls with shadcn/ui components to create a consistent, accessible, polished form experience across the entire app.

## Current State

- **6** native `<input type="date">` (transaction, bill, savings, filters)
- **18+** native `<select>` dropdowns across 13+ form files
- **2** custom UI components total (`Currency`, `ProgressBar`)
- **0** component libraries installed (no shadcn, Radix, Headless UI)
- **0** form validation libraries (no Zod, react-hook-form)
- All forms use raw HTML + repeated Tailwind classes
- Forms submit via Next.js Server Actions (`useActionState` + `FormData`)

## Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Library | **shadcn/ui** | Radix-based, Tailwind-native, tree-shakeable, full control. Supports Tailwind v4. |
| Scope | **Full form controls** | Input, Label, Button, Textarea, Select, DatePicker, Combobox. All forms refactored. |
| Combobox | **Yes, for categories and accounts** | These lists grow — type-to-filter significantly improves UX. |
| Date picker | **shadcn DatePicker** (Radix Popover + react-day-picker) | Replaces 6 native date inputs with consistent, accessible picker. |
| Compatibility | **Tailwind v4 CSS-first** | No tailwind.config.ts. Uses `@theme inline` in globals.css. |

## Constraints

- Tailwind CSS v4 (CSS-first config)
- React 19.2.3, Next.js 16.1.6
- Server Actions pattern must be preserved (FormData-based, `useActionState`)
- Warm color theme: terracotta + highland green
- DM Sans primary font
- Preserve existing ConfirmDialog and QuickEntrySheet (recently shipped)

## Components to Install (shadcn/ui)

- `button` — replace all ad-hoc styled `<button>` elements
- `input` — replace all `<input>` with consistent styling
- `label` — replace all `<label>` with consistent styling
- `textarea` — replace `<textarea>` usage
- `select` — replace simple native `<select>` dropdowns
- `popover` — dependency for date picker and combobox
- `calendar` — date picker calendar (react-day-picker)
- `command` — combobox search (cmdk)

## Forms to Refactor (13+)

1. `transaction-form.tsx` — date, account select, category select, type radio, amount, notes
2. `transaction-filters.tsx` — 2x date, type select, account select, category select
3. `quick-entry-sheet.tsx` — type radio, amount, account select, category select
4. `bill-form.tsx` — date, frequency select, category select, account select
5. `account-form.tsx` — type select, name, balance
6. `debt-form.tsx` — type select, name, balance, interest, min payment
7. `goal-form.tsx` — date, account select, name, target
8. `category-form.tsx` — parent category select, color radio
9. `add-budget-form.tsx` — category select, amount
10. `rule-form.tsx` — match type select, category select
11. `column-mapper.tsx` — 3x column selects
12. `import-preview.tsx` — account select, category select
13. `sign-in-form.tsx` — email, password
14. `sign-up-form.tsx` — name, email, password
