import type { SlackMessage } from "@/features/channels/slack/types";
import type { MessageRow } from "@/types";

export function parseSlackMessage(raw: SlackMessage, conversationId: string): MessageRow {
  return {
    id: crypto.randomUUID(),
    conversation_id: conversationId,
    external_id: raw.ts,
    channel: "slack",
    direction: "inbound",
    content: raw.text,
    status: "delivered",
    attachment_urls: [],
    sent_at: new Date(parseFloat(raw.ts) * 1000).toISOString(),
    read_at: null,
    expires_at: null,
  };
}
