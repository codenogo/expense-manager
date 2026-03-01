# Plan 01: Initialize shadcn/ui with Tailwind v4 CSS-first config, install all 8 base components, and create FormData-compatible DatePicker and Combobox wrappers

## Goal
Initialize shadcn/ui with Tailwind v4 CSS-first config, install all 8 base components, and create FormData-compatible DatePicker and Combobox wrappers

## Tasks

### Task 1: Initialize shadcn/ui with Tailwind v4 and warm color theme
**Files:** `src/app/globals.css`, `components.json`, `src/lib/utils.ts`
**Action:**
Initialize shadcn/ui for Tailwind v4. Use `npx shadcn@latest init` with CSS variables mode. Map the warm color theme: primary → terracotta #C4663A, primary-foreground → white, accent → highland green #2D8659, destructive → red-600, background → #ffffff, foreground → #171717. Add all required shadcn CSS variables (border, ring, muted, card, popover, etc.) using the warm palette. Preserve existing @theme inline block and DM Sans font.

**Micro-steps:**
- Run `npx shadcn@latest init` choosing Tailwind v4 CSS-first mode (new-york style, CSS variables)
- Verify components.json was created with correct tailwind v4 config
- Map existing warm color theme to shadcn CSS variables in globals.css: primary → terracotta (#C4663A), accent → highland green (#2D8659), destructive → red, background/foreground → existing values
- Ensure DM Sans font is preserved and set as --font-sans
- Verify `cn()` utility exists in src/lib/utils.ts (created by shadcn init)
- Run type check to confirm no errors

**TDD:**
- required: `false`
- reason: Infrastructure setup — verified via type check and build

**Verify:**
```bash
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

### Task 2: Install all 8 shadcn/ui base components
**Files:** `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/label.tsx`, `src/components/ui/textarea.tsx`, `src/components/ui/select.tsx`, `src/components/ui/popover.tsx`, `src/components/ui/calendar.tsx`, `src/components/ui/command.tsx`
**Action:**
Install all 8 shadcn components via CLI: button, input, label, textarea, select, popover, calendar, command. These are dependencies for DatePicker (popover + calendar), Combobox (command + popover), and all form refactors. Verify no naming conflicts with existing UI components (currency, progress-bar, confirm-dialog, toast-handler).

**Micro-steps:**
- Run `npx shadcn@latest add button input label textarea select popover calendar command`
- Verify all 8 component files were created in src/components/ui/
- Verify package.json has react-day-picker, cmdk, @radix-ui/* dependencies
- Confirm no conflicts with existing currency.tsx, progress-bar.tsx, confirm-dialog.tsx
- Run type check to confirm all components compile

**TDD:**
- required: `false`
- reason: Scaffolded component installation — verified via type check and build

**Verify:**
```bash
npx tsc --noEmit
npm run build
```

**Done when:** [Observable outcome]

### Task 3: Create FormData-compatible DatePicker and Combobox wrappers
**Files:** `src/components/ui/date-picker.tsx`, `src/components/ui/combobox.tsx`
**Action:**
Create two wrapper components that bridge shadcn primitives to the Server Actions FormData pattern. DatePicker: combines Popover + Calendar + hidden input with `name` prop, formats date as ISO string for FormData. Combobox: combines Popover + Command + hidden input with `name` prop, type-to-filter support, renders selected label in trigger. Both must support `defaultValue` for edit forms and `required` for validation. Both must be client components ('use client').

**Micro-steps:**
- Create src/components/ui/date-picker.tsx: Popover trigger (Button with calendar icon + formatted date), Calendar in popover content, hidden <input name={name} value={iso-date}> for FormData submission, props: name, defaultValue, placeholder, disabled, required
- Create src/components/ui/combobox.tsx: Popover trigger (Button with current selection + chevron), Command with search input + list in popover content, hidden <input name={name} value={selected-id}> for FormData submission, props: name, options (value/label pairs), defaultValue, placeholder, disabled, required, emptyMessage
- Ensure both components work as uncontrolled (FormData) and support defaultValue for edit forms
- Verify type check passes
- Verify build succeeds

**TDD:**
- required: `false`
- reason: UI wrapper components — verified via type check, build, and manual testing

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
feat(ui): initialize shadcn/ui with Tailwind v4 and create DatePicker + Combobox components
```
