-- =========================================================
-- contact_channels — scope by workspace_id
--
-- contact_channels only carried contact_id, so its uniqueness
-- was enforced per-contact (contact_id, provider). Nothing
-- stopped the same native external_id from being linked to two
-- different contacts across workspaces, and lookups by
-- (provider, external_id) during ingestion had to join through
-- contacts to find the owning workspace.
--
-- Adding workspace_id directly lets ingestion resolve a contact
-- from (workspace_id, provider, external_id) in a single index
-- lookup, and lets us enforce the real invariant for level 2
-- auto-grouping: one native identifier maps to at most one
-- contact per workspace.
-- =========================================================

ALTER TABLE contact_channels
  ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;

UPDATE contact_channels cc
SET workspace_id = c.workspace_id
FROM contacts c
WHERE c.id = cc.contact_id;

ALTER TABLE contact_channels
  ALTER COLUMN workspace_id SET NOT NULL;

CREATE UNIQUE INDEX contact_channels_workspace_provider_external_id_key
  ON contact_channels (workspace_id, provider, external_id);

CREATE INDEX ON contact_channels (workspace_id);

-- RLS: check workspace_id directly instead of joining through
-- contacts on every row.
DROP POLICY "workspace_isolation" ON contact_channels;

CREATE POLICY "workspace_isolation" ON contact_channels
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );
