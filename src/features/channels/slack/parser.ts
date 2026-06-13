import type { SlackMessage } from "@/features/channels/slack/types";
import type { Message } from "@/features/inbox/types";

export function parseSlackMessage(raw: SlackMessage): Message {
  return {
    id: raw.ts,
    channel: "slack",
    from: raw.user,
    subject: `#${raw.channel}`,
    preview: raw.text,
    receivedAt: raw.ts,
    read: false,
  };
}
