-- Add addons column to verification_requests for per-verification flags
ALTER TABLE verification_requests
  ADD COLUMN IF NOT EXISTS addons JSONB;

COMMENT ON COLUMN verification_requests.addons IS
  'Per-verification addon flags (e.g., force_manual_review, manual_collection, aml_screening). Stored as JSONB for flexibility.';
