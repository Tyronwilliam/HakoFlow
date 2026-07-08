import type { ContactIdentity } from "@/features/channels/shared/types";
import type { DiscordMessage } from "@/features/channels/discord/types";

export function extractDiscordContactIdentity(raw: DiscordMessage): ContactIdentity {
  return {
    externalId: raw.author.id.trim(),
    displayHandle: raw.author.global_name || raw.author.username,
  };
}
