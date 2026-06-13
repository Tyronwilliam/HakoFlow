import type { GmailMessage } from "@/features/channels/gmail/types";
import type { Message } from "@/features/inbox/types";

export function parseGmailMessage(raw: GmailMessage): Message {
  const getHeader = (name: string) =>
    raw.payload.headers.find((header) => header.name === name)?.value ?? "";

  return {
    id: raw.id,
    channel: "gmail",
    from: getHeader("From"),
    subject: getHeader("Subject"),
    preview: raw.snippet,
    receivedAt: getHeader("Date"),
    read: false,
  };
}
