-- =========================================================
-- HAK-77: merge_contacts becomes reversible (3/7 of the
-- HAK-71 "annuler une fusion" epic).
--
-- Same reassignment/merge mechanics as before, plus:
--   1. capture what's about to move/change before doing it
--   2. write a contact_merges row (HAK-76) with that capture
--   3. soft-delete the source (HAK-75) instead of DELETE
--
-- The previous DELETE cascade-deleted merge_suggestions
-- referencing the source contact (ON DELETE CASCADE on
-- contact_a_id/contact_b_id). A soft-delete no longer does
-- that, so this migration also takes over suggestion
-- lifecycle explicitly:
--   - p_merge_suggestion_id (new, optional): the suggestion
--     being accepted, if any, is marked 'merged' — the
--     call site never did this before, it relied entirely on
--     the cascade delete, which is now gone.
--   - any other still-'pending' suggestion referencing the
--     source contact is marked 'ignored', since that contact
--     can no longer be a valid merge candidate once absorbed.
--
-- Ownership re-checks now also require deleted_at IS NULL on
-- both sides, so a stale suggestion or UI state can't merge
-- an already-soft-deleted contact a second time.
-- =========================================================

-- Adding p_merge_suggestion_id changes the argument list, so
-- CREATE OR REPLACE below creates a second overload instead of
-- replacing the original (uuid, uuid) function — drop it first,
-- otherwise the old irreversible (hard DELETE) version stays
-- callable side by side with the new one.
DROP FUNCTION IF EXISTS public.merge_contacts(uuid, uuid);

CREATE OR REPLACE FUNCTION public.merge_contacts(
  p_target_contact_id uuid,
  p_source_contact_id uuid,
  p_merge_suggestion_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_workspace_id       uuid;
  v_source_workspace_id       uuid;
  v_moved_contact_channel_ids uuid[];
  v_moved_conversation_ids    uuid[];
  v_target_tags_before        text[];
  v_target_notes_before       text;
BEGIN
  IF p_target_contact_id = p_source_contact_id THEN
    RAISE EXCEPTION 'Cannot merge a contact into itself';
  END IF;

  SELECT c.workspace_id INTO v_target_workspace_id
  FROM contacts c
  JOIN workspaces w ON w.id = c.workspace_id
  WHERE c.id = p_target_contact_id AND w.user_id = auth.uid() AND c.deleted_at IS NULL;

  SELECT c.workspace_id INTO v_source_workspace_id
  FROM contacts c
  JOIN workspaces w ON w.id = c.workspace_id
  WHERE c.id = p_source_contact_id AND w.user_id = auth.uid() AND c.deleted_at IS NULL;

  IF v_target_workspace_id IS NULL OR v_source_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Contact not found or not accessible';
  END IF;

  IF v_target_workspace_id <> v_source_workspace_id THEN
    RAISE EXCEPTION 'Cannot merge contacts across different workspaces';
  END IF;

  SELECT COALESCE(array_agg(id), '{}') INTO v_moved_contact_channel_ids
  FROM contact_channels WHERE contact_id = p_source_contact_id;

  SELECT COALESCE(array_agg(id), '{}') INTO v_moved_conversation_ids
  FROM conversations WHERE contact_id = p_source_contact_id;

  SELECT COALESCE(tags, '{}'), notes INTO v_target_tags_before, v_target_notes_before
  FROM contacts WHERE id = p_target_contact_id;

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

  UPDATE contacts
  SET deleted_at = now()
  WHERE id = p_source_contact_id;

  INSERT INTO contact_merges (
    workspace_id,
    merge_suggestion_id,
    target_contact_id,
    source_contact_id,
    moved_contact_channel_ids,
    moved_conversation_ids,
    target_tags_before,
    target_notes_before,
    merged_at
  ) VALUES (
    v_target_workspace_id,
    p_merge_suggestion_id,
    p_target_contact_id,
    p_source_contact_id,
    v_moved_contact_channel_ids,
    v_moved_conversation_ids,
    v_target_tags_before,
    v_target_notes_before,
    now()
  );

  IF p_merge_suggestion_id IS NOT NULL THEN
    UPDATE merge_suggestions
    SET status = 'merged', decided_at = now()
    WHERE id = p_merge_suggestion_id;
  END IF;

  UPDATE merge_suggestions
  SET status = 'ignored', decided_at = now()
  WHERE status = 'pending'
    AND (contact_a_id = p_source_contact_id OR contact_b_id = p_source_contact_id);

  RETURN p_target_contact_id;
END;
$$;

REVOKE ALL ON FUNCTION public.merge_contacts(uuid, uuid, uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.merge_contacts(uuid, uuid, uuid) TO authenticated;
