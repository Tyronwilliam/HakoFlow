import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { createGmailMessages, createMessage, createMessages } from "@/mocks";
import { createDiscordMessages } from "@/mocks";
import { createSlackMessages } from "@/mocks";

const DEFAULT_COUNT = 10;

function getCount(flag: string): number {
  const arg = process.argv.find((value) => value.startsWith(`--${flag}=`));
  return arg ? Number(arg.split("=")[1]) : DEFAULT_COUNT;
}

const counts = {
  gmail: getCount("gmail"),
  discord: getCount("discord"),
  slack: getCount("slack"),
  supabaseMessage: getCount("slack"),
};

const outDir = path.join(__dirname, "../src/mocks/data");

mkdirSync(outDir, { recursive: true });

const gmailMessages = createGmailMessages(counts.gmail);
const discordMessages = createDiscordMessages(counts.discord);
const slackMessages = createSlackMessages(counts.slack);

const supabaseMessages = createMessages(counts.supabaseMessage);
writeFileSync(path.join(outDir, "gmail.json"), JSON.stringify(gmailMessages, null, 2));
writeFileSync(path.join(outDir, "discord.json"), JSON.stringify(discordMessages, null, 2));
writeFileSync(path.join(outDir, "slack.json"), JSON.stringify(slackMessages, null, 2));
writeFileSync(
  path.join(outDir, "supabase-messages.json"),
  JSON.stringify(supabaseMessages, null, 2),
);

console.log(
  `Seeded mock data: ${counts.gmail} gmail, ${counts.discord} discord, ${counts.slack} slack messages, ${counts.slack} supabase messages`,
);
