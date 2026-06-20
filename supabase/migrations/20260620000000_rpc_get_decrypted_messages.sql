-- =========================================================
-- RPC: get_decrypted_messages
--
-- SECURITY DEFINER so the function runs with the privileges
-- needed to read vault.decrypted_secrets — the caller (even
-- the authenticated role) never sees the key or the raw bytea.
--
-- RLS is NOT inherited by SECURITY DEFINER functions, so the
-- workspace_isolation policy is re-implemented explicitly in
-- the WHERE clause:
--   messages.conversation_id
--     → conversations.workspace_id
--     → workspaces.user_id = auth.uid()
--
-- Key storage: Supabase Vault, secret name 'hubdesk_messages_key'
-- Encryption:  pgp_sym_encrypt / pgp_sym_decrypt (pgcrypto)
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_decrypted_messages(
  p_conversation_id uuid,
  p_start           integer DEFAULT 0,
  p_stop            integer DEFAULT 50
)
RETURNS TABLE (
  id              uuid,
  conversation_id uuid,
  external_id     text,
  channel         text,
  direction       text,
  content         text,        -- decrypted plaintext (was bytea)
  status          text,
  attachment_urls text[],
  sent_at         timestamptz,
  read_at         timestamptz,
  expires_at      timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
-- Narrow search_path prevents search-path hijacking attacks
SET search_path = public
AS $$
  SELECT
    m.id,
    m.conversation_id,
    m.external_id,
    m.channel,
    m.direction,
    extensions.pgp_sym_decrypt(
      m.content,
      (SELECT decrypted_secret
       FROM vault.decrypted_secrets
       WHERE name = 'hubdesk_messages_key'
       LIMIT 1)
    )::text                     AS content,
    m.status,
    m.attachment_urls,
    m.sent_at,
    m.read_at,
    m.expires_at
  FROM        messages      m
  JOIN        conversations conv ON conv.id = m.conversation_id
  JOIN        workspaces    w    ON w.id    = conv.workspace_id
  WHERE m.conversation_id = p_conversation_id
    AND w.user_id = auth.uid()
  ORDER BY m.sent_at ASC
  LIMIT  GREATEST(0, p_stop - p_start)
  OFFSET GREATEST(0, p_start);
$$;

-- Strip the implicit PUBLIC grant that CREATE FUNCTION adds,
-- then allow only authenticated users to call this function.
REVOKE ALL ON FUNCTION public.get_decrypted_messages(uuid, integer, integer) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_decrypted_messages(uuid, integer, integer) TO authenticated;
