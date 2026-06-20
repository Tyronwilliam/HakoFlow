import type { SlackMessage } from "@/features/channels/slack/types";
import { MessageRow } from "../../message/types";

export function parseSlackMessage(raw: SlackMessage, conversationId: string): MessageRow {
  return {
    id: crypto.randomUUID(),
    conversation_id: conversationId,
    external_id: raw.ts,
    channel: "slack",
    direction: "inbound" as MessageRow["direction"],
    content: raw.text,
    status: "delivered" as MessageRow["status"],
    attachment_urls: [],
    sent_at: new Date(parseFloat(raw.ts) * 1000).toISOString(),
    read_at: null,
    expires_at: null,
  };
}
