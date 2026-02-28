-- Initial schema for household finance planner
-- All monetary amounts stored as bigint in KES cents (1 KES = 100 cents)

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE households (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  household_id uuid REFERENCES households ON DELETE SET NULL,
  full_name    text NOT NULL,
  role         text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households ON DELETE CASCADE,
  name         text NOT NULL,
  type         text NOT NULL CHECK (type IN ('checking', 'savings', 'credit_card', 'loan', 'cash', 'mpesa')),
  balance      bigint NOT NULL DEFAULT 0,  -- KES cents
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households ON DELETE CASCADE,
  name         text NOT NULL,
  parent_id    uuid REFERENCES categories ON DELETE SET NULL,
  icon         text,
  color        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households ON DELETE CASCADE,
  account_id   uuid NOT NULL REFERENCES accounts ON DELETE CASCADE,
  category_id  uuid REFERENCES categories ON DELETE SET NULL,
  amount       bigint NOT NULL,  -- KES cents, always positive
  type         text NOT NULL CHECK (type IN ('income', 'expense')),
  date         date NOT NULL DEFAULT CURRENT_DATE,
  notes        text,
  created_by   uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE budgets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households ON DELETE CASCADE,
  category_id  uuid NOT NULL REFERENCES categories ON DELETE CASCADE,
  month        date NOT NULL,  -- first day of month
  amount       bigint NOT NULL,  -- KES cents
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, category_id, month)
);

CREATE TABLE recurring_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id   uuid NOT NULL REFERENCES households ON DELETE CASCADE,
  name           text NOT NULL,
  amount         bigint NOT NULL,  -- KES cents
  frequency      text NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
  next_due_date  date NOT NULL,
  category_id    uuid REFERENCES categories ON DELETE SET NULL,
  account_id     uuid REFERENCES accounts ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE debts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  uuid NOT NULL REFERENCES households ON DELETE CASCADE,
  name          text NOT NULL,
  type          text NOT NULL CHECK (type IN ('bank_loan', 'sacco_loan', 'credit_card', 'informal')),
  balance       bigint NOT NULL,  -- KES cents
  interest_rate numeric(5,2),     -- annual percentage, nullable for informal
  min_payment   bigint,           -- KES cents, nullable
  owed_to       text,             -- person name for informal debts, nullable
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE savings_goals (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id   uuid NOT NULL REFERENCES households ON DELETE CASCADE,
  name           text NOT NULL,
  target_amount  bigint NOT NULL,  -- KES cents
  current_amount bigint NOT NULL DEFAULT 0,  -- KES cents
  deadline       date,             -- nullable
  account_id     uuid REFERENCES accounts ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_profiles_household      ON profiles(household_id);
CREATE INDEX idx_accounts_household      ON accounts(household_id);
CREATE INDEX idx_categories_household    ON categories(household_id);
CREATE INDEX idx_categories_parent       ON categories(parent_id);
CREATE INDEX idx_transactions_household  ON transactions(household_id);
CREATE INDEX idx_transactions_account    ON transactions(account_id);
CREATE INDEX idx_transactions_category   ON transactions(category_id);
CREATE INDEX idx_transactions_date       ON transactions(date);
CREATE INDEX idx_transactions_created_by ON transactions(created_by);
CREATE INDEX idx_budgets_household_month ON budgets(household_id, month);
CREATE INDEX idx_recurring_household     ON recurring_items(household_id);
CREATE INDEX idx_recurring_next_due      ON recurring_items(next_due_date);
CREATE INDEX idx_debts_household         ON debts(household_id);
CREATE INDEX idx_savings_household       ON savings_goals(household_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE households    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- households: accessible if user's profile references this household
CREATE POLICY "households_household_access" ON households
  FOR ALL
  USING (
    id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- profiles: own row access + read-only access to same household members
CREATE POLICY "profiles_own_access" ON profiles
  FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_household_read" ON profiles
  FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- accounts
CREATE POLICY "accounts_household_access" ON accounts
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- categories
CREATE POLICY "categories_household_access" ON categories
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- transactions
CREATE POLICY "transactions_household_access" ON transactions
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- budgets
CREATE POLICY "budgets_household_access" ON budgets
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- recurring_items
CREATE POLICY "recurring_items_household_access" ON recurring_items
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- debts
CREATE POLICY "debts_household_access" ON debts
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- savings_goals
CREATE POLICY "savings_goals_household_access" ON savings_goals
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER households_updated_at
  BEFORE UPDATE ON households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER debts_updated_at
  BEFORE UPDATE ON debts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER savings_goals_updated_at
  BEFORE UPDATE ON savings_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
