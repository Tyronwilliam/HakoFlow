-- =========================================================
-- Enable Postgres realtime replication on conversations, so
-- clients can subscribe to inbox list changes (new/updated
-- conversations) via Supabase Realtime.
-- =========================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
