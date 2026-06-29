import type { ChannelListType } from "./channels";

export interface ConversationRow {
  contact_id: string | null;
  created_at: string;
  external_id: string | null;
  id: string;
  is_archived: boolean;
  is_pinned: boolean;
  is_starred: boolean;
  last_message_at: string | null;
  last_message_preview: string | null;
  primary_channel: ChannelListType;
  unread_count: number;
  workspace_id: string;
}
