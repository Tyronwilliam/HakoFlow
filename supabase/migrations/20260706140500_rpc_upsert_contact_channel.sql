-- =========================================================
-- RPC: upsert_contact_channel
--
-- Level 2 (auto-grouping, mechanical — no user decision):
-- given a native channel identity (workspace_id, provider,
-- external_id), return the contact it belongs to — reusing an
-- existing contact_channel when the identity was already seen,
-- or creating a new contact + contact_channel otherwise.
--
-- This never merges across providers (that's level 3, a human
-- decision) — it only recognizes repeat contact on the *same*
-- channel.
--
-- Concurrency: two ingestion workers can race on the very first
-- message from a brand-new identity. The fast path is a plain
-- SELECT; only the slow (create) path takes a transaction-level
-- advisory lock keyed on the identity, so concurrent callers for
-- an already-known identity never block each other, and racing
-- callers for a new identity serialize instead of creating two
-- contacts for the same person.
-- =========================================================

CREATE OR REPLACE FUNCTION public.upsert_contact_channel(
  p_workspace_id   uuid,
  p_provider       text,
  p_external_id    text,
  p_display_handle text DEFAULT NULL,
  p_contact_name   text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contact_id uuid;
BEGIN
  SELECT contact_id INTO v_contact_id
  FROM contact_channels
  WHERE workspace_id = p_workspace_id
    AND provider = p_provider
    AND external_id = p_external_id;

  IF v_contact_id IS NOT NULL THEN
    IF p_display_handle IS NOT NULL THEN
      UPDATE contact_channels
      SET display_handle = p_display_handle
      WHERE workspace_id = p_workspace_id
        AND provider = p_provider
        AND external_id = p_external_id
        AND display_handle IS DISTINCT FROM p_display_handle;
    END IF;

    RETURN v_contact_id;
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended(p_workspace_id::text || ':' || p_provider || ':' || p_external_id, 0)
  );

  SELECT contact_id INTO v_contact_id
  FROM contact_channels
  WHERE workspace_id = p_workspace_id
    AND provider = p_provider
    AND external_id = p_external_id;

  IF v_contact_id IS NOT NULL THEN
    RETURN v_contact_id;
  END IF;

  INSERT INTO contacts (workspace_id, name)
  VALUES (p_workspace_id, COALESCE(p_contact_name, p_display_handle, p_external_id))
  RETURNING id INTO v_contact_id;

  INSERT INTO contact_channels (contact_id, workspace_id, provider, external_id, display_handle)
  VALUES (v_contact_id, p_workspace_id, p_provider, p_external_id, p_display_handle);

  RETURN v_contact_id;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_contact_channel(uuid, text, text, text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.upsert_contact_channel(uuid, text, text, text, text) TO authenticated;
