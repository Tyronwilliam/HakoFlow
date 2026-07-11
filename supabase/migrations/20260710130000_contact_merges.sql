-- =========================================================
-- HAK-76: contact_merges — merge history table (2/7 of the
-- HAK-71 "annuler une fusion" epic).
--
-- Depends on HAK-75 (contacts.deleted_at): the source contact
-- of a merge now survives as a soft-deleted row, so this table
-- only needs to record what moved and what changed on the
-- target — no JSON snapshot of the source contact is needed,
-- target_contact_id/source_contact_id are plain FKs.
--
-- Out of scope here (see HAK-77): merge_contacts actually
-- writing rows into this table, and the undo RPC itself.
--
-- Writes are reserved to future SECURITY DEFINER RPCs, which
-- bypass RLS entirely — so the policy below only ever needs to
-- authorize SELECT, and only SELECT is granted to authenticated.
-- =========================================================

CREATE TABLE contact_merges (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id              uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  merge_suggestion_id       uuid REFERENCES merge_suggestions(id) ON DELETE SET NULL,
  target_contact_id         uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  source_contact_id         uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  moved_contact_channel_ids uuid[] NOT NULL DEFAULT '{}',
  moved_conversation_ids    uuid[] NOT NULL DEFAULT '{}',
  target_tags_before        text[] NOT NULL DEFAULT '{}',
  target_notes_before       text,
  merged_at                 timestamptz NOT NULL DEFAULT now(),
  undone_at                 timestamptz
);

CREATE INDEX ON contact_merges (workspace_id, target_contact_id);
CREATE INDEX ON contact_merges (source_contact_id);

ALTER TABLE contact_merges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_isolation" ON contact_merges
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

GRANT SELECT ON contact_merges TO authenticated;
