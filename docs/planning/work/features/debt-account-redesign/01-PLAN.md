# Plan 01: Add debt_payments table and is_system_managed column to accounts, then update TypeScript types

## Goal
Add debt_payments table and is_system_managed column to accounts, then update TypeScript types

## Tasks

### Task 1: Write migration 00009 for debt_payments table and accounts column
**Files:** `supabase/migrations/00009_debt_payments.sql`
**Action:**
Create supabase/migrations/00009_debt_payments.sql with:

1. CREATE TABLE debt_payments with:
   - id uuid PK default gen_random_uuid()
   - household_id uuid NOT NULL FK households ON DELETE CASCADE
   - debt_id uuid NOT NULL FK debts ON DELETE CASCADE
   - account_id uuid NOT NULL FK accounts ON DELETE CASCADE
   - transaction_id uuid FK transactions ON DELETE SET NULL (nullable — set after transaction created)
   - amount bigint NOT NULL (KES cents)
   - date date NOT NULL DEFAULT CURRENT_DATE
   - notes text (nullable)
   - created_at timestamptz NOT NULL DEFAULT now()

2. ALTER TABLE accounts ADD COLUMN is_system_managed boolean NOT NULL DEFAULT false;

3. Indexes:
   - idx_debt_payments_household ON debt_payments(household_id)
   - idx_debt_payments_debt ON debt_payments(debt_id)
   - idx_debt_payments_date ON debt_payments(date)

4. RLS:
   - ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
   - CREATE POLICY using same household_id pattern as other tables

Follow the exact patterns from 00001_initial_schema.sql for consistency.

**Micro-steps:**
- Create migration file 00009_debt_payments.sql
- Add debt_payments table with columns: id (uuid PK), household_id (FK households), debt_id (FK debts), account_id (FK accounts), transaction_id (FK transactions, nullable), amount (bigint), date (date), notes (text nullable), created_at (timestamptz)
- Add is_system_managed boolean column to accounts table (default false)
- Add indexes: debt_payments by household_id, debt_id, and date
- Add RLS policy for debt_payments matching household_id pattern
- Add updated_at trigger if needed

**TDD:**
- required: `false`
- reason: SQL migration — verified by syntax check and build, no runtime unit test applicable

**Verify:**
```bash
npx tsc --noEmit
```

**Done when:** [Observable outcome]

### Task 2: Update TypeScript database types for new schema
**Files:** `src/types/database.ts`
**Action:**
Update src/types/database.ts to add:

1. debt_payments table types (Row, Insert, Update) following the exact pattern used for other tables in the file
2. Add is_system_managed: boolean to accounts Row type
3. Add is_system_managed?: boolean to accounts Insert type (has default)
4. Add is_system_managed?: boolean to accounts Update type

The debt_payments Row type should have:
- id: string
- household_id: string
- debt_id: string
- account_id: string
- transaction_id: string | null
- amount: number
- date: string
- notes: string | null
- created_at: string

**Micro-steps:**
- Read current database.ts to understand the type generation pattern
- Add debt_payments table Row/Insert/Update types following existing pattern
- Add is_system_managed field to accounts Row type
- Verify all types are consistent with migration

**TDD:**
- required: `false`
- reason: Type definitions — verified by TypeScript compiler (tsc --noEmit)

**Verify:**
```bash
npx tsc --noEmit
```

**Done when:** [Observable outcome]

## Verification

After all tasks:
```bash
npx tsc --noEmit
```

## Commit Message
```
feat(debts): add debt_payments table and is_system_managed account flag
```
