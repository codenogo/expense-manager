-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add GIN index on transactions.notes for fast trigram search
CREATE INDEX IF NOT EXISTS idx_transactions_notes_trgm
  ON transactions USING gin (notes gin_trgm_ops);
