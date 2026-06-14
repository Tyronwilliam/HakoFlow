-- =========================================================
-- Functions, triggers & scheduled jobs
-- =========================================================

-- ---------------------------------------------------------
-- Create a `public.users` row whenever a new auth.users row
-- is created (Google OAuth → email/name/avatar_url)
-- ---------------------------------------------------------
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ---------------------------------------------------------
-- pgcrypto + Vault — encryption key for message content &
-- connected_accounts tokens
--
-- Usage (application queries):
--   encrypt: pgp_sym_encrypt(content, (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'hubdesk_messages_key'))
--   decrypt: pgp_sym_decrypt(content, (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'hubdesk_messages_key'))
-- ---------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS supabase_vault;

SELECT vault.create_secret(
  encode(extensions.gen_random_bytes(32), 'hex'),
  'hubdesk_messages_key',
  'Symmetric key for encrypting message content and OAuth tokens'
);

-- ---------------------------------------------------------
-- pg_cron — purge expired messages every night at 2am UTC
-- ---------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'delete-expired-messages',
  '0 2 * * *',
  $$ DELETE FROM messages WHERE expires_at < now() $$
);
