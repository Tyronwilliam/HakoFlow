import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { createGmailMessages } from "@/mocks/factories/gmail";
import { createDiscordMessages } from "@/mocks/factories/discord";
import { createSlackMessages } from "@/mocks/factories/slack";

const DEFAULT_COUNT = 10;

function getCount(flag: string): number {
  const arg = process.argv.find((value) => value.startsWith(`--${flag}=`));
  return arg ? Number(arg.split("=")[1]) : DEFAULT_COUNT;
}

const counts = {
  gmail: getCount("gmail"),
  discord: getCount("discord"),
  slack: getCount("slack"),
};

const outDir = path.join(__dirname, "../src/mocks/data");
mkdirSync(outDir, { recursive: true });

writeFileSync(
  path.join(outDir, "gmail.json"),
  JSON.stringify(createGmailMessages(counts.gmail), null, 2),
);
writeFileSync(
  path.join(outDir, "discord.json"),
  JSON.stringify(createDiscordMessages(counts.discord), null, 2),
);
writeFileSync(
  path.join(outDir, "slack.json"),
  JSON.stringify(createSlackMessages(counts.slack), null, 2),
);

console.log(
  `Seeded mock data: ${counts.gmail} gmail, ${counts.discord} discord, ${counts.slack} slack messages.`,
);
