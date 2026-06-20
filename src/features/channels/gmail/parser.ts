import type { GmailMessage } from "@/features/channels/gmail/types";
import { MessageRow } from "../../message/types";

export function parseGmailMessage(raw: GmailMessage, conversationId: string): MessageRow {
  const getHeader = (name: string) =>
    raw.payload.headers.find((header) => header.name === name)?.value ?? "";

  return {
    id: crypto.randomUUID(),
    conversation_id: conversationId,
    external_id: raw.id,
    channel: "gmail",
    direction: "inbound" as MessageRow["direction"],
    content: Buffer.from(raw.payload.body.data, "base64url").toString("utf-8"),
    status: "delivered" as MessageRow["status"],
    attachment_urls: [],
    sent_at: new Date(getHeader("Date")).toISOString(),
    read_at: null,
    expires_at: null,
  };
}
