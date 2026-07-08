import { z } from "zod";
import type { ChannelListType } from "@/types";

export interface RawGroupedConversation {
  id: string;
  primary_channel: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number | null;
  is_pinned: boolean | null;
  is_starred: boolean | null;
  contact_handle: string | null;
}

export interface RawContactGroupRow {
  group_key: string;
  contact_name: string;
  unread_conversations: number | string | null;
  last_message_at: string | null;
  channels: string[];
  conversations: RawGroupedConversation[];
}

function toConversationListItem(
  raw: RawGroupedConversation,
  contactName: string,
): ConversationListItem {
  return {
    id: raw.id,
    channel: raw.primary_channel as ChannelListType,
    contactName,
    contactHandle: raw.contact_handle,
    lastMessageAt: raw.last_message_at,
    lastMessagePreview: raw.last_message_preview,
    unreadCount: raw.unread_count ?? 0,
    isPinned: raw.is_pinned ?? false,
    isStarred: raw.is_starred ?? false,
  };
}

export function toContactConversationGroup(raw: RawContactGroupRow): ContactConversationGroup {
  return {
    id: raw.group_key,
    contactName: raw.contact_name,
    channels: raw.channels as ChannelListType[],
    unreadConversationsCount: Number(raw.unread_conversations ?? 0),
    lastMessageAt: raw.last_message_at,
    conversations: raw.conversations.map((conversation) =>
      toConversationListItem(conversation, raw.contact_name),
    ),
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

export const contactConversationGroupSchema = z.object({
  id: z.string(),
  contactName: z.string(),
  channels: z.array(z.enum(["gmail", "discord", "slack"])),
  unreadConversationsCount: z.number(),
  lastMessageAt: z.string().nullable(),
  conversations: z.array(conversationListItemSchema),
});

export type ContactConversationGroup = z.infer<typeof contactConversationGroupSchema>;
