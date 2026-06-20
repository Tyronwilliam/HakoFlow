import { z } from "zod";
import type { ChannelListType } from "@/types";

export interface RawMessageRow {
  id: string;
  channel: string;
  direction: string;
  content: string;
  status: string | null;
  sent_at: string | null;
  read_at: string | null;
  expires_at: string | null;
  conversation_id: string;
  external_id: string | null;
  attachment_urls: string[] | null;
}

export function toMessage(raw: RawMessageRow): Message {
  return {
    id: raw.id,
    channel: raw.channel as ChannelListType,
    direction: raw.direction as Message["direction"],
    content: raw.content,
    status: (raw.status ?? "sent") as Message["status"],
    sentAt: raw.sent_at,
    readAt: raw.read_at,
    expiresAt: raw.expires_at,
    conversationId: raw.conversation_id,
    externalId: raw.external_id,
    attachmentUrls: raw.attachment_urls ?? [],
  };
}

export const messageSchema = z.object({
  id: z.string(),
  channel: z.enum(["gmail", "discord", "slack"]),
  direction: z.enum(["inbound", "outbound"]),
  content: z.string(),
  status: z.enum(["draft", "sent", "delivered", "read", "error"]),
  sentAt: z.string().nullable(),
  readAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  conversationId: z.string(),
  externalId: z.string().nullable(),
  attachmentUrls: z.array(z.string()),
});

export type Message = z.infer<typeof messageSchema>;
