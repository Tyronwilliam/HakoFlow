import type { ChannelListType } from "./channels";

export interface MessageRow {
  attachment_urls: string[];
  channel: ChannelListType;
  content: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  expires_at: string | null;
  external_id: string | null;
  id: string;
  read_at: string | null;
  sent_at: string;
  status: "draft" | "sent" | "delivered" | "read" | "error";
}
