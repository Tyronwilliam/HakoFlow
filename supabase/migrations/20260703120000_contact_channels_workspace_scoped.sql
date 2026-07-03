-- =========================================================
-- contact_channels: workspace-scoped identifier uniqueness
--
-- Business rules:
--   - A contact CAN have several channels of the same provider
--     (e.g. two Gmail addresses) -> UNIQUE (contact_id, provider)
--     was too restrictive, dropped.
--   - A given (provider, external_id) identifier must belong to
--     exactly ONE contact, workspace-wide -> new UNIQUE constraint,
--     mirroring the pattern already used by `whitelist`.
-- =========================================================

ALTER TABLE contact_channels
  ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;

UPDATE contact_channels cc
SET workspace_id = c.workspace_id
FROM contacts c
WHERE c.id = cc.contact_id;

ALTER TABLE contact_channels
  ALTER COLUMN workspace_id SET NOT NULL;

-- ---------------------------------------------------------
-- Auto-fill workspace_id from contact_id so callers never
-- have to pass it explicitly (and it can't drift from the
-- parent contact's workspace).
-- ---------------------------------------------------------
CREATE FUNCTION public.sync_contact_channel_workspace_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT workspace_id INTO NEW.workspace_id FROM contacts WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_contact_channel_workspace_id
  BEFORE INSERT OR UPDATE OF contact_id ON contact_channels
  FOR EACH ROW EXECUTE PROCEDURE public.sync_contact_channel_workspace_id();

ALTER TABLE contact_channels
  DROP CONSTRAINT IF EXISTS contact_channels_contact_id_provider_key;

ALTER TABLE contact_channels
  ADD CONSTRAINT contact_channels_workspace_provider_external_id_key
  UNIQUE (workspace_id, provider, external_id);

-- Superseded by the unique constraint's backing index above.
DROP INDEX IF EXISTS contact_channels_provider_external_id_idx;

CREATE INDEX ON contact_channels (workspace_id);

-- RLS: use workspace_id directly instead of the join-through-contacts
-- subquery that was needed before this column existed.
ALTER POLICY "workspace_isolation" ON contact_channels
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
