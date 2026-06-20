import type { DiscordMessage } from "@/features/channels/discord/types";
import { MessageRow } from "../../message/types";

export function parseDiscordMessage(raw: DiscordMessage, conversationId: string): MessageRow {
  return {
    id: crypto.randomUUID(),
    conversation_id: conversationId,
    external_id: raw.id,
    channel: "discord",
    direction: "inbound" as MessageRow["direction"],
    content: raw.content,
    status: "delivered" as MessageRow["status"],
    attachment_urls: [],
    sent_at: new Date(raw.timestamp).toISOString(),
    read_at: null,
    expires_at: null,
  };
}
