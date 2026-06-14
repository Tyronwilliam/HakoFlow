import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { faker } from "@faker-js/faker";
import {
  createGmailMessages,
  createSlackMessages,
  createDiscordMessages,
  createWorkspaceScenario,
} from "@/mocks";

const DEFAULT_COUNT = 10;
const DEFAULT_SEED = 1312;

function getCount(flag: string): number {
  const arg = process.argv.find((value) => value.startsWith(`--${flag}=`));
  return arg ? Number(arg.split("=")[1]) : DEFAULT_COUNT;
}

function getSeed(): number {
  const arg = process.argv.find((value) => value.startsWith("--seed="));
  return arg ? Number(arg.split("=")[1]) : DEFAULT_SEED;
}

faker.seed(getSeed());

const counts = {
  gmail: getCount("gmail"),
  discord: getCount("discord"),
  slack: getCount("slack"),
  contacts: getCount("contacts"),
};

const outDir = path.join(__dirname, "../src/mocks/data");

mkdirSync(outDir, { recursive: true });

const gmailMessages = createGmailMessages(counts.gmail);
const discordMessages = createDiscordMessages(counts.discord);
const slackMessages = createSlackMessages(counts.slack);
const scenario = createWorkspaceScenario(faker.string.uuid(), counts.contacts);

writeFileSync(path.join(outDir, "gmail.json"), JSON.stringify(gmailMessages, null, 2));
writeFileSync(path.join(outDir, "discord.json"), JSON.stringify(discordMessages, null, 2));
writeFileSync(path.join(outDir, "slack.json"), JSON.stringify(slackMessages, null, 2));
writeFileSync(path.join(outDir, "contacts.json"), JSON.stringify(scenario.contacts, null, 2));
writeFileSync(
  path.join(outDir, "contact-channels.json"),
  JSON.stringify(scenario.contactChannels, null, 2),
);
writeFileSync(
  path.join(outDir, "conversations.json"),
  JSON.stringify(scenario.conversations, null, 2),
);
writeFileSync(
  path.join(outDir, "supabase-messages.json"),
  JSON.stringify(scenario.messages, null, 2),
);

console.log(
  `Seeded mock data: ${counts.gmail} gmail, ${counts.discord} discord, ${counts.slack} slack messages, ` +
    `${scenario.contacts.length} contacts, ${scenario.conversations.length} conversations, ${scenario.messages.length} messages`,
);
