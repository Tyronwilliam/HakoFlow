import type { GmailMessage } from "@/features/channels/gmail/types";
import { Message } from "@/types/index";

export function parseGmailMessage(raw: GmailMessage): Message {
  const getHeader = (name: string) =>
    raw.payload.headers.find((header) => header.name === name)?.value ?? "";

  return {
    id: raw.id,
    channel: "gmail",
    externalId: raw.id,
    from: getHeader("From"),
    fromHandle: getHeader("From"),
    subject: getHeader("Subject"),
    content: Buffer.from(raw.payload.body.data, "base64url").toString("utf-8"),
    preview: raw.snippet,
    direction: "inbound",
    sentAt: new Date(getHeader("Date")),
    read: false,
    attachmentUrls: [],
  };
}
