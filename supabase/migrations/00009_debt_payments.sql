-- debt_payments table for tracking individual debt payments
CREATE TABLE debt_payments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id    uuid NOT NULL REFERENCES households ON DELETE CASCADE,
  debt_id         uuid NOT NULL REFERENCES debts ON DELETE CASCADE,
  account_id      uuid NOT NULL REFERENCES accounts ON DELETE CASCADE,
  transaction_id  uuid REFERENCES transactions ON DELETE SET NULL,
  amount          bigint NOT NULL,  -- KES cents
  date            date NOT NULL DEFAULT CURRENT_DATE,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Add system-managed flag to accounts
ALTER TABLE accounts ADD COLUMN is_system_managed boolean NOT NULL DEFAULT false;

-- Indexes
CREATE INDEX idx_debt_payments_household ON debt_payments(household_id);
CREATE INDEX idx_debt_payments_debt ON debt_payments(debt_id);
CREATE INDEX idx_debt_payments_date ON debt_payments(date);

-- RLS
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "debt_payments_household_access" ON debt_payments
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
