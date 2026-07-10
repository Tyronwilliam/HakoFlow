-- =========================================================
-- HAK-75: foundation for "annuler une fusion" (undo merge,
-- HAK-71 epic). Adds a nullable deleted_at column to contacts
-- and introduces contacts_active as the single centralized
-- read point that excludes soft-deleted contacts from normal
-- app reads.
--
-- Design decision (documented per ticket requirement — relied
-- on by future tickets, do not change without updating them):
--   - The `workspace_isolation` RLS policy on `contacts` is
--     left UNCHANGED (still scoped only by workspace_id, no
--     deleted_at filter). We do NOT split it into two
--     policies: in this schema there is exactly one
--     authenticated actor per workspace (the owner), so a
--     second "restoration-eligible" policy would just
--     duplicate the same qual for no additional authorization
--     value.
--   - `contacts_active` is the one centralized filter point.
--     All normal app code (hooks/routes/selectors) must read
--     through it, not through `contacts` directly.
--   - Any feature that legitimately needs to see soft-deleted
--     contacts (HAK-78's merge-history read, surfaced by
--     HAK-80's UI) reads the base `contacts` table directly;
--     the unmodified RLS policy already permits this for the
--     owning workspace user.
--   - SECURITY DEFINER RPCs bypass RLS entirely (never inherit
--     it) and must filter deleted_at themselves. This
--     migration fixes the two read-only RPCs below.
--     merge_contacts is intentionally NOT touched here — that
--     is HAK-77's job (soft-delete the source instead of
--     DELETE).
-- =========================================================

ALTER TABLE contacts
  ADD COLUMN deleted_at timestamptz NULL;

CREATE VIEW contacts_active
  WITH (security_invoker = true) AS
  SELECT *
  FROM contacts
  WHERE deleted_at IS NULL;

GRANT SELECT ON contacts_active TO authenticated;

-- ---------------------------------------------------------
-- generate_merge_suggestions: exclude soft-deleted contacts on
-- both sides of the self-join so the nightly cron never
-- suggests merging an already-absorbed (soft-deleted) contact.
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_merge_suggestions(
  p_workspace_id   uuid,
  p_min_similarity real DEFAULT 0.4
)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH candidates AS (
    SELECT
      a.id AS contact_a_id,
      b.id AS contact_b_id,
      similarity(a.name, b.name) AS score
    FROM contacts a
    JOIN contacts b ON b.workspace_id = a.workspace_id AND a.id < b.id
    WHERE a.workspace_id = p_workspace_id
      AND a.deleted_at IS NULL
      AND b.deleted_at IS NULL
      AND similarity(a.name, b.name) >= p_min_similarity
  ), inserted AS (
    INSERT INTO merge_suggestions (workspace_id, contact_a_id, contact_b_id, score, reason)
    SELECT p_workspace_id, contact_a_id, contact_b_id, score, 'name_similarity'
    FROM candidates
    ON CONFLICT (contact_a_id, contact_b_id) DO UPDATE
      SET score = EXCLUDED.score,
          reason = EXCLUDED.reason
      WHERE merge_suggestions.status = 'pending'
    RETURNING 1
  )
  SELECT count(*)::integer FROM inserted;
$$;

-- ---------------------------------------------------------
-- list_contact_conversation_groups: exclude a soft-deleted
-- contact from the LEFT JOIN via the ON clause (not WHERE), so
-- a conversation whose contact was soft-deleted still appears,
-- with contact_name falling back to 'Inconnu' exactly like a
-- NULL contact_id.
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.list_contact_conversation_groups(
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
    LEFT JOIN contacts ct ON ct.id = c.contact_id AND ct.deleted_at IS NULL
    LEFT JOIN contact_channels cc
      ON cc.contact_id = c.contact_id
     AND cc.provider = c.primary_channel
     AND cc.workspace_id = c.workspace_id
     AND cc.external_id = c.external_id
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
