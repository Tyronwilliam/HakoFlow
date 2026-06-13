import type { DiscordMessage } from "@/features/channels/discord/types";
import { Message } from "@/types";

export function parseDiscordMessage(raw: DiscordMessage): Message {
  return {
    id: raw.id,
    channel: "discord",
    externalId: raw.id,
    from: raw.author.global_name,
    fromHandle: raw.author.username,
    content: raw.content,
    preview: raw.content.slice(0, 60),
    direction: "inbound",
    sentAt: new Date(raw.timestamp),
    read: false,
    attachmentUrls: [],
  };
}
