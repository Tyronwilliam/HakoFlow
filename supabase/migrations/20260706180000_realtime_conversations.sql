-- =========================================================
-- Enable Realtime on conversations
--
-- src/hooks/use-unread-count.ts subscribes to postgres_changes
-- UPDATE events on `conversations` to keep the sidebar unread
-- badge live, but the `supabase_realtime` publication had no
-- tables added to it — so the initial fetch ran once and the
-- badge never refreshed again after a conversation was read
-- elsewhere.
-- =========================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
