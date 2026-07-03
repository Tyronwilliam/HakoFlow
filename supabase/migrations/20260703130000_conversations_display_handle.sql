-- =========================================================
-- conversations.display_handle
--
-- Unlinked conversations (contact_id IS NULL) have no
-- contact_channels row yet, so there was no human-readable
-- identifier (email/username) available for them anywhere —
-- only the opaque provider external_id. This column stores
-- that handle directly on the conversation so the "group under
-- a contact" wizard can label per-provider conversation options
-- with something a user can actually recognize.
--
-- group_conversations_under_contact now carries this value into
-- the contact_channels row it creates, so the handle keeps being
-- available (as contact_channels.display_handle) after linking.
-- =========================================================

ALTER TABLE conversations ADD COLUMN display_handle text;

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
  v_contact_id     uuid;
  v_conv_id        uuid;
  v_provider       text;
  v_external_id    text;
  v_display_handle text;
  v_conv_ws        uuid;
  v_existing       uuid;
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
    SELECT workspace_id, primary_channel, external_id, display_handle
      INTO v_conv_ws, v_provider, v_external_id, v_display_handle
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
      INSERT INTO contact_channels (contact_id, workspace_id, provider, external_id, display_handle)
        VALUES (v_contact_id, p_workspace_id, v_provider, v_external_id, v_display_handle);
    ELSIF v_existing <> v_contact_id THEN
      RAISE EXCEPTION 'This % account is already linked to another contact.', v_provider;
    END IF;

    UPDATE conversations SET contact_id = v_contact_id WHERE id = v_conv_id;
  END LOOP;

  RETURN v_contact_id;
END;
$$;
