-- =========================================================
-- RPC: link_contact_channel
--
-- Level 3 execution, manual variant — the user explicitly picks
-- one native channel (e.g. contact A's Gmail) and attaches it to
-- a different contact (contact B). Unlike merge_contacts, this
-- never deletes the source contact, even if it ends up with zero
-- channels left: the user asked for the source to stay around
-- rather than be cleaned up automatically.
--
-- Because a channel's future messages resolve through
-- upsert_contact_channel via (workspace_id, provider,
-- external_id) — see 20260706140500 — reassigning the
-- contact_channels row here is enough for every future
-- conversation on that identity to keep landing on the target
-- contact.
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
  v_source_contact_id  uuid;
  v_provider           text;
  v_channel_workspace   uuid;
  v_target_workspace_id uuid;
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

  UPDATE contact_channels
  SET contact_id = p_target_contact_id
  WHERE id = p_contact_channel_id;

  UPDATE conversations
  SET contact_id = p_target_contact_id
  WHERE contact_id = v_source_contact_id
    AND primary_channel = v_provider;

  RETURN p_target_contact_id;
END;
$$;

REVOKE ALL ON FUNCTION public.link_contact_channel(uuid, uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.link_contact_channel(uuid, uuid) TO authenticated;
