-- =========================================================
-- contact_link_history becomes reversible, mirroring the
-- contact_merges undo flow (HAK-76/77/79).
--
-- Adds undone_at (same role as contact_merges.undone_at) and
-- the undo_link_contact_channel RPC. Simpler than
-- undo_merge_contacts: linking never touches tags/notes or
-- soft-deletes the source contact, so undo only needs to move
-- the channel and its conversations back — guarded by the same
-- all-or-nothing "still on the target contact" check.
-- =========================================================

ALTER TABLE contact_link_history ADD COLUMN undone_at timestamptz;

CREATE OR REPLACE FUNCTION public.undo_link_contact_channel(
  p_link_history_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link            contact_link_history%ROWTYPE;
  v_workspace_id    uuid;
  v_conversation_id uuid;
BEGIN
  SELECT * INTO v_link FROM contact_link_history WHERE id = p_link_history_id;

  IF v_link.id IS NULL THEN
    RAISE EXCEPTION 'Link history entry not found';
  END IF;

  SELECT w.id INTO v_workspace_id
  FROM workspaces w
  WHERE w.id = v_link.workspace_id AND w.user_id = auth.uid();

  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Link history entry not accessible';
  END IF;

  IF v_link.undone_at IS NOT NULL THEN
    RAISE EXCEPTION 'Link % has already been undone', p_link_history_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM contact_channels
    WHERE id = v_link.contact_channel_id AND contact_id = v_link.target_contact_id
  ) THEN
    RAISE EXCEPTION 'Contact channel is no longer on the target contact — it moved elsewhere since this link, undo is blocked';
  END IF;

  FOREACH v_conversation_id IN ARRAY v_link.moved_conversation_ids LOOP
    IF NOT EXISTS (
      SELECT 1 FROM conversations
      WHERE id = v_conversation_id AND contact_id = v_link.target_contact_id
    ) THEN
      RAISE EXCEPTION 'Conversation % is no longer on the target contact — it moved elsewhere since this link, undo is blocked', v_conversation_id;
    END IF;
  END LOOP;

  UPDATE contact_channels
  SET contact_id = v_link.source_contact_id
  WHERE id = v_link.contact_channel_id;

  UPDATE conversations
  SET contact_id = v_link.source_contact_id
  WHERE id = ANY(v_link.moved_conversation_ids);

  UPDATE contact_link_history
  SET undone_at = now()
  WHERE id = p_link_history_id;

  RETURN v_link.source_contact_id;
END;
$$;

REVOKE ALL ON FUNCTION public.undo_link_contact_channel(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.undo_link_contact_channel(uuid) TO authenticated;
