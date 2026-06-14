-- =========================================================
-- Initial schema — tables & indexes
-- =========================================================

-- ---------------------------------------------------------
-- users
-- ---------------------------------------------------------
CREATE TABLE users (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text NOT NULL,
  name            text,
  avatar_url      text,
  avatar_color    text,
  theme           text DEFAULT 'dark',
  plan            text DEFAULT 'free',
  plan_ends_at    timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- ---------------------------------------------------------
-- workspaces
-- ---------------------------------------------------------
CREATE TABLE workspaces (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  avatar_color    text,
  is_default      boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX ON workspaces (user_id);

-- ---------------------------------------------------------
-- connected_accounts
-- ---------------------------------------------------------
CREATE TABLE connected_accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider        text NOT NULL,
  external_id     text NOT NULL,
  account_label   text,
  access_token    text,
  refresh_token   text,
  expires_at      timestamptz,
  status          text DEFAULT 'connected',
  connected_at    timestamptz DEFAULT now(),

  UNIQUE (workspace_id, provider, external_id)
);

CREATE INDEX ON connected_accounts (workspace_id);
CREATE INDEX ON connected_accounts (workspace_id, provider);

-- ---------------------------------------------------------
-- contacts
-- ---------------------------------------------------------
CREATE TABLE contacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name            text NOT NULL,
  notes           text,
  tags            text[] DEFAULT '{}',
  blacklisted     boolean DEFAULT false,
  enriched        boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX ON contacts (workspace_id);
CREATE INDEX ON contacts USING GIN (tags);
CREATE INDEX ON contacts (workspace_id, blacklisted) WHERE blacklisted = true;
CREATE INDEX ON contacts (workspace_id, enriched) WHERE enriched = true;

-- ---------------------------------------------------------
-- contact_channels
-- ---------------------------------------------------------
CREATE TABLE contact_channels (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  provider        text NOT NULL,
  external_id     text NOT NULL,
  display_handle  text,

  UNIQUE (contact_id, provider)
);

CREATE INDEX ON contact_channels (contact_id);
CREATE INDEX ON contact_channels (provider, external_id);

-- ---------------------------------------------------------
-- whitelist
-- ---------------------------------------------------------
CREATE TABLE whitelist (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider        text NOT NULL,
  external_id     text NOT NULL,
  display_handle  text,
  created_at      timestamptz DEFAULT now(),

  UNIQUE (workspace_id, provider, external_id)
);

CREATE INDEX ON whitelist (workspace_id, provider);

-- ---------------------------------------------------------
-- conversations
-- ---------------------------------------------------------
CREATE TABLE conversations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id          uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contact_id            uuid REFERENCES contacts(id) ON DELETE SET NULL,
  primary_channel       text NOT NULL,
  external_id           text,
  last_message_at       timestamptz,
  last_message_preview  text,
  unread_count          int DEFAULT 0,
  is_pinned             boolean DEFAULT false,
  is_archived           boolean DEFAULT false,
  is_starred            boolean DEFAULT false,
  created_at            timestamptz DEFAULT now(),

  UNIQUE (workspace_id, primary_channel, external_id)
);

CREATE INDEX ON conversations (workspace_id, is_archived, is_pinned DESC, last_message_at DESC);
CREATE INDEX ON conversations (workspace_id, primary_channel);
CREATE INDEX ON conversations (workspace_id, unread_count) WHERE unread_count > 0;

-- ---------------------------------------------------------
-- messages
-- ---------------------------------------------------------
CREATE TABLE messages (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  external_id         text,
  channel             text NOT NULL,
  direction           text NOT NULL,
  content             bytea NOT NULL,
  status              text DEFAULT 'sent',
  attachment_urls     text[] DEFAULT '{}',
  sent_at             timestamptz DEFAULT now(),
  read_at             timestamptz,
  expires_at          timestamptz,

  UNIQUE (conversation_id, external_id)
);

CREATE INDEX ON messages (conversation_id, sent_at DESC);
CREATE INDEX ON messages (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX ON messages (status) WHERE status = 'draft';

-- ---------------------------------------------------------
-- ai_suggestions
-- ---------------------------------------------------------
CREATE TABLE ai_suggestions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  type            text NOT NULL,
  content         text NOT NULL,
  accepted        boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX ON ai_suggestions (workspace_id, created_at DESC);
CREATE INDEX ON ai_suggestions (conversation_id);

-- ---------------------------------------------------------
-- reminders
-- ---------------------------------------------------------
CREATE TABLE reminders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  remind_at       timestamptz NOT NULL,
  note            text,
  done            boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX ON reminders (workspace_id, remind_at) WHERE done = false;
