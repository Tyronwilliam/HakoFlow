-- =========================================================
-- RPC: merge_contacts
--
-- Level 3 execution — only ever called from an explicit user
-- action (never from a cron job or automatically past a score
-- threshold). Reassigns everything from the source contact onto
-- the target contact, then deletes the source.
--
-- RLS is not inherited by SECURITY DEFINER functions, so
-- workspace ownership is re-checked explicitly for both
-- contacts, and merging across two different workspaces is
-- rejected outright.
-- =========================================================

CREATE OR REPLACE FUNCTION public.merge_contacts(
  p_target_contact_id uuid,
  p_source_contact_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_workspace_id uuid;
  v_source_workspace_id uuid;
BEGIN
  IF p_target_contact_id = p_source_contact_id THEN
    RAISE EXCEPTION 'Cannot merge a contact into itself';
  END IF;

  SELECT c.workspace_id INTO v_target_workspace_id
  FROM contacts c
  JOIN workspaces w ON w.id = c.workspace_id
  WHERE c.id = p_target_contact_id AND w.user_id = auth.uid();

  SELECT c.workspace_id INTO v_source_workspace_id
  FROM contacts c
  JOIN workspaces w ON w.id = c.workspace_id
  WHERE c.id = p_source_contact_id AND w.user_id = auth.uid();

  IF v_target_workspace_id IS NULL OR v_source_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Contact not found or not accessible';
  END IF;

  IF v_target_workspace_id <> v_source_workspace_id THEN
    RAISE EXCEPTION 'Cannot merge contacts across different workspaces';
  END IF;

  UPDATE contact_channels
  SET contact_id = p_target_contact_id
  WHERE contact_id = p_source_contact_id;

  UPDATE conversations
  SET contact_id = p_target_contact_id
  WHERE contact_id = p_source_contact_id;

  UPDATE contacts target
  SET
    tags       = (SELECT array_agg(DISTINCT tag) FROM unnest(target.tags || source.tags) AS tag),
    notes      = NULLIF(trim(both E'\n' from concat_ws(E'\n\n', target.notes, source.notes)), ''),
    updated_at = now()
  FROM contacts source
  WHERE target.id = p_target_contact_id
    AND source.id = p_source_contact_id;

  DELETE FROM contacts WHERE id = p_source_contact_id;

  RETURN p_target_contact_id;
END;
$$;

REVOKE ALL ON FUNCTION public.merge_contacts(uuid, uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.merge_contacts(uuid, uuid) TO authenticated;
