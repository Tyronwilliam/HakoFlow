-- =========================================================
-- RPC: list_contact_conversation_groups
--
-- Inbox list, two-level grouping: instead of one row per
-- conversation, return one row per contact — with all of that
-- contact's conversations (one per channel/native identity)
-- nested as a jsonb array. A conversation with no resolved
-- contact keeps its own group (group_key = conversation.id) so
-- it is never dropped from the list.
--
-- Pagination/order matches the previous flat query: sorted by
-- most recent activity across the group's conversations,
-- range(p_start_index, p_stop_index) inclusive (same semantics
-- as supabase-js .range()).
--
-- RLS is not inherited by SECURITY DEFINER functions, so
-- workspace ownership is re-checked explicitly.
-- =========================================================

CREATE OR REPLACE FUNCTION public.list_contact_conversation_groups(
  p_workspace_id uuid,
  p_start_index  integer DEFAULT 0,
  p_stop_index   integer DEFAULT 19
)
RETURNS TABLE (
  group_key       uuid,
  contact_name    text,
  total_unread    bigint,
  last_message_at timestamptz,
  channels        text[],
  conversations   jsonb
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
      SUM(unread_count) AS total_unread,
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
  SELECT group_key, contact_name, total_unread, last_message_at, channels, conversations
  FROM grouped
  ORDER BY last_message_at DESC NULLS LAST
  OFFSET GREATEST(0, p_start_index)
  LIMIT  GREATEST(0, p_stop_index - p_start_index + 1);
$$;

REVOKE ALL ON FUNCTION public.list_contact_conversation_groups(uuid, integer, integer) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.list_contact_conversation_groups(uuid, integer, integer) TO authenticated;
