-- ─────────────────────────────────────────────────
-- Gate-failure policy defaults per developer
-- ─────────────────────────────────────────────────
-- Portal-level defaults for how a verification reacts when the front document
-- cannot be read (Gate 1: FRONT_OCR_FAILED / FRONT_LOW_CONFIDENCE):
--
--   max_gate_retries            0-5 in-session retakes before the fallback applies
--   unreadable_document_action  'reject'        → HARD_REJECTED (previous behaviour)
--                               'manual_review' → keep the flow going and finish in
--                                                 manual_review for a human reviewer
--
-- The initialize request may override both. The resolved values are copied into
-- verification_requests.addons so in-flight sessions are unaffected by later edits.
--
-- Defaults reproduce the previous behaviour, so existing developers see no change.
-- Constant defaults → metadata-only ALTER on PG 11+, no table rewrite.
-- ─────────────────────────────────────────────────

ALTER TABLE developers
  ADD COLUMN IF NOT EXISTS max_gate_retries SMALLINT NOT NULL DEFAULT 0
    CONSTRAINT developers_max_gate_retries_range CHECK (max_gate_retries BETWEEN 0 AND 5),
  ADD COLUMN IF NOT EXISTS unreadable_document_action TEXT NOT NULL DEFAULT 'reject'
    CONSTRAINT developers_unreadable_document_action_valid CHECK (unreadable_document_action IN ('reject', 'manual_review'));

COMMENT ON COLUMN developers.max_gate_retries IS
  'Default in-session retries for a failed gate (0-5). Overridable per verification via initialize.max_gate_retries.';
COMMENT ON COLUMN developers.unreadable_document_action IS
  'Default action when the front document cannot be read after retries: reject | manual_review.';
