-- =========================================================
-- RPC: generate_merge_suggestions
--
-- Level 3 candidate detection — a weak heuristic (name
-- similarity via pg_trgm) that only ever inserts *suggestions*,
-- never merges anything itself.
--
-- Re-running is safe: an existing 'pending' suggestion gets its
-- score/reason refreshed, but a pair the user already decided on
-- ('merged' — though by then one of the two contacts no longer
-- exists — or 'ignored') is left untouched, so "ne plus suggérer
-- cette paire" sticks.
--
-- Additional heuristics (email domain vs. Slack workspace name,
-- normalized phone number match) are intentionally left out of
-- this first pass — they need data (Slack team name, phone
-- fields) that isn't modeled yet.
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

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

REVOKE ALL ON FUNCTION public.generate_merge_suggestions(uuid, real) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.generate_merge_suggestions(uuid, real) TO authenticated, service_role;

-- ---------------------------------------------------------
-- Nightly batch run across every workspace, mirroring the
-- delete-expired-messages job in 20260614120002.
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.run_merge_suggestions_for_all_workspaces()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id uuid;
BEGIN
  FOR v_workspace_id IN SELECT id FROM workspaces LOOP
    PERFORM public.generate_merge_suggestions(v_workspace_id);
  END LOOP;
END;
$$;

SELECT cron.schedule(
  'generate-merge-suggestions',
  '0 3 * * *',
  $$ SELECT public.run_merge_suggestions_for_all_workspaces() $$
);
