import { readFileSync, writeFileSync } from "fs";
import path from "path";

/**
 * Génère un fichier `XRow` par table dans `src/types/shared/` à partir de
 * `src/types/database.types.ts` (lui-même généré par `bun run gen:types`).
 *
 * Les colonnes texte/booléennes avec une valeur DEFAULT sont nullable côté
 * Postgres mais toujours renseignées par l'application : TYPE_OVERRIDES
 * resserre ces types (retire `| null`, ou pose une union littérale comme
 * `Channel` / `"dark" | "light"`) pour les champs concernés.
 */

type Override = { type?: string; nonNull?: boolean };

const CHANNEL_IMPORT = { name: "ChannelListType", from: "./channels" };

const TYPE_OVERRIDES: Record<string, Record<string, Override>> = {
  ai_suggestions: {
    accepted: { nonNull: true },
    created_at: { nonNull: true },
    type: { type: '"reply" | "summary"' },
  },
  connected_accounts: {
    provider: { type: "ChannelListType" },
    status: { type: '"connected" | "disconnected" | "error"' },
    connected_at: { nonNull: true },
  },
  contact_channels: {
    provider: { type: "ChannelListType" },
  },
  contacts: {
    blacklisted: { nonNull: true },
    enriched: { nonNull: true },
    tags: { nonNull: true },
    created_at: { nonNull: true },
    updated_at: { nonNull: true },
  },
  conversations: {
    primary_channel: { type: "ChannelListType" },
    unread_count: { nonNull: true },
    is_pinned: { nonNull: true },
    is_archived: { nonNull: true },
    is_starred: { nonNull: true },
    created_at: { nonNull: true },
  },
  messages: {
    channel: { type: "ChannelListType" },
    direction: { type: '"inbound" | "outbound"' },
    status: { type: '"draft" | "sent" | "delivered" | "read" | "error"' },
    attachment_urls: { nonNull: true },
    sent_at: { nonNull: true },
  },
  reminders: {
    done: { nonNull: true },
    created_at: { nonNull: true },
  },
  users: {
    theme: { type: '"dark" | "light"' },
    plan: { type: '"free" | "pro"' },
    created_at: { nonNull: true },
  },
  whitelist: {
    provider: { type: "ChannelListType" },
    created_at: { nonNull: true },
  },
  workspaces: {
    is_default: { nonNull: true },
    created_at: { nonNull: true },
  },
};

function toPascalCase(snakeCase: string): string {
  return snakeCase
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function singularize(word: string): string {
  return word.endsWith("s") ? word.slice(0, -1) : word;
}

function toRowTypeName(tableName: string): string {
  const parts = tableName.split("_");
  parts[parts.length - 1] = singularize(parts[parts.length - 1]);
  return `${toPascalCase(parts.join("_"))}Row`;
}

function toFileName(tableName: string): string {
  return tableName.replace(/_/g, "-");
}

function stripNull(type: string): string {
  return type
    .split(" | ")
    .filter((part) => part !== "null")
    .join(" | ");
}

const databaseTypesPath = path.join(__dirname, "../src/types/database.types.ts");
const sharedDir = path.join(__dirname, "../src/types/shared");
const source = readFileSync(databaseTypesPath, "utf-8");
const lines = source.split("\n");

const tables = new Map<string, Map<string, string>>();
let currentTable: string | null = null;
let inRow = false;
let inTables = false;

for (const line of lines) {
  if (line === "    Tables: {") {
    inTables = true;
    continue;
  }
  if (inTables && /^    \w+: \{$/.test(line)) {
    // Next 4-space-indented section (Views, Functions, Enums, ...) ends Tables.
    inTables = false;
  }
  if (!inTables) continue;

  const tableMatch = line.match(/^      (\w+): \{$/);
  if (tableMatch) {
    currentTable = tableMatch[1];
    tables.set(currentTable, new Map());
    continue;
  }

  if (currentTable === null) continue;

  if (line === "        Row: {") {
    inRow = true;
    continue;
  }

  if (inRow) {
    if (line === "        }" || line === "        };") {
      inRow = false;
      currentTable = null;
      continue;
    }

    const fieldMatch = line.match(/^ {10}(\w+): (.+);?$/);
    if (fieldMatch) {
      tables.get(currentTable)!.set(fieldMatch[1], fieldMatch[2].replace(/;$/, ""));
    }
  }
}

const exportLines: string[] = [
  `export type { ${CHANNEL_IMPORT.name} } from "${CHANNEL_IMPORT.from}";`,
];

for (const [tableName, fields] of tables) {
  const rowType = toRowTypeName(tableName);
  const overrides = TYPE_OVERRIDES[tableName] ?? {};
  let usesChannel = false;

  const fieldLines = Array.from(fields.entries()).map(([field, generatedType]) => {
    const override = overrides[field];
    let type = generatedType;

    if (override?.type) {
      type = override.type;
      if (type === CHANNEL_IMPORT.name) usesChannel = true;
    } else if (override?.nonNull) {
      type = stripNull(generatedType);
    }

    return `  ${field}: ${type};`;
  });

  const importLine = usesChannel
    ? `import type { ${CHANNEL_IMPORT.name} } from "${CHANNEL_IMPORT.from}";\n\n`
    : "";

  const content = `${importLine}export interface ${rowType} {\n${fieldLines.join("\n")}\n}\n`;

  writeFileSync(path.join(sharedDir, `${toFileName(tableName)}.ts`), content);
  exportLines.push(`export type { ${rowType} } from "./${toFileName(tableName)}";`);
}

writeFileSync(path.join(sharedDir, "index.ts"), exportLines.join("\n") + "\n");

console.log(`Généré ${tables.size} fichiers de type dans src/types/shared/`);
