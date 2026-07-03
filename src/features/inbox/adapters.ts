import { z } from "zod";
import type { ChannelListType } from "@/types";

export interface RawConversationRow {
  id: string;
  primary_channel: string;
  external_id: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number | null;
  is_pinned: boolean | null;
  is_starred: boolean | null;
  contacts: {
    name: string;
    contact_channels: { provider: string; external_id: string; display_handle: string | null }[];
  } | null;
}

export function findMatchingChannel(
  channels: { provider: string; external_id: string; display_handle: string | null }[],
  provider: string,
  externalId: string | null,
) {
  return channels.find(
    (channel) => channel.provider === provider && channel.external_id === externalId,
  );
}

export function toConversationListItem(raw: RawConversationRow): ConversationListItem {
  const contactChannel = findMatchingChannel(
    raw.contacts?.contact_channels ?? [],
    raw.primary_channel,
    raw.external_id,
  );

  return {
    id: raw.id,
    channel: raw.primary_channel as ChannelListType,
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

export interface RawUnlinkedConversationRow {
  id: string;
  primary_channel: string;
  external_id: string | null;
  display_handle: string | null;
  last_message_preview: string | null;
  last_message_at: string | null;
}

export function toUnlinkedConversationOption(
  raw: RawUnlinkedConversationRow,
): UnlinkedConversationOption {
  return {
    id: raw.id,
    provider: raw.primary_channel as ChannelListType,
    externalId: raw.external_id ?? "",
    displayHandle: raw.display_handle,
    lastMessagePreview: raw.last_message_preview,
    lastMessageAt: raw.last_message_at,
  };
}

export const unlinkedConversationOptionSchema = z.object({
  id: z.string(),
  provider: z.enum(["gmail", "discord", "slack"]),
  externalId: z.string(),
  displayHandle: z.string().nullable(),
  lastMessagePreview: z.string().nullable(),
  lastMessageAt: z.string().nullable(),
});

export type UnlinkedConversationOption = z.infer<typeof unlinkedConversationOptionSchema>;

export interface RawConversationDetailRow {
  id: string;
  primary_channel: string;
  external_id: string | null;
  contact_id: string | null;
  contacts: {
    name: string;
    contact_channels: { provider: string; external_id: string; display_handle: string | null }[];
  } | null;
}

export function toConversationDetail(raw: RawConversationDetailRow): ConversationDetail {
  const contactChannel = findMatchingChannel(
    raw.contacts?.contact_channels ?? [],
    raw.primary_channel,
    raw.external_id,
  );

  return {
    id: raw.id,
    channel: raw.primary_channel as ChannelListType,
    externalId: raw.external_id,
    contactId: raw.contact_id,
    contactName: raw.contacts?.name ?? null,
    contactHandle: contactChannel?.display_handle ?? null,
  };
}

export const conversationDetailSchema = z.object({
  id: z.string(),
  channel: z.enum(["gmail", "discord", "slack"]),
  externalId: z.string().nullable(),
  contactId: z.string().nullable(),
  contactName: z.string().nullable(),
  contactHandle: z.string().nullable(),
});

export type ConversationDetail = z.infer<typeof conversationDetailSchema>;
