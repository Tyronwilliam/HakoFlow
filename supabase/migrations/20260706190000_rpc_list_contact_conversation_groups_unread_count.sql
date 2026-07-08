-- =========================================================
-- RPC: list_contact_conversation_groups — unread semantics fix
--
-- `total_unread` used to SUM(unread_count) across a contact's
-- conversations (message-level count), while the sidebar badge
-- (src/hooks/use-unread-count.ts) counts the number of
-- conversations that have at least one unread message. Two
-- different metrics under similar labels confused users (e.g.
-- "2 messages non lus" on a contact who only has 1 unread
-- thread). Both now count unread *conversations*, matching the
-- sidebar.
--
-- Return type changes (column renamed), so the function must be
-- dropped and recreated rather than CREATE OR REPLACE'd.
-- =========================================================

DROP FUNCTION IF EXISTS public.list_contact_conversation_groups(uuid, integer, integer);

CREATE FUNCTION public.list_contact_conversation_groups(
  p_workspace_id uuid,
  p_start_index  integer DEFAULT 0,
  p_stop_index   integer DEFAULT 19
)
RETURNS TABLE (
  group_key               uuid,
  contact_name            text,
  unread_conversations    bigint,
  last_message_at         timestamptz,
  channels                text[],
  conversations           jsonb
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  WITH conv AS (
    SELECT
      c.id,
      COALESCE(c.contact_id, c.id) AS group_key,
      c.primary_channel,
      c.external_id,
      c.last_message_at,
      c.last_message_preview,
      c.unread_count,
      c.is_pinned,
      c.is_starred,
      COALESCE(ct.name, 'Inconnu') AS contact_name,
      cc.display_handle AS contact_handle
    FROM conversations c
    JOIN workspaces w ON w.id = c.workspace_id
    LEFT JOIN contacts ct ON ct.id = c.contact_id
    LEFT JOIN contact_channels cc
      ON cc.contact_id = c.contact_id
     AND cc.provider = c.primary_channel
     AND cc.workspace_id = c.workspace_id
    WHERE c.workspace_id = p_workspace_id
      AND w.user_id = auth.uid()
      AND c.is_archived = false
  ),
  grouped AS (
    SELECT
      group_key,
      MAX(contact_name) AS contact_name,
      COUNT(*) FILTER (WHERE unread_count > 0) AS unread_conversations,
      MAX(last_message_at) AS last_message_at,
      ARRAY_AGG(DISTINCT primary_channel) AS channels,
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'id', id,
          'primary_channel', primary_channel,
          'external_id', external_id,
          'last_message_at', last_message_at,
          'last_message_preview', last_message_preview,
          'unread_count', unread_count,
          'is_pinned', is_pinned,
          'is_starred', is_starred,
          'contact_handle', contact_handle
        )
        ORDER BY last_message_at DESC NULLS LAST
      ) AS conversations
    FROM conv
    GROUP BY group_key
  )
  SELECT group_key, contact_name, unread_conversations, last_message_at, channels, conversations
  FROM grouped
  ORDER BY last_message_at DESC NULLS LAST
  OFFSET GREATEST(0, p_start_index)
  LIMIT  GREATEST(0, p_stop_index - p_start_index + 1);
$$;

REVOKE ALL ON FUNCTION public.list_contact_conversation_groups(uuid, integer, integer) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.list_contact_conversation_groups(uuid, integer, integer) TO authenticated;
