import { ChannelListType } from "../../types";

export interface MessageRow {
  id: string;
  channel: ChannelListType;
  direction: MessageDirectionType;
  content: string;
  status: MessageStatusType;
  sent_at: string;
  read_at: string | null;
  expires_at: string | null;
  conversation_id: string;
  external_id: string | null;
  attachment_urls: string[];
}

export const MESSAGE_DIRECTION = {
  INBOUND: "inbound",
  OUTBOUND: "outbound",
} as const;

export const MESSAGE_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
  ERROR: "error",
} as const;

export type MessageDirectionType = (typeof MESSAGE_DIRECTION)[keyof typeof MESSAGE_DIRECTION];
export type MessageStatusType = (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS];
