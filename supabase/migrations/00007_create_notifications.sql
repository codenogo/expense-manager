CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id uuid NOT NULL REFERENCES households(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('bill_overdue', 'budget_overspend', 'low_balance')),
  title text NOT NULL,
  body text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can see notifications for their household
CREATE POLICY "Users can view household notifications"
  ON notifications FOR SELECT
  USING (household_id IN (
    SELECT household_id FROM profiles WHERE id = auth.uid()
  ));

-- Users can update their own household notifications (mark as read)
CREATE POLICY "Users can update household notifications"
  ON notifications FOR UPDATE
  USING (household_id IN (
    SELECT household_id FROM profiles WHERE id = auth.uid()
  ));

-- Service role can insert (for the nightly job)
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_notifications_household_read ON notifications(household_id, read, created_at DESC);
