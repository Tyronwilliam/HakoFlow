import type { Channel } from "@/components/shared/channel-badge";

export type Message = {
  id: string;
  channel: Channel;
  from: string;
  subject: string;
  preview: string;
  receivedAt: string;
  read: boolean;
};
