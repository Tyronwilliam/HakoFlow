import postgres from "postgres";
import { createWorkspaceScenario } from "@/mocks/factories";

/**
 * Peuple le projet Supabase lié avec un scénario réaliste (contacts,
 * contact_channels, conversations, messages) pour un workspace donné.
 *
 * Usage:
 *   bun run seed-supabase --email=<email-de-connexion> [--contacts=5] [--reset]
 *
 * Le script connecte directement à Postgres (SUPABASE_DATABASE_PASSWORD)
 * car `messages.content` est chiffré via pgp_sym_encrypt (voir
 * supabase/migrations/20260614120002_functions_and_jobs.sql) — non
 * accessible via la lib supabase-js.
 */

function getArg(name: string): string | undefined {
  const arg = process.argv.find((value) => value.startsWith(`--${name}=`));
  return arg?.split("=")[1];
}

const email = getArg("email");
if (!email) {
  throw new Error(
    "Usage: bun run seed-supabase --email=<email-de-connexion> [--contacts=5] [--reset]",
  );
}

const contactCount = Number(getArg("contacts") ?? 5);
const reset = process.argv.includes("--reset");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const password = process.env.SUPABASE_DATABASE_PASSWORD;

if (!supabaseUrl || !password) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_DATABASE_PASSWORD sont requis (voir .env.local).",
  );
}

const projectRef = new URL(supabaseUrl).hostname.split(".")[0];

const sql = postgres({
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  database: "postgres",
  username: "postgres",
  password,
  ssl: "require",
});

const [user] = await sql<{ id: string }[]>`SELECT id FROM users WHERE email = ${email}`;

if (!user) {
  throw new Error(
    `Aucun utilisateur trouvé pour ${email} dans public.users — connecte-toi une fois via ` +
      "l'app (la ligne est créée automatiquement après le premier login).",
  );
}

let [workspace] = await sql<{ id: string }[]>`
  SELECT id FROM workspaces WHERE user_id = ${user.id} AND is_default = true
`;

if (!workspace) {
  [workspace] = await sql<{ id: string }[]>`
    INSERT INTO workspaces (user_id, name, is_default) VALUES (${user.id}, 'Workspace', true)
    RETURNING id
  `;
}

if (reset) {
  // Cascade: conversations -> messages/ai_suggestions/reminders, contacts -> contact_channels
  await sql`DELETE FROM conversations WHERE workspace_id = ${workspace.id}`;
  await sql`DELETE FROM contacts WHERE workspace_id = ${workspace.id}`;
}

const scenario = createWorkspaceScenario(workspace.id, contactCount);

await sql`
  INSERT INTO contacts ${sql(
    scenario.contacts,
    "id",
    "workspace_id",
    "name",
    "notes",
    "tags",
    "blacklisted",
    "enriched",
    "created_at",
    "updated_at",
  )}
`;

await sql`
  INSERT INTO contact_channels ${sql(
    scenario.contactChannels,
    "id",
    "contact_id",
    "provider",
    "external_id",
    "display_handle",
  )}
`;

await sql`
  INSERT INTO conversations ${sql(
    scenario.conversations,
    "id",
    "workspace_id",
    "contact_id",
    "primary_channel",
    "external_id",
    "display_handle",
    "last_message_at",
    "last_message_preview",
    "unread_count",
    "is_pinned",
    "is_archived",
    "is_starred",
    "created_at",
  )}
`;

for (const message of scenario.messages) {
  await sql`
    INSERT INTO messages (
      id, conversation_id, external_id, channel, direction, content, status,
      attachment_urls, sent_at, read_at, expires_at
    ) VALUES (
      ${message.id}, ${message.conversation_id}, ${message.external_id}, ${message.channel},
      ${message.direction},
      pgp_sym_encrypt(${message.content}, (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'hubdesk_messages_key')),
      ${message.status}, ${message.attachment_urls}, ${message.sent_at}, ${message.read_at}, ${message.expires_at}
    )
  `;
}

console.log(
  `Seeded workspace ${workspace.id}: ${scenario.contacts.length} contacts, ` +
    `${scenario.contactChannels.length} contact_channels, ${scenario.conversations.length} conversations, ` +
    `${scenario.messages.length} messages.`,
);

await sql.end();
