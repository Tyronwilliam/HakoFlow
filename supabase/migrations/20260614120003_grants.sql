-- =========================================================
-- Grants
--
-- RLS policies restrict *rows*, but the `authenticated` role
-- still needs table-level privileges to access them at all.
-- Without these grants, every query fails with
-- "permission denied for table ..." (42501).
-- =========================================================

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  users,
  workspaces,
  connected_accounts,
  contacts,
  contact_channels,
  whitelist,
  conversations,
  messages,
  ai_suggestions,
  reminders
TO authenticated;
