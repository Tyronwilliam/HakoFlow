-- =========================================================
-- merge_suggestions
--
-- Level 3 (human decision): a suggestion is never applied
-- automatically, no matter the score. It only surfaces a
-- candidate pair of contacts for a human to merge or ignore.
--
-- contact_a_id/contact_b_id are stored with a < b (enforced by
-- the CHECK below) so the same pair can't be suggested twice in
-- reversed order.
-- =========================================================

CREATE TABLE merge_suggestions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contact_a_id    uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  contact_b_id    uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  score           real NOT NULL,
  reason          text NOT NULL,
  status          text NOT NULL DEFAULT 'pending',
  created_at      timestamptz DEFAULT now(),
  decided_at      timestamptz,

  CHECK (contact_a_id < contact_b_id),
  CHECK (status IN ('pending', 'merged', 'ignored')),
  UNIQUE (contact_a_id, contact_b_id)
);

CREATE INDEX ON merge_suggestions (workspace_id, status);

ALTER TABLE merge_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_isolation" ON merge_suggestions
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON merge_suggestions TO authenticated;
