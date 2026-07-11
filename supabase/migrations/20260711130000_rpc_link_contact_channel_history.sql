-- =========================================================
-- link_contact_channel now writes a contact_link_history row
-- (20260711120000), mirroring what HAK-77 did for merge_contacts.
--
-- Signature is unchanged (uuid, uuid), so CREATE OR REPLACE is
-- enough — no overload/drop needed like the merge_contacts case.
-- =========================================================

CREATE OR REPLACE FUNCTION public.link_contact_channel(
  p_contact_channel_id uuid,
  p_target_contact_id  uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_source_contact_id   uuid;
  v_provider            text;
  v_channel_workspace   uuid;
  v_target_workspace_id uuid;
  v_moved_conversation_ids uuid[];
BEGIN
  SELECT cc.contact_id, cc.provider, cc.workspace_id
  INTO v_source_contact_id, v_provider, v_channel_workspace
  FROM contact_channels cc
  JOIN workspaces w ON w.id = cc.workspace_id
  WHERE cc.id = p_contact_channel_id AND w.user_id = auth.uid();

  IF v_source_contact_id IS NULL THEN
    RAISE EXCEPTION 'Contact channel not found or not accessible';
  END IF;

  SELECT c.workspace_id INTO v_target_workspace_id
  FROM contacts c
  JOIN workspaces w ON w.id = c.workspace_id
  WHERE c.id = p_target_contact_id AND w.user_id = auth.uid();

  IF v_target_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Target contact not found or not accessible';
  END IF;

  IF v_channel_workspace <> v_target_workspace_id THEN
    RAISE EXCEPTION 'Cannot link a channel across different workspaces';
  END IF;

  IF v_source_contact_id = p_target_contact_id THEN
    RAISE EXCEPTION 'Contact channel already belongs to this contact';
  END IF;

  SELECT COALESCE(array_agg(id), '{}') INTO v_moved_conversation_ids
  FROM conversations
  WHERE contact_id = v_source_contact_id AND primary_channel = v_provider;

  UPDATE contact_channels
  SET contact_id = p_target_contact_id
  WHERE id = p_contact_channel_id;

  UPDATE conversations
  SET contact_id = p_target_contact_id
  WHERE contact_id = v_source_contact_id
    AND primary_channel = v_provider;

  INSERT INTO contact_link_history (
    workspace_id,
    contact_channel_id,
    provider,
    source_contact_id,
    target_contact_id,
    moved_conversation_ids,
    linked_at
  ) VALUES (
    v_target_workspace_id,
    p_contact_channel_id,
    v_provider,
    v_source_contact_id,
    p_target_contact_id,
    v_moved_conversation_ids,
    now()
  );

  RETURN p_target_contact_id;
END;
$$;

REVOKE ALL ON FUNCTION public.link_contact_channel(uuid, uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.link_contact_channel(uuid, uuid) TO authenticated;
