-- =========================================================
-- RPC: group_conversations_under_contact
--
-- Atomically attaches 1-3 conversations (one per provider) to a
-- single contact — creating that contact if needed. Used by the
-- manual "group under a contact" wizard (thread view).
--
-- SECURITY DEFINER so it can create contacts/contact_channels
-- rows and update conversations in one transaction; RLS is NOT
-- inherited by SECURITY DEFINER functions, so workspace ownership
-- is re-checked explicitly (same pattern as get_decrypted_messages).
--
-- Row locks (FOR UPDATE) on the target conversation and on the
-- (workspace_id, provider, external_id) contact_channels lookup
-- close the race window where two concurrent submissions could
-- both pass the "identifier not taken" check before either writes.
--
-- p_target_contact_id/p_new_contact_name are `text`, not `uuid`,
-- with an empty string as the "unset" sentinel (rather than NULL):
-- `supabase gen types` always types RPC args as non-nullable, so a
-- NULL-based signature would force a lying cast on the TS side just
-- to satisfy the generated type. Empty string keeps both the generated
-- type and the call site honest.
-- =========================================================

CREATE OR REPLACE FUNCTION public.group_conversations_under_contact(
  p_workspace_id      uuid,
  p_target_contact_id text,       -- '' => create a new contact
  p_new_contact_name  text,       -- required iff p_target_contact_id = ''
  p_conversation_ids  uuid[]      -- 1..3 conversation ids to attach
)
RETURNS uuid                       -- the resolved/created contact_id
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contact_id  uuid;
  v_conv_id     uuid;
  v_provider    text;
  v_external_id text;
  v_conv_ws     uuid;
  v_existing    uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM workspaces WHERE id = p_workspace_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_target_contact_id IS NOT NULL AND p_target_contact_id <> '' THEN
    SELECT id INTO v_contact_id FROM contacts
      WHERE id = p_target_contact_id::uuid AND workspace_id = p_workspace_id;
    IF v_contact_id IS NULL THEN
      RAISE EXCEPTION 'Contact not found in this workspace.';
    END IF;
  ELSE
    IF p_new_contact_name IS NULL OR btrim(p_new_contact_name) = '' THEN
      RAISE EXCEPTION 'A name is required to create a new contact.';
    END IF;
    INSERT INTO contacts (workspace_id, name)
      VALUES (p_workspace_id, btrim(p_new_contact_name))
      RETURNING id INTO v_contact_id;
  END IF;

  FOREACH v_conv_id IN ARRAY p_conversation_ids LOOP
    SELECT workspace_id, primary_channel, external_id
      INTO v_conv_ws, v_provider, v_external_id
      FROM conversations WHERE id = v_conv_id FOR UPDATE;

    IF v_conv_ws IS NULL OR v_conv_ws <> p_workspace_id THEN
      RAISE EXCEPTION 'Conversation not found in this workspace.';
    END IF;
    IF v_external_id IS NULL THEN
      RAISE EXCEPTION 'This conversation has no external identifier and cannot be linked.';
    END IF;

    SELECT contact_id INTO v_existing FROM contact_channels
      WHERE workspace_id = p_workspace_id AND provider = v_provider AND external_id = v_external_id
      FOR UPDATE;

    IF v_existing IS NULL THEN
      INSERT INTO contact_channels (contact_id, workspace_id, provider, external_id)
        VALUES (v_contact_id, p_workspace_id, v_provider, v_external_id);
    ELSIF v_existing <> v_contact_id THEN
      RAISE EXCEPTION 'This % account is already linked to another contact.', v_provider;
    END IF;

    UPDATE conversations SET contact_id = v_contact_id WHERE id = v_conv_id;
  END LOOP;

  RETURN v_contact_id;
END;
$$;

REVOKE ALL ON FUNCTION public.group_conversations_under_contact(uuid, text, text, uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.group_conversations_under_contact(uuid, text, text, uuid[]) TO authenticated;
