-- =========================================================
-- Drop the stale (contact_id, provider) uniqueness constraint
-- on contact_channels.
--
-- It predates the workspace-scoped model introduced in
-- 20260706140000_contact_channels_workspace_scoped.sql, which
-- enforces the real invariant via
-- contact_channels_workspace_provider_external_id_key
-- (workspace_id, provider, external_id).
--
-- Left in place, it blocks merge_contacts from ever combining
-- two contacts that each have a channel on the same provider
-- (e.g. two Messenger identities) — exactly the case merge
-- suggestions are meant to handle, since a merged contact must
-- be able to hold several channels of the same provider with
-- different external_id values.
-- =========================================================

ALTER TABLE contact_channels
  DROP CONSTRAINT contact_channels_contact_id_provider_key;
