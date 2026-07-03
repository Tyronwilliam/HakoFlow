-- =========================================================
-- get_decrypted_messages: add pagination/ordering
--
-- src/app/api/messages/[id]/route.ts calls this RPC with
-- p_start/p_stop/p_order, but only the original single-argument
-- overload (p_conversation_id uuid) was ever applied to this
-- project — that call has been failing with "no function matches
-- the given name and argument types" until this migration runs.
--
-- DROP the old overload first: CREATE OR REPLACE with a different
-- argument list creates a second overload instead of replacing the
-- first, which would leave a dead/insecure single-arg version behind.
-- =========================================================

DROP FUNCTION IF EXISTS public.get_decrypted_messages(uuid);

CREATE OR REPLACE FUNCTION public.get_decrypted_messages(
  p_conversation_id uuid,
  p_start           integer DEFAULT 0,
  p_stop            integer DEFAULT 50,
  p_order           text    DEFAULT 'asc'
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
  ORDER BY
    CASE WHEN p_order = 'asc'  THEN m.sent_at END ASC,
    CASE WHEN p_order = 'desc' THEN m.sent_at END DESC
  LIMIT  GREATEST(0, p_stop - p_start)
  OFFSET GREATEST(0, p_start);
$$;

-- Strip the implicit PUBLIC grant that CREATE FUNCTION adds,
-- then allow only authenticated users to call this function.
REVOKE ALL ON FUNCTION public.get_decrypted_messages(uuid, integer, integer, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_decrypted_messages(uuid, integer, integer, text) TO authenticated;
