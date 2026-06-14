-- =========================================================
-- Row Level Security
-- =========================================================

-- ---------------------------------------------------------
-- users
-- ---------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "self_access" ON users
  FOR ALL USING (id = auth.uid());

-- ---------------------------------------------------------
-- workspaces
-- ---------------------------------------------------------
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_access" ON workspaces
  FOR ALL USING (user_id = auth.uid());

-- ---------------------------------------------------------
-- connected_accounts
-- ---------------------------------------------------------
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_isolation" ON connected_accounts
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- contacts
-- ---------------------------------------------------------
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_isolation" ON contacts
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- contact_channels
-- ---------------------------------------------------------
ALTER TABLE contact_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_isolation" ON contact_channels
  FOR ALL USING (
    contact_id IN (
      SELECT c.id FROM contacts c
      JOIN workspaces w ON w.id = c.workspace_id
      WHERE w.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- whitelist
-- ---------------------------------------------------------
ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_isolation" ON whitelist
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- conversations
-- ---------------------------------------------------------
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_isolation" ON conversations
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- messages
-- ---------------------------------------------------------
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_isolation" ON messages
  FOR ALL USING (
    conversation_id IN (
      SELECT conv.id FROM conversations conv
      JOIN workspaces w ON w.id = conv.workspace_id
      WHERE w.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- ai_suggestions
-- ---------------------------------------------------------
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_isolation" ON ai_suggestions
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- reminders
-- ---------------------------------------------------------
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_isolation" ON reminders
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );
