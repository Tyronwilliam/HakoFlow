import type { DiscordMessage } from "@/features/channels/discord/types";
import type { MessageRow } from "@/types";

export function parseDiscordMessage(raw: DiscordMessage, conversationId: string): MessageRow {
  return {
    id: crypto.randomUUID(),
    conversation_id: conversationId,
    external_id: raw.id,
    channel: "discord",
    direction: "inbound",
    content: raw.content,
    status: "delivered",
    attachment_urls: [],
    sent_at: new Date(raw.timestamp).toISOString(),
    read_at: null,
    expires_at: null,
  };
}
