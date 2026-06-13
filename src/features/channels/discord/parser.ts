import type { DiscordMessage } from "@/features/channels/discord/types";
import type { Message } from "@/features/inbox/types";

export function parseDiscordMessage(raw: DiscordMessage): Message {
  return {
    id: raw.id,
    channel: "discord",
    from: raw.author.username,
    subject: `#${raw.channel_id}`,
    preview: raw.content,
    receivedAt: raw.timestamp,
    read: false,
  };
}
