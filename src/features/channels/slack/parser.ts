import type { SlackMessage } from "@/features/channels/slack/types";
import type { Message } from "@/features/inbox/types";

export function parseSlackMessage(raw: SlackMessage): Message {
  return {
    id: raw.ts,
    channel: "slack",
    externalId: raw.ts,
    from: raw.user,
    fromHandle: raw.user,
    content: raw.text,
    preview: raw.text.slice(0, 60),
    direction: "inbound",
    sentAt: new Date(parseFloat(raw.ts) * 1000),
    read: false,
    attachmentUrls: [],
  };
}
