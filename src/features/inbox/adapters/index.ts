import { z } from "zod";
import type { Channel } from "@/types";

export interface RawConversationRow {
  id: string;
  primary_channel: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number | null;
  is_pinned: boolean | null;
  is_starred: boolean | null;
  contacts: {
    name: string;
    contact_channels: { provider: string; display_handle: string | null }[];
  } | null;
}

export function toConversationListItem(raw: RawConversationRow): ConversationListItem {
  const contactChannel = raw.contacts?.contact_channels.find(
    (channel) => channel.provider === raw.primary_channel,
  );

  return {
    id: raw.id,
    channel: raw.primary_channel as Channel,
    contactName: raw.contacts?.name ?? "Inconnu",
    contactHandle: contactChannel?.display_handle ?? null,
    lastMessageAt: raw.last_message_at,
    lastMessagePreview: raw.last_message_preview,
    unreadCount: raw.unread_count ?? 0,
    isPinned: raw.is_pinned ?? false,
    isStarred: raw.is_starred ?? false,
  };
}

export const conversationListItemSchema = z.object({
  id: z.string(),
  channel: z.enum(["gmail", "discord", "slack"]),
  contactName: z.string(),
  contactHandle: z.string().nullable(),
  lastMessageAt: z.string().nullable(),
  lastMessagePreview: z.string().nullable(),
  unreadCount: z.number(),
  isPinned: z.boolean(),
  isStarred: z.boolean(),
});

export type ConversationListItem = z.infer<typeof conversationListItemSchema>;
