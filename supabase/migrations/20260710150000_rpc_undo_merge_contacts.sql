-- =========================================================
-- HAK-79: undo_merge_contacts (5/7 of the HAK-71 "annuler une
-- fusion" epic) — the backend core of undo.
--
-- Given a contact_merges row (HAK-76), written by merge_contacts
-- (HAK-77):
--   1. re-check workspace ownership, same pattern as merge_contacts
--   2. refuse if this merge was already undone
--   3. refuse (naming the offending element) if any moved
--      contact_channel/conversation no longer belongs to
--      target_contact_id — it was reassigned elsewhere since the
--      merge (manual relink, or a later merge). All-or-nothing:
--      no partial revert, see HAK-71.
--   4. move contact_channels/conversations back to the source
--   5. diff tags: remove from target exactly what the source
--      contributed and that wasn't already on the target before
--      the merge — never touch tags added on target since.
--   6. diff notes: strip exactly the block the merge appended
--      (target_notes_before + separator + source notes), but
--      only if that block is still an untouched prefix of the
--      target's current notes. If the target's notes were edited
--      in a way that breaks that prefix (reformulated, reordered,
--      cleared), block the whole undo instead of guessing —
--      same all-or-nothing philosophy as the channels/conversations
--      check above (decision from the 2026-07-08 review).
--   7. un-soft-delete the source contact
--   8. stamp contact_merges.undone_at
--   9. if the merge came from a suggestion, put it back to
--      'pending' so it can be reconsidered
--
-- Note: the source contact's tags/notes are read as they stand
-- now, not from a snapshot — merge_contacts never touched them
-- (only deleted_at was set), so they're still exactly what they
-- were at merge time.
-- =========================================================

CREATE OR REPLACE FUNCTION public.undo_merge_contacts(
  p_merge_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_merge               contact_merges%ROWTYPE;
  v_workspace_id        uuid;
  v_channel_id          uuid;
  v_conversation_id     uuid;
  v_source_tags         text[];
  v_source_notes        text;
  v_tags_to_remove      text[];
  v_expected_notes_block text;
  v_target_notes_now    text;
  v_notes_after          text;
BEGIN
  SELECT * INTO v_merge FROM contact_merges WHERE id = p_merge_id;

  IF v_merge.id IS NULL THEN
    RAISE EXCEPTION 'Merge history entry not found';
  END IF;

  SELECT w.id INTO v_workspace_id
  FROM workspaces w
  WHERE w.id = v_merge.workspace_id AND w.user_id = auth.uid();

  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Merge history entry not accessible';
  END IF;

  IF v_merge.undone_at IS NOT NULL THEN
    RAISE EXCEPTION 'Merge % has already been undone', p_merge_id;
  END IF;

  FOREACH v_channel_id IN ARRAY v_merge.moved_contact_channel_ids LOOP
    IF NOT EXISTS (
      SELECT 1 FROM contact_channels
      WHERE id = v_channel_id AND contact_id = v_merge.target_contact_id
    ) THEN
      RAISE EXCEPTION 'Contact channel % is no longer on the target contact — it moved elsewhere since this merge, undo is blocked', v_channel_id;
    END IF;
  END LOOP;

  FOREACH v_conversation_id IN ARRAY v_merge.moved_conversation_ids LOOP
    IF NOT EXISTS (
      SELECT 1 FROM conversations
      WHERE id = v_conversation_id AND contact_id = v_merge.target_contact_id
    ) THEN
      RAISE EXCEPTION 'Conversation % is no longer on the target contact — it moved elsewhere since this merge, undo is blocked', v_conversation_id;
    END IF;
  END LOOP;

  SELECT COALESCE(tags, '{}'), notes INTO v_source_tags, v_source_notes
  FROM contacts WHERE id = v_merge.source_contact_id;

  SELECT ARRAY(
    SELECT unnest(v_source_tags)
    EXCEPT
    SELECT unnest(v_merge.target_tags_before)
  ) INTO v_tags_to_remove;

  v_expected_notes_block := NULLIF(trim(both E'\n' from concat_ws(E'\n\n', v_merge.target_notes_before, v_source_notes)), '');

  SELECT notes INTO v_target_notes_now FROM contacts WHERE id = v_merge.target_contact_id;

  IF v_expected_notes_block IS NULL THEN
    -- the merge added no notes fragment (source had none) — nothing to undo
    v_notes_after := v_target_notes_now;
  ELSIF v_target_notes_now = v_expected_notes_block THEN
    v_notes_after := v_merge.target_notes_before;
  ELSIF starts_with(v_target_notes_now, v_expected_notes_block) THEN
    -- preserve whatever the user appended on target after the merge
    v_notes_after := NULLIF(trim(both E'\n' from
      COALESCE(v_merge.target_notes_before, '') || substring(v_target_notes_now from length(v_expected_notes_block) + 1)
    ), '');
  ELSE
    RAISE EXCEPTION 'Target contact notes were edited in a way that no longer matches the merge history — undo is blocked to avoid corrupting notes';
  END IF;

  UPDATE contact_channels
  SET contact_id = v_merge.source_contact_id
  WHERE id = ANY(v_merge.moved_contact_channel_ids);

  UPDATE conversations
  SET contact_id = v_merge.source_contact_id
  WHERE id = ANY(v_merge.moved_conversation_ids);

  UPDATE contacts
  SET
    tags = (
      SELECT COALESCE(array_agg(tag), '{}')
      FROM unnest(tags) AS tag
      WHERE tag <> ALL(v_tags_to_remove)
    ),
    notes      = v_notes_after,
    updated_at = now()
  WHERE id = v_merge.target_contact_id;

  UPDATE contacts
  SET deleted_at = NULL
  WHERE id = v_merge.source_contact_id;

  UPDATE contact_merges
  SET undone_at = now()
  WHERE id = p_merge_id;

  IF v_merge.merge_suggestion_id IS NOT NULL THEN
    UPDATE merge_suggestions
    SET status = 'pending', decided_at = NULL
    WHERE id = v_merge.merge_suggestion_id;
  END IF;

  RETURN v_merge.source_contact_id;
END;
$$;

REVOKE ALL ON FUNCTION public.undo_merge_contacts(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.undo_merge_contacts(uuid) TO authenticated;
