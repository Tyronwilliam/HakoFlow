-- =========================================================
-- contact_link_history — history of manual channel-to-contact
-- linking (link_contact_channel), mirroring contact_merges
-- (20260710130000) for the merge flow.
--
-- Unlike a merge, linking never deletes or mutates the source
-- contact, so there is nothing to snapshot beyond what moved:
-- the channel, its previous/new owner, and any conversations
-- that moved along with it.
--
-- Writes are reserved to the link_contact_channel SECURITY
-- DEFINER RPC, which bypasses RLS entirely — so the policy
-- below only ever needs to authorize SELECT, and only SELECT
-- is granted to authenticated.
-- =========================================================

CREATE TABLE contact_link_history (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id           uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contact_channel_id     uuid NOT NULL REFERENCES contact_channels(id) ON DELETE CASCADE,
  provider               text NOT NULL,
  source_contact_id      uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  target_contact_id      uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  moved_conversation_ids uuid[] NOT NULL DEFAULT '{}',
  linked_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON contact_link_history (workspace_id, target_contact_id);
CREATE INDEX ON contact_link_history (source_contact_id);

ALTER TABLE contact_link_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_isolation" ON contact_link_history
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

GRANT SELECT ON contact_link_history TO authenticated;
