import { Channel } from "../../types/shared";

export interface Message {
  id: string;
  channel: Channel;
  externalId: string;
  from: string;
  fromHandle: string;
  subject?: string; // Gmail uniquement
  content: string;
  preview: string; // 60 chars max
  direction: "inbound" | "outbound";
  sentAt: Date;
  read: boolean;
  attachmentUrls: string[];
}
